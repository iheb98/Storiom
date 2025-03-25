import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { faEdit, faFilePdf, faEye, faPrint, faTrash } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/services/auth.service';
import { LoadingService } from 'src/app/services/loading.service';
import { ReceiptService } from 'src/app/services/receipt.service';
import { SupplierService } from 'src/app/services/supplier.service';
import { ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import Swal from 'sweetalert2';
declare var require: any;
import * as html2pdf from 'html2pdf.js';

import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { StoreService } from 'src/app/services/store.service';
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
    private loadingService: LoadingService,
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
    this.loadingService.screenLoading()
    this.supplierService.getAllSuppliersByStoreId(this.authService.getConnectedUser()?.store).subscribe(
      response => {
        this.loadingService.screenLoaded()
        this.suppliers = response
        console.log(this.suppliers)
      },
      error => {
        this.loadingService.screenLoaded()
      }
    )
  }
  getReceipts(page, size) {
    this.loadingService.screenLoading()
    this.receiptService.getReceiptsByStoreId(this.authService.getConnectedUser()?.store, {
      page,
      size,
      query: this.buildQuery(),
    }).subscribe(
      response => {
        this.loadingService.screenLoaded()
        this.receipts = response
      },
      error => {
        this.loadingService.screenLoaded()
      }
    )
  }

  countReceipts() {
    this.loadingService.screenLoading()
    this.receiptService.countReceiptsByStoreId(this.authService.getConnectedUser()?.store, {
      query: this.buildQuery()
    }).subscribe(response => {
      this.loadingService.screenLoaded()
      this.count = response;
    },
    error => {
      this.loadingService.screenLoaded()
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
        this.loadingService.screenLoading()
        this.receiptService.deleteReceipt(receipt.id).subscribe(response => {
          this.loadingService.screenLoaded();
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
  downloadAsPDF(id) {
    this.receiptService.getReceipt(id).subscribe(receipt => {
      let operations = ''
      receipt?.operations?.forEach(operation => {
        operations += `<tr>
         <td>${operation?.product?.name}</td>
         <td>${operation?.amount}</td>
         <td>${operation?.price ? operation?.price + " DT" : ""}</td>
         <td>${(operation?.price * operation?.amount) + " DT"}</td>
     </tr>`
      });
      const content = `
      <head>
      <style>
      body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 0;
    background-color: #f4f4f4;
    color: #333;
}

.invoice-container {
    max-width: 800px;
    margin: 50px auto;
    background-color: #fff;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.invoice-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid #343a40 ;
    padding-bottom: 20px;
}

.invoice-header img {
    max-width: 150px;
}

.invoice-header h1 {
    font-size: 24px;
    color: #343a40 ;
}

.invoice-details {
    margin: 20px 0;
}

.invoice-details div {
    margin-bottom: 10px;
}

.invoice-details .details-label {
    font-weight: bold;
}

.invoice-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
}

.invoice-table th,
.invoice-table td {
    padding: 15px;
    text-align: left;
    border-bottom: 1px solid #ddd;
}

.invoice-table th {
    background-color: #343a40 ;
    color: #fff;
}

.invoice-total {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 20px;
}

.invoice-total div {
    width: 200px;
    display: flex;
    justify-content: space-between;
}

.invoice-footer {
    text-align: center;
    color: #888;
    font-size: 12px;
    border-top: 1px solid #ddd;
    padding-top: 20px;
}

.invoice-info {
    display: flex;
    justify-content: space-between;
    margin: 20px 0;
}

.invoice-details {
    width: 48%;
}

.store-contact {
    width: 48%;
    text-align: right;
}

.store-contact p {
    margin: 2px 0;
    font-size: 14px;
    color: #555;
}

.bold-text{
font-weight: bold;
}

      </style>
      </head>
      <div id="receiptSection" #receiptSection>
      <div class="invoice-container">
    <div class="invoice-header">
        <div class="company-details">
          <h4><strong>${this.store?.name}</strong></h4>
        </div>
        <div class="invoice-title">
            <h1>Facture</h1>
        </div>
    </div>

    <div class="invoice-info">
        <div class="invoice-details">
            <div><span class="details-label">Numéro de la facture:</span> ${receipt?.code}</div>
            <div><span class="details-label">Date:</span> ${this.datePipe.transform(receipt?.date, 'shortDate')}</div>
            <div><span class="details-label">Nom du client:</span>
                ${receipt?.name ? receipt?.name :
          (receipt?.supplier?.firstName ? receipt?.supplier?.firstName : "") + " " +
          (receipt?.supplier?.lastName ? receipt?.supplier?.lastName : "")}
            </div>
        </div>

        <div class="invoice-details" style="text-align:left">
            <div> <span class="details-label">Addresse: </span> ${receipt?.store?.address?.state + ' ' + receipt?.store?.address?.city} </div>
            <div><span class="details-label">Email: </span> ${this.store?.email}</div>
            <div><span class="details-label">téléphone:</span> ${this.store?.phone}</div>
        </div>
    </div>

    <table class="invoice-table">
        <thead>
            <tr>
                <th>Description</th>
                <th>Quantité</th>
                <th>Prix Unité</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>
            ${operations}
        </tbody>
    </table>

    <div class="invoice-total">
        <div>
            <div class="bold-text">Subtotal:</div>
            <div>${receipt?.total - (receipt?.tva * receipt?.total / 100) + " DT"}</div>
        </div>
        <div>
            <div class="bold-text">Tax ${receipt?.tva}%:</div>
            <div>${receipt?.tva * receipt?.total / 100 + " DT"}</div>
        </div>
        <div>
            <div class="bold-text">Total:</div>
            <div>${receipt?.total + " DT"}</div>
        </div>
    </div>
</div>
  </div>`;
      const options = {
        margin: [10, 20, 10, 20],
        filename: receipt?.code + '.pdf',
        image: { type: 'png', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      html2pdf().from(content).set(options).save();
    })

  }
}
