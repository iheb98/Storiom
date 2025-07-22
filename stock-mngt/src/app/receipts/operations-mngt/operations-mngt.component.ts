import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { faEye, faTrash } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/services/auth.service';
import { LoadingService } from 'src/app/services/loading.service';
import { ReceiptService } from 'src/app/services/receipt.service';
import { StoreService } from 'src/app/services/store.service';
import { SupplierService } from 'src/app/services/supplier.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-operations-mngt',
  templateUrl: './operations-mngt.component.html',
  styleUrls: ['./operations-mngt.component.scss'],
  providers: [DatePipe],

})
export class OperationsMngtComponent implements OnInit {
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
  operations = [];
  store;

  faTrash = faTrash;
  faEye = faEye;
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
    this.getOperations(0, 5);
    this.countOperations();
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
  getOperations(page, size) {
    this.loadingService.screenLoading()
    this.receiptService.getOperations({
      page,
      size,
      query: this.buildQuery(),
    }).subscribe(
      response => {
        this.loadingService.screenLoaded()
        this.operations = response
      },
      error => {
        this.loadingService.screenLoaded()
      }
    )
  }

  countOperations() {
    this.loadingService.screenLoading()
    this.receiptService.countOperationsByStoreId({
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
    this.getOperations(this.currentPage, this.currentSize)
  }

  filter() {
    this.getOperations(this.currentPage, this.currentSize)
    this.countOperations();
  }

  create() {
    this.router.navigate(['/products'])
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
    this.getOperations(this.currentPage, this.currentSize)
    this.countOperations();
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


  deleteOperation(receipt) {
    Swal.fire({
      title: 'Etes vous sûr de vouloir supprimer la facture ' + receipt.code + ' ?',
      denyButtonText: `Annuler`,
      showDenyButton: true,
      confirmButtonText: 'Supprimer',
    }).then((result) => {
      if (result.isConfirmed) {
        this.loadingService.screenLoading()
        /*this.receiptService.deleteOperation(receipt.id).subscribe(response => {
          this.loadingService.screenLoaded();
          Swal.fire({
            icon: 'success',
            title: 'Facture supprimée !',
            showConfirmButton: false,
            timer: 1500
          })
          this.getOperations(this.currentPage, this.currentSize)
          this.countOperations()
        })*/
      }
    })
  }

  viewOperation(receipt) {
    this.router.navigate(['operations/view/' + receipt.id])
  }

}
