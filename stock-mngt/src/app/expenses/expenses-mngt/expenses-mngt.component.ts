import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/services/auth.service';
import { ExpenseService } from 'src/app/services/expense.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-expenses-mngt',
  templateUrl: './expenses-mngt.component.html',
  styleUrls: ['./expenses-mngt.component.scss']
})
export class ExpensesMngtComponent implements OnInit {


  faTrash = faTrash;
  faEdit = faEdit;

  titleFilter = ''
  commentFilter = ''
  emailFilter = ''
  phoneFilter = ''
  minAmountFilter = null
  maxAmountFilter = null
  fromDateFilter = null
  toDateFilter = null
  expenses
  count;
  loading;

  currentPage = 0;
  currentSize = 5;
  constructor(
    private expenseService: ExpenseService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.countExpensess();
    this.getExpenses(0, 5);
    this.loading = false;
  }

  filter() {
    this.getExpenses(this.currentPage, this.currentSize)
    this.countExpensess()
  }

  reset() {
    this.titleFilter = ''
    this.commentFilter = ''
    this.emailFilter = ''
    this.phoneFilter = ''
    this.minAmountFilter = ''
    this.maxAmountFilter = ''
    this.fromDateFilter = null
    this.toDateFilter = null
    
    this.filter()
  }

  buildQuery() {
    let query = "";
    if (this.titleFilter)
      query += query ? ",title ~ '" + this.titleFilter + "'" : "title ~ '" + this.titleFilter + "'"
    if (this.commentFilter)
      query += query ? ",comment ~ '" + this.commentFilter + "'" : "comment ~ '" + this.commentFilter + "'"
    if (this.minAmountFilter)
      query += query ? ",amount > '" + this.minAmountFilter + "'" : "amount > '" + this.minAmountFilter + "'"
    if (this.maxAmountFilter)
      query += query ? ",amount < '" + this.maxAmountFilter + "'" : "amount < '" + this.maxAmountFilter + "'"
    if (this.fromDateFilter)
      query += query ? ",date > '" + this.fromDateFilter + "'" : "date > '" + this.fromDateFilter + "'"
    if (this.toDateFilter)
      query += query ? ",date < '" + this.toDateFilter + "'" : "date < '" + this.toDateFilter + "'"
    
    return query
  }

  create() {
    this.router.navigate(['/expenses/add'])
  }

  getExpenses(page, size) {
    this.loading = true;
    this.expenseService.getExpensesByStoreId(this.authService.getConnectedUser()?.store, {
      page,
      size,
      query: this.buildQuery()
    }).subscribe(response => {
      this.loading = false;
      this.expenses = response;
    }, error => {
      this.loading = false;
      Swal.fire({
        icon: 'error',
        title: 'Une erreur est survenue ! Merci de réessayer plus tard',
        showConfirmButton: false,
        timer: 1500
      })
    });
  }

  countExpensess() {
    this.loading = true;
    this.expenseService.countExpensesByStoreId(this.authService.getConnectedUser()?.store, {
      query: this.buildQuery()
    }).subscribe(response => {
      this.loading = false;
      this.count = response;
    }, error => {
      this.loading = false;
      Swal.fire({
        icon: 'error',
        title: 'Une erreur est survenue ! Merci de réessayer plus tard',
        showConfirmButton: false,
        timer: 1500
      })
    })
  }

  deleteExpense(borrower) {
    Swal.fire({
      title: 'Etes vous sûr de vouloir supprimer le crédit de ' + borrower.firstName + ' ' + borrower.lastName + ' ?',
      denyButtonText: `Annuler`,
      showDenyButton: true,
      confirmButtonText: 'Supprimer',
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        this.expenseService.deleteExpense(borrower.id).subscribe(response => {
          this.loading = false;
          Swal.fire({
            icon: 'success',
            title: 'Crédit supprimé !',
            showConfirmButton: false,
            timer: 1500
          })
          this.getExpenses(this.currentPage, this.currentSize)
        }, error => {
          this.loading = false;
          Swal.fire({
            icon: 'error',
            title: 'Une erreur est survenue ! Merci de réessayer plus tard',
            showConfirmButton: false,
            timer: 1500
          })
        })
      }
    })
  }

  editExpense(borrower) {
    this.router.navigate(['expenses/' + borrower.id])
  }

  handlePageEvent(event) {
    this.currentPage = event.pageIndex;
    this.currentSize = event.pageSize;
    this.getExpenses(this.currentPage, this.currentSize)
  }

}
