import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { SupplierService } from 'src/app/core/services/supplier.service';
import {
  faEdit, faTrash, faPlus, faFilter, faUndo, faUser, faPhone,
  faEnvelope, faCoins, faSearch, faTruck, faTruckLoading
} from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-suppliers-mngt',
  templateUrl: './suppliers-mngt.component.html',
  styleUrls: ['./suppliers-mngt.component.scss']
})
export class SuppliersMngtComponent implements OnInit {

  // Icons
  faTrash = faTrash;
  faEdit = faEdit;
  faPlus = faPlus;
  faFilter = faFilter;
  faUndo = faUndo;
  faUser = faUser;
  faPhone = faPhone;
  faEnvelope = faEnvelope;
  faCoins = faCoins;
  faSearch = faSearch;
  faTruck = faTruck;
  faTruckLoading = faTruckLoading;

  // Filters
  firstNameFilter = '';
  lastNameFilter = '';
  emailFilter = '';
  phoneFilter = '';
  minCreditFilter: number | null = null;
  maxCreditFilter: number | null = null;

  // Data
  suppliers: any[] = [];
  count = 0;

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
    private router: Router
  ) { }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    Promise.all([
      this.getSuppliers(0, 5),
      this.countSuppliers()
    ]).then(() => {
      this.isLoading = false;
    });
  }

  toggleFilters() {
    this.filtersCollapsed = !this.filtersCollapsed;
  }

  filter() {
    this.isLoading = true;
    Promise.all([
      this.getSuppliers(this.currentPage, this.currentSize),
      this.countSuppliers()
    ]).then(() => {
      this.isLoading = false;
    });
  }

  reset() {
    this.firstNameFilter = '';
    this.lastNameFilter = '';
    this.emailFilter = '';
    this.phoneFilter = '';
    this.minCreditFilter = null;
    this.maxCreditFilter = null;
    this.filter();
  }

  create() {
    this.router.navigate(['/suppliers/add']);
  }

  getSuppliers(page: number, size: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.supplierService.getSuppliersByStoreId(this.authService.getConnectedUser()?.store, {
        page,
        size,
        firstName: this.firstNameFilter,
        lastName: this.lastNameFilter,
        email: this.emailFilter,
        phone: this.phoneFilter,
        creditFrom: this.minCreditFilter,
        creditTo: this.maxCreditFilter,
      }).subscribe(
        response => {
          this.suppliers = response;
          resolve();
        },
        error => {
          Swal.fire({
            icon: 'error',
            title: 'Erreur lors du chargement des fournisseurs',
            showConfirmButton: false,
            timer: 2000
          });
          resolve();
        }
      );
    });
  }

  countSuppliers(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.supplierService.countSuppliersByStoreId(this.authService.getConnectedUser()?.store, {
        firstName: this.firstNameFilter,
        lastName: this.lastNameFilter,
        email: this.emailFilter,
        phone: this.phoneFilter,
        creditFrom: this.minCreditFilter,
        creditTo: this.maxCreditFilter,
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

  deleteSupplier(supplier: any) {
    Swal.fire({
      title: 'Supprimer ce fournisseur ?',
      text: `${supplier.firstName} ${supplier.lastName}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Supprimer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#c62828'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isActionLoading = true;
        this.supplierService.deleteSupplier(supplier.id).subscribe(
          response => {
            this.isActionLoading = false;
            Swal.fire({
              icon: 'success',
              title: 'Fournisseur supprimé !',
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

  editSupplier(supplier: any) {
    this.router.navigate(['suppliers/edit/' + supplier.id]);
  }

  handlePageEvent(event: any) {
    this.currentPage = event.pageIndex;
    this.currentSize = event.pageSize;
    this.isLoading = true;
    this.getSuppliers(this.currentPage, this.currentSize).then(() => {
      this.isLoading = false;
    });
  }
}
