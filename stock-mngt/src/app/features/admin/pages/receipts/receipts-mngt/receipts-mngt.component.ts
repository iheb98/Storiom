import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  faEdit, faFilePdf, faEye, faPrint, faTrash, faPlus, faFilter, faUndo,
  faHashtag, faUser, faTruck, faTag, faCalendar, faCoins, faSearch,
  faReceipt, faShoppingCart, faUndoAlt, faFileInvoice
} from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/core/services/auth.service';

import { ReceiptService } from 'src/app/core/services/receipt.service';
import { SupplierService } from 'src/app/core/services/supplier.service';
import { ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import Swal from 'sweetalert2';
declare var require: any;
import * as html2pdf from 'html2pdf.js';

import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { StoreService } from 'src/app/core/services/store.service';
import { DatePipe } from '@angular/common';
const htmlToPdfmake = require("html-to-pdfmake");
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-receipts-mngt',
  templateUrl: './receipts-mngt.component.html',
  styleUrls: ['./receipts-mngt.component.scss'],
  providers: [DatePipe],
})
export class ReceiptsMngtComponent implements OnInit {

  @ViewChild('receiptSection')
  receiptSection!: ElementRef;

  // Filters
  minTotalFilter;
  maxTotalFilter;
  fromDateFilter;
  toDateFilter;
  nameFilter;
  codeFilter;
  supplierFilter;
  typeFilter;
  types = [{ value: "LOADED", label: "Chargé" }, { value: "SOLD", label: "Vendu" }, { value: "RETURNED", label: "Retourné" }];
  suppliers = [];

  // Data
  count = 0;
  receipts = [];
  store;

  // Icons
  faTrash = faTrash;
  faEye = faEye;
  pdfIcon = faFilePdf;
  printIcon = faPrint;
  faPlus = faPlus;
  faFilter = faFilter;
  faUndo = faUndo;
  faHashtag = faHashtag;
  faUser = faUser;
  faTruck = faTruck;
  faTag = faTag;
  faCalendar = faCalendar;
  faCoins = faCoins;
  faSearch = faSearch;
  faReceipt = faReceipt;
  faShoppingCart = faShoppingCart;
  faUndoAlt = faUndoAlt;
  faFileInvoice = faFileInvoice;

  // Pagination
  currentPage = 0;
  currentSize = 5;

  // UI State
  filtersCollapsed = true;

  // Loading States
  isLoading = true;
  isActionLoading = false;

  // State for printing
  printingReceipt = null;
  @ViewChild('printingInvoice') printingInvoice!: ElementRef;

  constructor(
    private supplierService: SupplierService,
    private authService: AuthService,
    private receiptService: ReceiptService,
    private storeService: StoreService,
    private router: Router,
    private datePipe: DatePipe,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.storeService.getStore(this.authService.getConnectedUser()?.store).subscribe(
      response => {
        this.store = response;
      }
    );
    this.getSuppliers();

    Promise.all([
      this.getReceipts(0, 5),
      this.countReceipts()
    ]).then(() => {
      this.isLoading = false;
    });
  }

  toggleFilters() {
    this.filtersCollapsed = !this.filtersCollapsed;
  }

  getSuppliers() {
    this.supplierService.getAllSuppliersByStoreId(this.authService.getConnectedUser()?.store).subscribe(
      response => {
        this.suppliers = response;
      },
      error => { }
    );
  }

  getReceipts(page, size): Promise<void> {
    return new Promise((resolve) => {
      this.receiptService.getReceiptsByStoreId(this.authService.getConnectedUser()?.store, {
        page,
        size,
        query: this.buildQuery(),
      }).subscribe(
        response => {
          this.receipts = response;
          resolve();
        },
        error => {
          resolve();
        }
      );
    });
  }

  countReceipts(): Promise<void> {
    return new Promise((resolve) => {
      this.receiptService.countReceiptsByStoreId(this.authService.getConnectedUser()?.store, {
        query: this.buildQuery()
      }).subscribe(
        response => {
          this.count = response;
          resolve();
        },
        error => {
          resolve();
        }
      );
    });
  }

  handlePageEvent(event) {
    this.currentPage = event.pageIndex;
    this.currentSize = event.pageSize;
    this.isLoading = true;
    this.getReceipts(this.currentPage, this.currentSize).then(() => {
      this.isLoading = false;
    });
  }

  filter() {
    this.isLoading = true;
    Promise.all([
      this.getReceipts(this.currentPage, this.currentSize),
      this.countReceipts()
    ]).then(() => {
      this.isLoading = false;
    });
  }

  create() {
    this.router.navigate(['/receipts/add']);
  }

  reset() {
    this.minTotalFilter = null;
    this.maxTotalFilter = null;
    this.fromDateFilter = null;
    this.toDateFilter = null;
    this.nameFilter = null;
    this.codeFilter = null;
    this.supplierFilter = null;
    this.typeFilter = null;
    this.filter();
  }

  buildQuery() {
    let query = "";
    if (this.typeFilter)
      query += query ? ",type ~ '" + this.typeFilter + "'" : "type ~ '" + this.typeFilter + "'";
    if (this.codeFilter)
      query += query ? ",code ~ '" + this.codeFilter + "'" : "code ~ '" + this.codeFilter + "'";
    if (this.nameFilter)
      query += query ? ",name ~ '" + this.nameFilter + "'" : "name ~ '" + this.nameFilter + "'";
    if (this.supplierFilter)
      query += query ? ",supplierId = '" + this.supplierFilter + "'" : "supplierId = '" + this.supplierFilter + "'";
    if (this.minTotalFilter)
      query += query ? ",total > '" + this.minTotalFilter + "'" : "total > '" + this.minTotalFilter + "'";
    if (this.maxTotalFilter)
      query += query ? ",total < '" + this.maxTotalFilter + "'" : "total < '" + this.maxTotalFilter + "'";
    if (this.fromDateFilter)
      query += query ? ",date > '" + this.fromDateFilter + "'" : "date > '" + this.fromDateFilter + "'";
    if (this.toDateFilter)
      query += query ? ",date < '" + this.toDateFilter + "'" : "date < '" + this.toDateFilter + "'";

    return query;
  }

  deleteReceipt(receipt) {
    Swal.fire({
      title: 'Supprimer cette facture ?',
      text: `#${receipt.code}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Supprimer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#c62828'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isActionLoading = true;
        this.receiptService.deleteReceipt(receipt.id).subscribe(
          response => {
            this.isActionLoading = false;
            Swal.fire({
              icon: 'success',
              title: 'Facture supprimée !',
              showConfirmButton: false,
              timer: 1500
            });
            this.filter();
          },
          error => {
            this.isActionLoading = false;
            Swal.fire({
              icon: 'error',
              title: 'Erreur lors de la suppression',
              showConfirmButton: false,
              timer: 1500
            });
          }
        );
      }
    });
  }

  viewReceipt(receipt) {
    this.router.navigate(['receipts/view/' + receipt.id]);
  }

  downloadAsPDF(id) {
    this.receiptService.getReceipt(id).subscribe(receipt => {
      this.printingReceipt = receipt;

      setTimeout(() => {
        try {
          const content = this.printingInvoice.nativeElement;
          const options = {
            margin: [0, 0, 0, 0],
            filename: this.printingReceipt?.code + '.pdf',
            image: { type: 'png', quality: 0.98 },
            html2canvas: { scale: 2, windowWidth: 1200 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
          };

          html2pdf()
            .from(content)
            .set(options)
            .save()
            .then(() => {
              this.printingReceipt = null;
            })
            .catch((err) => {
              console.error("PDF Generation Error:", err);
              this.printingReceipt = null;
              Swal.fire('Erreur', 'Erreur lors de la génération du PDF.', 'error');
            });
        } catch (e) {
          console.error("PDF Setup Error:", e);
          this.printingReceipt = null;
          Swal.fire('Erreur', 'Erreur lors de la préparation du PDF.', 'error');
        }
      }, 500);
    }, error => {
      console.error("Receipt Fetch Error:", error);
      Swal.fire('Erreur', 'Impossible de charger la facture.', 'error');
    });
  }
}
