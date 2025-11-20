import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/core/services/auth.service';
import { CreditService } from 'src/app/core/services/credit.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-credits-mngt',
  templateUrl: './credits-mngt.component.html',
  styleUrls: ['./credits-mngt.component.scss']
})
export class CreditsMngtComponent implements OnInit {


  faTrash = faTrash;
  faEdit = faEdit;

  firstNameFilter = ''
  lastNameFilter = ''
  emailFilter = ''
  phoneFilter = ''
  minAmountFilter = null
  maxAmountFilter = null
  fromGivenDateFilter = null
  toGivenDateFilter = null
  fromReturnDateFilter = null
  toReturnDateFilter = null
  entryDateFilter = null
  borrowers
  count;
  loading;

  currentPage = 0;
  currentSize = 5;
  filtersCollapsed = true;

  toggleFilters() {
    this.filtersCollapsed = !this.filtersCollapsed;
  }
  constructor(
    private creditService: CreditService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.countBorrowerss();
    this.getBorrowerss(0, 5);
    this.loading = false;
  }

  filter() {
    this.getBorrowerss(this.currentPage, this.currentSize)
    this.countBorrowerss()
  }

  reset() {
    this.firstNameFilter = ''
    this.lastNameFilter = ''
    this.emailFilter = ''
    this.phoneFilter = ''
    this.minAmountFilter = ''
    this.maxAmountFilter = ''
    this.fromGivenDateFilter = null
    this.toGivenDateFilter = null
    this.fromReturnDateFilter = null
    this.toReturnDateFilter = null
    this.filter()
  }

  buildQuery() {
    console.log(this.minAmountFilter)
    let query = "";
    if (this.firstNameFilter)
      query += query ? ",firstName ~ '" + this.firstNameFilter + "'" : "firstName ~ '" + this.firstNameFilter + "'"
    if (this.lastNameFilter)
      query += query ? ",lastName ~ '" + this.lastNameFilter + "'" : "lastName ~ '" + this.lastNameFilter + "'"
    if (this.emailFilter)
      query += query ? ",email ~ '" + this.emailFilter + "'" : "email ~ '" + this.emailFilter + "'"
    if (this.phoneFilter)
      query += query ? ",phone ~ '" + this.phoneFilter + "'" : "phone ~ '" + this.phoneFilter + "'"
    if (this.minAmountFilter != null)
      query += query ? ",amount > '" + this.minAmountFilter + "'" : "amount > '" + this.minAmountFilter + "'"
    if (this.maxAmountFilter  != null)
      query += query ? ",amount < '" + this.maxAmountFilter + "'" : "amount < '" + this.maxAmountFilter + "'"
    if (this.fromGivenDateFilter)
      query += query ? ",givenDate > '" + this.fromGivenDateFilter + "'" : "givenDate > '" + this.fromGivenDateFilter + "'"
    if (this.toGivenDateFilter)
      query += query ? ",givenDate < '" + this.toGivenDateFilter + "'" : "givenDate < '" + this.toGivenDateFilter + "'"
    if (this.fromReturnDateFilter)
      query += query ? ",returnDate > '" + this.fromReturnDateFilter + "'" : "returnDate > '" + this.fromReturnDateFilter + "'"
    if (this.toReturnDateFilter)
      query += query ? ",returnDate < '" + this.toReturnDateFilter + "'" : "returnDate < '" + this.toReturnDateFilter + "'"

    return query
  }

  create() {
    this.router.navigate(['/credits/add'])
  }

  getBorrowerss(page, size) {
    this.loading = true;
    this.creditService.getBorrowersByStoreId(this.authService.getConnectedUser()?.store, {
      page,
      size,
      query: this.buildQuery()
    }).subscribe(response => {
      this.loading = false;
      this.borrowers = response;
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

  countBorrowerss() {
    this.loading = true;
    this.creditService.countBorrowersByStoreId(this.authService.getConnectedUser()?.store, {
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

  deleteBorrower(borrower) {
    Swal.fire({
      title: 'Etes vous sûr de vouloir supprimer le crédit de ' + borrower.firstName + ' ' + borrower.lastName + ' ?',
      denyButtonText: `Annuler`,
      showDenyButton: true,
      confirmButtonText: 'Supprimer',
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        this.creditService.deleteBorrower(borrower.id).subscribe(response => {
          this.loading = false;
          Swal.fire({
            icon: 'success',
            title: 'Crédit supprimé !',
            showConfirmButton: false,
            timer: 1500
          })
          this.getBorrowerss(this.currentPage, this.currentSize)
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

  editBorrower(borrower) {
    this.router.navigate(['credits/' + borrower.id])
  }

  handlePageEvent(event) {
    this.currentPage = event.pageIndex;
    this.currentSize = event.pageSize;
    this.getBorrowerss(this.currentPage, this.currentSize)
  }

}
