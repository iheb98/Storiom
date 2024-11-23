import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/services/auth.service';
import { WorkerService } from 'src/app/services/worker.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-workers-mngt',
  templateUrl: './workers-mngt.component.html',
  styleUrls: ['./workers-mngt.component.scss']
})
export class WorkersMngtComponent implements OnInit {

  faTrash = faTrash;
  faEdit = faEdit;

  firstNameFilter = ''
  lastNameFilter = ''
  emailFilter = ''
  phoneFilter = ''
  fromEntryDateFilter = null
  toEntryDateFilter = null
  entryDateFilter = null
  workers
  count;
  loading;

  currentPage = 0;
  currentSize = 5;
  constructor(
    private workerService: WorkerService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.countWorkers();
    this.getWorkers(0, 5);
    this.loading = false;
  }

  filter() {
    this.getWorkers(this.currentPage, this.currentSize)
    this.countWorkers()
  }

  reset() {
    this.firstNameFilter = ''
    this.lastNameFilter = ''
    this.emailFilter = ''
    this.phoneFilter = ''
    this.fromEntryDateFilter = null
    this.toEntryDateFilter = null
    this.filter()
  }

  buildQuery() {
    let query = "";
    if (this.firstNameFilter)
      query += query ? ",firstName ~ '" + this.firstNameFilter + "'" : "firstName ~ '" + this.firstNameFilter + "'"
    if (this.lastNameFilter)
      query += query ? ",lastName ~ '" + this.lastNameFilter + "'" : "lastName ~ '" + this.lastNameFilter + "'"
    if (this.emailFilter)
      query += query ? ",email ~ '" + this.emailFilter + "'" : "email ~ '" + this.emailFilter + "'"
    if (this.phoneFilter)
      query += query ? ",phone = '" + this.phoneFilter + "'" : "phone = '" + this.phoneFilter + "'"
      if (this.fromEntryDateFilter)
      query += query ? ",entryDate > '" + this.fromEntryDateFilter + "'" : "entryDate > '" + this.fromEntryDateFilter + "'"
    if (this.toEntryDateFilter)
      query += query ? ",entryDate < '" + this.toEntryDateFilter + "'" : "entryDate < '" + this.toEntryDateFilter + "'"

    return query
  }

  create() {
    this.router.navigate(['/workers/add'])
  }

  getWorkers(page, size) {
    this.loading = true;
    this.workerService.getWorkersByStoreId(this.authService.getConnectedUser()?.store, {
      page,
      size,
      query: this.buildQuery()
    }).subscribe(response => {
      this.loading = false;
      this.workers = response;
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

  countWorkers() {
    this.loading = true;
    this.workerService.countWorkersByStoreId(this.authService.getConnectedUser()?.store, {
      query:this.buildQuery()
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

  deleteWorker(worker) {
    Swal.fire({
      title: 'Etes vous sûr de vouloir supprimer le fournisseur ' + worker.firstName + ' ' + worker.lastName + ' ?',
      denyButtonText: `Annuler`,
      showDenyButton: true,
      confirmButtonText: 'Supprimer',
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        this.workerService.deleteWorker(worker.id).subscribe(response => {
          this.loading = false;
          Swal.fire({
            icon: 'success',
            title: 'Fournisseur supprimé !',
            showConfirmButton: false,
            timer: 1500
          })
          this.getWorkers(this.currentPage, this.currentSize)
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

  editWorker(worker) {
    this.router.navigate(['workers/' + worker.id])
  }

  handlePageEvent(event) {
    this.currentPage = event.pageIndex;
    this.currentSize = event.pageSize;
    this.getWorkers(this.currentPage, this.currentSize)
  }

}
