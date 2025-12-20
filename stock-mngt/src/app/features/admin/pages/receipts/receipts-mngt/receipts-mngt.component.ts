import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { faEdit, faFilePdf, faEye, faPrint, faTrash } from '@fortawesome/free-solid-svg-icons';
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
  minTotalFilter;
  maxTotalFilter;
  fromDateFilter;
  toDateFilter;
  nameFilter;
  codeFilter;
  supplierFilter;
  types = [{ value: "LOADED", label: "Chargé" }, { value: "SOLD", label: "Vendu" }, { value: "RETURNED", label: "Retourné" }]
  typeFilter;
  suppliers = [];
  count;
  receipts = [];
  store;

  faTrash = faTrash;
  faEye = faEye;
  pdfIcon = faFilePdf
  printIcon = faPrint

  currentPage = 0;
  currentSize = 5;
  filtersCollapsed = true;

  toggleFilters() {
    this.filtersCollapsed = !this.filtersCollapsed;
  }

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
    this.storeService.getStore(this.authService.getConnectedUser()?.store).subscribe(
      response => {
        this.store = response
      }
    )
    this.getSuppliers()
    this.getReceipts(0, 5);
    this.countReceipts();
  }


  getSuppliers() {

    this.supplierService.getAllSuppliersByStoreId(this.authService.getConnectedUser()?.store).subscribe(
      response => {

        this.suppliers = response
        console.log(this.suppliers)
      },
      error => {

      }
    )
  }
  getReceipts(page, size) {

    this.receiptService.getReceiptsByStoreId(this.authService.getConnectedUser()?.store, {
      page,
      size,
      query: this.buildQuery(),
    }).subscribe(
      response => {

        this.receipts = response
      },
      error => {

      }
    )
  }

  countReceipts() {

    this.receiptService.countReceiptsByStoreId(this.authService.getConnectedUser()?.store, {
      query: this.buildQuery()
    }).subscribe(response => {

      this.count = response;
    },
      error => {

      })
  }

  handlePageEvent(event) {
    this.currentPage = event.pageIndex;
    this.currentSize = event.pageSize;
    this.getReceipts(this.currentPage, this.currentSize)
  }

  filter() {
    this.getReceipts(this.currentPage, this.currentSize)
    this.countReceipts();
  }

  create() {
    this.router.navigate(['/receipts/add'])
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
    this.getReceipts(this.currentPage, this.currentSize)
    this.countReceipts();
  }

  buildQuery() {
    let query = "";
    if (this.typeFilter)
      query += query ? ",type ~ '" + this.typeFilter + "'" : "type ~ '" + this.typeFilter + "'"
    if (this.codeFilter)
      query += query ? ",code ~ '" + this.codeFilter + "'" : "code ~ '" + this.codeFilter + "'"
    if (this.nameFilter)
      query += query ? ",name ~ '" + this.nameFilter + "'" : "name ~ '" + this.nameFilter + "'"
    if (this.supplierFilter)
      query += query ? ",supplierId = '" + this.supplierFilter + "'" : "supplierId = '" + this.supplierFilter + "'"
    if (this.minTotalFilter)
      query += query ? ",total > '" + this.minTotalFilter + "'" : "total > '" + this.minTotalFilter + "'"
    if (this.maxTotalFilter)
      query += query ? ",total < '" + this.maxTotalFilter + "'" : "total < '" + this.maxTotalFilter + "'"
    if (this.fromDateFilter)
      query += query ? ",date > '" + this.fromDateFilter + "'" : "date > '" + this.fromDateFilter + "'"
    if (this.toDateFilter)
      query += query ? ",date < '" + this.toDateFilter + "'" : "date < '" + this.toDateFilter + "'"

    return query
  }


  deleteReceipt(receipt) {
    Swal.fire({
      title: 'Etes vous sûr de vouloir supprimer la facture ' + receipt.code + ' ?',
      denyButtonText: `Annuler`,
      showDenyButton: true,
      confirmButtonText: 'Supprimer',
    }).then((result) => {
      if (result.isConfirmed) {

        this.receiptService.deleteReceipt(receipt.id).subscribe(response => {

          Swal.fire({
            icon: 'success',
            title: 'Facture supprimée !',
            showConfirmButton: false,
            timer: 1500
          })
          this.getReceipts(this.currentPage, this.currentSize)
          this.countReceipts()
        })
      }
    })
  }

  viewReceipt(receipt) {
    this.router.navigate(['receipts/view/' + receipt.id])
  }
  // State for printing
  printingReceipt = null;
  @ViewChild('printingInvoice') printingInvoice!: ElementRef;

  downloadAsPDF(id) {
    //
    this.receiptService.getReceipt(id).subscribe(receipt => {
      this.printingReceipt = receipt;

      // Give Angular a moment to render the hidden component with new data
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
              this.printingReceipt = null; // Cleanup

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
      }, 500); // 500ms delay to ensure rendering
    }, error => {
      console.error("Receipt Fetch Error:", error);

      Swal.fire('Erreur', 'Impossible de charger la facture.', 'error');
    })
  }
}
