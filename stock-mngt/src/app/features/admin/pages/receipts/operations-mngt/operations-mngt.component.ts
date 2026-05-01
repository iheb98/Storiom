import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  faEdit, faEye, faTrash, faPlus, faFilter, faUndo, faBox, faTag,
  faCoins, faCubes, faCalendar, faSearch, faExchangeAlt, faShoppingCart,
  faTruck, faUndoAlt, faTimesCircle
} from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/core/services/auth.service';

import { ReceiptService } from 'src/app/core/services/receipt.service';
import { StoreService } from 'src/app/core/services/store.service';
import { SupplierService } from 'src/app/core/services/supplier.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-operations-mngt',
  templateUrl: './operations-mngt.component.html',
  styleUrls: ['./operations-mngt.component.scss'],
  providers: [DatePipe],
})
export class OperationsMngtComponent implements OnInit {

  // Filters
  minTotalFilter;
  maxTotalFilter;
  minPriceFilter;
  maxPriceFilter;
  minAmountFilter;
  maxAmountFilter;
  fromDateFilter;
  toDateFilter;
  productName;
  typeFilter;
  types = [{ value: "LOADED", label: "Chargé" }, { value: "SOLD", label: "Vendu" }, { value: "RETURNED", label: "Retourné" }, { value: "CANCELLED", label: "Annulé" }];

  // Data
  suppliers = [];
  count = 0;
  operations = [];
  store;

  // Icons
  faTrash = faTrash;
  faEdit = faEdit;
  faEye = faEye;
  faPlus = faPlus;
  faFilter = faFilter;
  faUndo = faUndo;
  faBox = faBox;
  faTag = faTag;
  faCoins = faCoins;
  faCubes = faCubes;
  faCalendar = faCalendar;
  faSearch = faSearch;
  faExchangeAlt = faExchangeAlt;
  faShoppingCart = faShoppingCart;
  faTruck = faTruck;
  faUndoAlt = faUndoAlt;
  faTimesCircle = faTimesCircle;

  // Pagination
  currentPage = 0;
  currentSize = 5;

  // UI State
  filtersCollapsed = true;

  // Loading States
  isLoading = true;
  isActionLoading = false;

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
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'auto' });
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    }, 0);
    this.restoreFiltersState();
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
      this.getOperations(this.currentPage, this.currentSize),
      this.countOperations()
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

  getOperations(page, size): Promise<void> {
    return new Promise((resolve) => {
      this.receiptService.getOperations({
        page,
        size,
        query: this.buildQuery(),
      }).subscribe(
        response => {
          this.operations = response;
          resolve();
        },
        error => {
          resolve();
        }
      );
    });
  }

  countOperations(): Promise<void> {
    return new Promise((resolve) => {
      this.receiptService.countOperationsByStoreId({
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
    this.getOperations(this.currentPage, this.currentSize).then(() => {
      this.isLoading = false;
    });
  }

  filter() {
    this.isLoading = true;
    Promise.all([
      this.getOperations(this.currentPage, this.currentSize),
      this.countOperations()
    ]).then(() => {
      this.isLoading = false;
    });
  }

  create() {
    this.router.navigate(['/products']);
  }

  reset() {
    this.minTotalFilter = null;
    this.maxTotalFilter = null;
    this.minPriceFilter = null;
    this.maxPriceFilter = null;
    this.minAmountFilter = null;
    this.maxAmountFilter = null;
    this.fromDateFilter = null;
    this.toDateFilter = null;
    this.productName = null;
    this.typeFilter = null;
    this.clearFiltersState();
    this.filter();
  }

  buildQuery() {
    let query = "";
    if (this.typeFilter)
      query += query ? ",type ~ '" + this.typeFilter + "'" : "type ~ '" + this.typeFilter + "'";
    if (this.productName)
      query += query ? ",product.name ~ '" + this.productName + "'" : "product.name ~ '" + this.productName + "'";
    if (this.minTotalFilter)
      query += query ? ",total > '" + this.minTotalFilter + "'" : "total > '" + this.minTotalFilter + "'";
    if (this.maxTotalFilter)
      query += query ? ",total < '" + this.maxTotalFilter + "'" : "total < '" + this.maxTotalFilter + "'";
    if (this.minPriceFilter)
      query += query ? ",price > '" + this.minPriceFilter + "'" : "price > '" + this.minPriceFilter + "'";
    if (this.maxPriceFilter)
      query += query ? ",price < '" + this.maxPriceFilter + "'" : "price < '" + this.maxPriceFilter + "'";
    if (this.minAmountFilter)
      query += query ? ",amount > '" + this.minAmountFilter + "'" : "amount > '" + this.minAmountFilter + "'";
    if (this.maxAmountFilter)
      query += query ? ",amount < '" + this.maxAmountFilter + "'" : "amount < '" + this.maxAmountFilter + "'";
    if (this.fromDateFilter)
      query += query ? ",date > '" + this.fromDateFilter + "'" : "date > '" + this.fromDateFilter + "'";
    if (this.toDateFilter)
      query += query ? ",date < '" + this.toDateFilter + "'" : "date < '" + this.toDateFilter + "'";

    return query;
  }

  deleteOperation(operation) {
    Swal.fire({
      title: 'Supprimer cette opération ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Supprimer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#c62828'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isActionLoading = true;
        this.receiptService.deleteOperation(operation.id).subscribe(
          response => {
            this.isActionLoading = false;
            Swal.fire({
              icon: 'success',
              title: 'Opération supprimée !',
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

  viewOperation(receipt) {
    this.saveFiltersState();
    this.router.navigate(['operations/view/' + receipt.id]);
  }

  editOperation(operation: any) {
    this.saveFiltersState();
    this.router.navigate(['operations/edit/' + operation.id]);
  }

  // ========================================
  // Filter State Persistence
  // ========================================
  private readonly STORAGE_KEY = 'operations_filters_state';

  private saveFiltersState() {
    const state = {
      minTotalFilter: this.minTotalFilter,
      maxTotalFilter: this.maxTotalFilter,
      minPriceFilter: this.minPriceFilter,
      maxPriceFilter: this.maxPriceFilter,
      minAmountFilter: this.minAmountFilter,
      maxAmountFilter: this.maxAmountFilter,
      fromDateFilter: this.fromDateFilter,
      toDateFilter: this.toDateFilter,
      productName: this.productName,
      typeFilter: this.typeFilter,
      currentPage: this.currentPage,
      currentSize: this.currentSize,
      filtersCollapsed: this.filtersCollapsed
    };
    sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
  }

  private restoreFiltersState() {
    const saved = sessionStorage.getItem(this.STORAGE_KEY);
    if (!saved) return;

    try {
      const state = JSON.parse(saved);
      this.minTotalFilter = state.minTotalFilter ?? null;
      this.maxTotalFilter = state.maxTotalFilter ?? null;
      this.minPriceFilter = state.minPriceFilter ?? null;
      this.maxPriceFilter = state.maxPriceFilter ?? null;
      this.minAmountFilter = state.minAmountFilter ?? null;
      this.maxAmountFilter = state.maxAmountFilter ?? null;
      this.fromDateFilter = state.fromDateFilter ?? null;
      this.toDateFilter = state.toDateFilter ?? null;
      this.productName = state.productName ?? null;
      this.typeFilter = state.typeFilter ?? null;
      this.currentPage = state.currentPage ?? 0;
      this.currentSize = state.currentSize ?? 5;
      this.filtersCollapsed = state.filtersCollapsed ?? true;

      sessionStorage.removeItem(this.STORAGE_KEY);
    } catch (e) {
      sessionStorage.removeItem(this.STORAGE_KEY);
    }
  }

  private clearFiltersState() {
    sessionStorage.removeItem(this.STORAGE_KEY);
  }
}
