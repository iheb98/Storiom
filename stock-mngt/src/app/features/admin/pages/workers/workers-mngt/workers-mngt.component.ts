import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  faEdit, faTrash, faPlus, faFilter, faUndo, faUser, faPhone,
  faEnvelope, faSearch, faUsers, faCalendar, faHardHat
} from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/core/services/auth.service';
import { WorkerService } from 'src/app/core/services/worker.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-workers-mngt',
  templateUrl: './workers-mngt.component.html',
  styleUrls: ['./workers-mngt.component.scss']
})
export class WorkersMngtComponent implements OnInit {

  // Icons
  faTrash = faTrash;
  faEdit = faEdit;
  faPlus = faPlus;
  faFilter = faFilter;
  faUndo = faUndo;
  faUser = faUser;
  faPhone = faPhone;
  faEnvelope = faEnvelope;
  faSearch = faSearch;
  faUsers = faUsers;
  faCalendar = faCalendar;
  faHardHat = faHardHat;

  // Filters
  firstNameFilter = '';
  lastNameFilter = '';
  emailFilter = '';
  phoneFilter = '';
  fromEntryDateFilter: string | null = null;
  toEntryDateFilter: string | null = null;

  // Data
  workers: any[] = [];
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
    private workerService: WorkerService,
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
      this.getWorkers(0, 5),
      this.countWorkers()
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
      this.getWorkers(this.currentPage, this.currentSize),
      this.countWorkers()
    ]).then(() => {
      this.isLoading = false;
    });
  }

  reset() {
    this.firstNameFilter = '';
    this.lastNameFilter = '';
    this.emailFilter = '';
    this.phoneFilter = '';
    this.fromEntryDateFilter = null;
    this.toEntryDateFilter = null;
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
      query += query ? ",phone = '" + this.phoneFilter + "'" : "phone = '" + this.phoneFilter + "'";
    if (this.fromEntryDateFilter)
      query += query ? ",entryDate > '" + this.fromEntryDateFilter + "'" : "entryDate > '" + this.fromEntryDateFilter + "'";
    if (this.toEntryDateFilter)
      query += query ? ",entryDate < '" + this.toEntryDateFilter + "'" : "entryDate < '" + this.toEntryDateFilter + "'";
    return query;
  }

  create() {
    this.router.navigate(['/workers/add']);
  }

  getWorkers(page: number, size: number): Promise<void> {
    return new Promise((resolve) => {
      this.workerService.getWorkersByStoreId(this.authService.getConnectedUser()?.store, {
        page,
        size,
        query: this.buildQuery()
      }).subscribe(
        response => {
          this.workers = response;
          resolve();
        },
        error => {
          Swal.fire({
            icon: 'error',
            title: 'Erreur lors du chargement des travailleurs',
            showConfirmButton: false,
            timer: 2000
          });
          resolve();
        }
      );
    });
  }

  countWorkers(): Promise<void> {
    return new Promise((resolve) => {
      this.workerService.countWorkersByStoreId(this.authService.getConnectedUser()?.store, {
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

  deleteWorker(worker: any) {
    Swal.fire({
      title: 'Supprimer ce travailleur ?',
      text: `${worker.firstName} ${worker.lastName}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Supprimer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#c62828'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isActionLoading = true;
        this.workerService.deleteWorker(worker.id).subscribe(
          response => {
            this.isActionLoading = false;
            Swal.fire({
              icon: 'success',
              title: 'Travailleur supprimé !',
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

  editWorker(worker: any) {
    this.router.navigate(['workers/' + worker.id]);
  }

  handlePageEvent(event: any) {
    this.currentPage = event.pageIndex;
    this.currentSize = event.pageSize;
    this.isLoading = true;
    this.getWorkers(this.currentPage, this.currentSize).then(() => {
      this.isLoading = false;
    });
  }
}
