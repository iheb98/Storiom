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
const htmlToPdfmake = require("html-to-pdfmake");
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-receipts-mngt',
  templateUrl: './receipts-mngt.component.html',
  styleUrls: ['./receipts-mngt.component.scss']
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
  constructor(
    private supplierService: SupplierService,
    private loadingService: LoadingService,
    private authService: AuthService,
    private receiptService: ReceiptService,
    private router: Router,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.store = this.authService.getConnectedUser()?.store
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
         <td>${operation?.price}</td>
         <td>${operation?.amount}</td>
         <td>${operation?.price * operation?.amount}</td>
     </tr>`
      });
      const content = `
      <head>
      <style>
      td {
        border-bottom: 2px solid #bbb;
        border-left: 2px solid #bbb;
        padding: 10px;
    }
    td:last-child {
        border-right: 2px solid #bbb;
        padding: 10px;
    }
    th {
        border-top: 2px solid #bbb;
        border-bottom: 2px solid #bbb;
        border-left: 2px solid #bbb;
        padding: 10px;
    }
    th:last-child {
        border-right: 2px solid #bbb;
        padding: 10px;
    }
    
    th {
        font-weight: normal;
    }
    
    .center th {
        text-align: center;
        font-weight: bold;
    }
    
    table {
        width: 100%;
        height: 100%;
    }
      </style>
      </head>
      <div id="receiptSection" #receiptSection>
      <div class="row">
          <div class="col-6 p-3">
  
              <div class="row">
                  <div class="col-12">
                      ${receipt?.store?.name}
                  </div>
              </div>
              <div class="row">
                  <div class="col-12">
                      ${receipt?.store?.address?.street}
  
                  </div>
              </div>
              <div class="row">
                  <div class="col-12">
                      ${receipt?.store?.address?.state + ' ' + receipt?.store?.address?.city}
                  </div>
  
              </div>
  
          </div>
  
  
          <div class="col-6 p-3">
              <div class="row">
                  <div class="col-12 col-md-3 store-info">
                      Tel :
                  </div>
                  <div class="col-12 col-md-9 store-info">
                      ${receipt?.store?.phone}
                  </div>
              </div>
              <div class="row">
                  <div class="col-12 col-md-3 store-info">
                      E-mail :
                  </div>
                  <div class="col-12 col-md-9 store-info">
                      ${receipt?.store?.email}
  
                  </div>
              </div>
              <div class="row">
                  <div class="col-12 col-md-3 store-info">
                      Site :
                  </div>
                  <div class="col-12 col-md-9 store-info">
                      ${receipt?.store?.site}
  
                  </div>
              </div>
          </div>
      </div>
      <div class="row">
          <div class="col-6 p-3">
              <table>
                  <tr>
                      <th>
                          Date ${receipt?.date}
                      </th>
                  </tr>
                  <tr>
                      <td>
                          Facture ${receipt?.code}
                      </td>
                  </tr>
              </table>
          </div>
          <div class="col-6 p-3">
              <table>
                  <tr>
                      <th class="align-center">
                          ${receipt?.type == 'LOADED' ? 'Fournisseur' : 'Client'}
                      </th>
                  </tr>
                  <tr>
                      <td>
                          ${receipt?.name ? receipt?.name : receipt?.supplier?.firstName + " " +
          receipt?.supplier?.lastName}
  
                      </td>
                  </tr>
              </table>
          </div>
      </div>
      <div class="row">
          <div class="col-12 p-3">
              <table class="table table-responsive table-hover">
                  <tr class="center">
                      <th>Désignation</th>
                      <th>Prix Unitaire</th>
                      <th>Quantité</th>
                      <th width="20%">Total</th>
                  </tr>
                  ${operations}
              </table>
          </div>
      </div>
      <div class="row">
          <div class="col-12 p-3">
              <table>
                  <tr>
                      <th>Total HT</th>
                      <th width="20%">${receipt?.total - (receipt?.tva * receipt?.total / 100)}</th>
                  </tr>
                  <tr>
                      <td>TVA ${receipt?.tva}</td>
                      <td width="20%">${receipt?.tva * receipt?.total / 100}</td>
                  </tr>
              </table>
          </div>
      </div>
      <div class="row">
          <div class="col-12 p-3">
              <table>
                  <tr>
                      <th>Total TTC</th>
                      <th width="20%">${receipt?.total}</th>
                  </tr>
  
              </table>
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
