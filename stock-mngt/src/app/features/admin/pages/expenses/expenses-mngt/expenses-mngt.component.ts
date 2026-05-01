import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  faEdit, faTrash, faPlus, faFilter, faUndo, faTag,
  faCoins, faSearch, faReceipt, faComment, faCalendar
} from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/core/services/auth.service';
import { ExpenseService } from 'src/app/core/services/expense.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-expenses-mngt',
  templateUrl: './expenses-mngt.component.html',
  styleUrls: ['./expenses-mngt.component.scss']
})
export class ExpensesMngtComponent implements OnInit {

  // Icons
  faTrash = faTrash;
  faEdit = faEdit;
  faPlus = faPlus;
  faFilter = faFilter;
  faUndo = faUndo;
  faTag = faTag;
  faCoins = faCoins;
  faSearch = faSearch;
  faReceipt = faReceipt;
  faComment = faComment;
  faCalendar = faCalendar;

  // Filters
  titleFilter = '';
  commentFilter = '';
  minAmountFilter: number | null = null;
  maxAmountFilter: number | null = null;
  fromDateFilter: string | null = null;
  toDateFilter: string | null = null;

  // Data
  expenses: any[] = [];
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
    private expenseService: ExpenseService,
    private authService: AuthService,
    private router: Router
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
    Promise.all([
      this.getExpenses(this.currentPage, this.currentSize),
      this.countExpenses()
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
      this.getExpenses(this.currentPage, this.currentSize),
      this.countExpenses()
    ]).then(() => {
      this.isLoading = false;
    });
  }

  reset() {
    this.titleFilter = '';
    this.commentFilter = '';
    this.minAmountFilter = null;
    this.maxAmountFilter = null;
    this.fromDateFilter = null;
    this.toDateFilter = null;
    this.clearFiltersState();
    this.filter();
  }

  buildQuery(): string {
    let query = "";
    if (this.titleFilter)
      query += query ? ",title ~ '" + this.titleFilter + "'" : "title ~ '" + this.titleFilter + "'";
    if (this.commentFilter)
      query += query ? ",comment ~ '" + this.commentFilter + "'" : "comment ~ '" + this.commentFilter + "'";
    if (this.minAmountFilter != null)
      query += query ? ",amount > '" + this.minAmountFilter + "'" : "amount > '" + this.minAmountFilter + "'";
    if (this.maxAmountFilter != null)
      query += query ? ",amount < '" + this.maxAmountFilter + "'" : "amount < '" + this.maxAmountFilter + "'";
    if (this.fromDateFilter)
      query += query ? ",date > '" + this.fromDateFilter + "'" : "date > '" + this.fromDateFilter + "'";
    if (this.toDateFilter)
      query += query ? ",date < '" + this.toDateFilter + "'" : "date < '" + this.toDateFilter + "'";
    return query;
  }

  create() {
    this.saveFiltersState();
    this.router.navigate(['/expenses/add']);
  }

  getExpenses(page: number, size: number): Promise<void> {
    return new Promise((resolve) => {
      this.expenseService.getExpensesByStoreId(this.authService.getConnectedUser()?.store, {
        page,
        size,
        query: this.buildQuery()
      }).subscribe(
        response => {
          this.expenses = response;
          resolve();
        },
        error => {
          Swal.fire({
            icon: 'error',
            title: 'Erreur lors du chargement des dépenses',
            showConfirmButton: false,
            timer: 2000
          });
          resolve();
        }
      );
    });
  }

  countExpenses(): Promise<void> {
    return new Promise((resolve) => {
      this.expenseService.countExpensesByStoreId(this.authService.getConnectedUser()?.store, {
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

  deleteExpense(expense: any) {
    Swal.fire({
      title: 'Supprimer cette dépense ?',
      text: expense.title,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Supprimer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#c62828'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isActionLoading = true;
        this.expenseService.deleteExpense(expense.id).subscribe(
          response => {
            this.isActionLoading = false;
            Swal.fire({
              icon: 'success',
              title: 'Dépense supprimée !',
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

  editExpense(expense: any) {
    this.saveFiltersState();
    this.router.navigate(['expenses/' + expense.id]);
  }

  handlePageEvent(event: any) {
    this.currentPage = event.pageIndex;
    this.currentSize = event.pageSize;
    this.isLoading = true;
    this.getExpenses(this.currentPage, this.currentSize).then(() => {
      this.isLoading = false;
    });
  }

  // ========================================
  // Filter State Persistence
  // ========================================
  private readonly STORAGE_KEY = 'expenses_filters_state';

  private saveFiltersState() {
    const state = {
      titleFilter: this.titleFilter,
      commentFilter: this.commentFilter,
      minAmountFilter: this.minAmountFilter,
      maxAmountFilter: this.maxAmountFilter,
      fromDateFilter: this.fromDateFilter,
      toDateFilter: this.toDateFilter,
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
      this.titleFilter = state.titleFilter || '';
      this.commentFilter = state.commentFilter || '';
      this.minAmountFilter = state.minAmountFilter ?? null;
      this.maxAmountFilter = state.maxAmountFilter ?? null;
      this.fromDateFilter = state.fromDateFilter ?? null;
      this.toDateFilter = state.toDateFilter ?? null;
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
