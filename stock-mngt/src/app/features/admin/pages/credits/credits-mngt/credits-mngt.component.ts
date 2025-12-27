import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  faEdit, faTrash, faPlus, faFilter, faUndo, faUser, faPhone,
  faCoins, faSearch, faHandHoldingUsd, faCalendarPlus, faCalendarCheck
} from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/core/services/auth.service';
import { CreditService } from 'src/app/core/services/credit.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-credits-mngt',
  templateUrl: './credits-mngt.component.html',
  styleUrls: ['./credits-mngt.component.scss']
})
export class CreditsMngtComponent implements OnInit {

  // Icons
  faTrash = faTrash;
  faEdit = faEdit;
  faPlus = faPlus;
  faFilter = faFilter;
  faUndo = faUndo;
  faUser = faUser;
  faPhone = faPhone;
  faCoins = faCoins;
  faSearch = faSearch;
  faHandHoldingUsd = faHandHoldingUsd;
  faCalendarPlus = faCalendarPlus;
  faCalendarCheck = faCalendarCheck;

  // Filters
  firstNameFilter = '';
  lastNameFilter = '';
  emailFilter = '';
  phoneFilter = '';
  minAmountFilter: number | null = null;
  maxAmountFilter: number | null = null;
  fromGivenDateFilter: string | null = null;
  toGivenDateFilter: string | null = null;
  fromReturnDateFilter: string | null = null;
  toReturnDateFilter: string | null = null;

  // Data
  borrowers: any[] = [];
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
    private creditService: CreditService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    Promise.all([
      this.getBorrowers(0, 5),
      this.countBorrowers()
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
      this.getBorrowers(this.currentPage, this.currentSize),
      this.countBorrowers()
    ]).then(() => {
      this.isLoading = false;
    });
  }

  reset() {
    this.firstNameFilter = '';
    this.lastNameFilter = '';
    this.emailFilter = '';
    this.phoneFilter = '';
    this.minAmountFilter = null;
    this.maxAmountFilter = null;
    this.fromGivenDateFilter = null;
    this.toGivenDateFilter = null;
    this.fromReturnDateFilter = null;
    this.toReturnDateFilter = null;
    this.filter();
  }

  buildQuery(): string {
    let query = "";
    if (this.firstNameFilter)
      query += query ? ",firstName ~ '" + this.firstNameFilter + "'" : "firstName ~ '" + this.firstNameFilter + "'";
    if (this.lastNameFilter)
      query += query ? ",lastName ~ '" + this.lastNameFilter + "'" : "lastName ~ '" + this.lastNameFilter + "'";
    if (this.emailFilter)
      query += query ? ",email ~ '" + this.emailFilter + "'" : "email ~ '" + this.emailFilter + "'";
    if (this.phoneFilter)
      query += query ? ",phone ~ '" + this.phoneFilter + "'" : "phone ~ '" + this.phoneFilter + "'";
    if (this.minAmountFilter != null)
      query += query ? ",amount > '" + this.minAmountFilter + "'" : "amount > '" + this.minAmountFilter + "'";
    if (this.maxAmountFilter != null)
      query += query ? ",amount < '" + this.maxAmountFilter + "'" : "amount < '" + this.maxAmountFilter + "'";
    if (this.fromGivenDateFilter)
      query += query ? ",givenDate > '" + this.fromGivenDateFilter + "'" : "givenDate > '" + this.fromGivenDateFilter + "'";
    if (this.toGivenDateFilter)
      query += query ? ",givenDate < '" + this.toGivenDateFilter + "'" : "givenDate < '" + this.toGivenDateFilter + "'";
    if (this.fromReturnDateFilter)
      query += query ? ",returnDate > '" + this.fromReturnDateFilter + "'" : "returnDate > '" + this.fromReturnDateFilter + "'";
    if (this.toReturnDateFilter)
      query += query ? ",returnDate < '" + this.toReturnDateFilter + "'" : "returnDate < '" + this.toReturnDateFilter + "'";
    return query;
  }

  create() {
    this.router.navigate(['/credits/add']);
  }

  getBorrowers(page: number, size: number): Promise<void> {
    return new Promise((resolve) => {
      this.creditService.getBorrowersByStoreId(this.authService.getConnectedUser()?.store, {
        page,
        size,
        query: this.buildQuery()
      }).subscribe(
        response => {
          this.borrowers = response;
          resolve();
        },
        error => {
          Swal.fire({
            icon: 'error',
            title: 'Erreur lors du chargement des crédits',
            showConfirmButton: false,
            timer: 2000
          });
          resolve();
        }
      );
    });
  }

  countBorrowers(): Promise<void> {
    return new Promise((resolve) => {
      this.creditService.countBorrowersByStoreId(this.authService.getConnectedUser()?.store, {
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

  deleteBorrower(borrower: any) {
    Swal.fire({
      title: 'Supprimer ce crédit ?',
      text: `${borrower.firstName} ${borrower.lastName}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Supprimer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#c62828'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isActionLoading = true;
        this.creditService.deleteBorrower(borrower.id).subscribe(
          response => {
            this.isActionLoading = false;
            Swal.fire({
              icon: 'success',
              title: 'Crédit supprimé !',
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

  editBorrower(borrower: any) {
    this.router.navigate(['credits/' + borrower.id]);
  }

  handlePageEvent(event: any) {
    this.currentPage = event.pageIndex;
    this.currentSize = event.pageSize;
    this.isLoading = true;
    this.getBorrowers(this.currentPage, this.currentSize).then(() => {
      this.isLoading = false;
    });
  }
}
