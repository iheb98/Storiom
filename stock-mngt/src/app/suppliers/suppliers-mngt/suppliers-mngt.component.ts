import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { SupplierService } from 'src/app/services/supplier.service';
import { Observable } from 'rxjs';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-suppliers-mngt',
  templateUrl: './suppliers-mngt.component.html',
  styleUrls: ['./suppliers-mngt.component.scss']
})
export class SuppliersMngtComponent implements OnInit {
  // ------ Icons
  faTrash = faTrash;
  faEdit = faEdit;

  firstNameFilter = ''
  lastNameFilter = ''
  emailFilter = ''
  phoneFilter = ''
  minCreditFilter = null
  maxCreditFilter = null
  suppliers
  count;
  loading;

  currentPage = 0;
  currentSize = 5;
  constructor(
    private supplierService: SupplierService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.countSuppliers();
    this.getSuppliers(0, 5);
    this.loading = false;
  }

  filter() {
    this.getSuppliers(this.currentPage, this.currentSize)
    this.countSuppliers()
  }

  reset() {
    this.firstNameFilter = ''
    this.lastNameFilter = ''
    this.emailFilter = ''
    this.phoneFilter = ''
    this.minCreditFilter = null
    this.maxCreditFilter = null
    this.filter()
  }

  create() {
    this.router.navigate(['/suppliers/add'])
  }

  getSuppliers(page, size) {
    this.loading = true;
    this.supplierService.getSuppliersByStoreId(this.authService.getConnectedUser()?.store, {
      page,
      size,
      firstName: this.firstNameFilter,
      lastName: this.lastNameFilter,
      email: this.emailFilter,
      phone: this.phoneFilter,
      creditFrom: this.minCreditFilter,
      creditTo: this.maxCreditFilter,
    }).subscribe(response => {
      this.loading = false;
      this.suppliers = response;
    });
  }

  countSuppliers() {
    this.loading = true;
    this.supplierService.countSuppliersByStoreId(this.authService.getConnectedUser()?.store, {
      firstName: this.firstNameFilter,
      lastName: this.lastNameFilter,
      email: this.emailFilter,
      phone: this.phoneFilter,
      creditFrom: this.minCreditFilter,
      creditTo: this.maxCreditFilter,
    }).subscribe(response => {
      this.loading = false;
      this.count = response;
    })
  }

  deleteSupplier(supplier) {
    Swal.fire({
      title: 'Etes vous sûr de vouloir supprimer le fournisseur ' + supplier.firstName + ' ' + supplier.lastName + ' ?',
      denyButtonText: `Annuler`,
      showDenyButton: true,
      confirmButtonText: 'Supprimer',
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        this.supplierService.deleteSupplier(supplier.id).subscribe(response => {
          this.loading = false;
          Swal.fire({
            icon: 'success',
            title: 'Fournisseur supprimé !',
            showConfirmButton: false,
            timer: 1500
          })
          this.getSuppliers(this.currentPage, this.currentSize)
        })
      }
    })
  }

  editSupplier(supplier) {
    this.router.navigate(['suppliers/' + supplier.id])
  }

  handlePageEvent(event) {
    this.currentPage = event.pageIndex;
    this.currentSize = event.pageSize;
    this.getSuppliers(this.currentPage, this.currentSize)
  }

}
