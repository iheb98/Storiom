import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { BrandService } from 'src/app/core/services/brand.service';
import { MatDialog } from '@angular/material/dialog';
import { BrandAddComponent } from '../brand-add/brand-add.component';
import {
  faMousePointer, faTrash, faTags, faTag, faBookmark, faPlus, faPen, faEdit
} from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2/dist/sweetalert2.js';

@Component({
  selector: 'app-brands-mngt',
  templateUrl: './brands-mngt.component.html',
  styleUrls: ['./brands-mngt.component.scss']
})
export class BrandsMngtComponent implements OnInit {

  // Icons
  faMousePointer = faMousePointer;
  faTrash = faTrash;
  faEdit = faEdit;
  faTags = faTags;
  faTag = faTag;
  faBookmark = faBookmark;
  faPlus = faPlus;
  faPen = faPen;

  // State
  mode: 'SELECT' | 'EDIT' | 'DELETE' = 'SELECT';
  isLoading = true;
  isActionLoading = false;

  brands: any[] = [];
  selectedBrand: any = null;

  storeId: number;
  connectedUserRole: string;

  constructor(
    private brandService: BrandService,
    private authService: AuthService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.storeId = this.authService.getConnectedUser()?.store;
    this.connectedUserRole = this.authService.getConnectedUser()?.role;
    this.getBrands();
  }

  getBrands() {
    this.isLoading = true;
    this.brandService.getBrandsByStoreId(this.storeId).subscribe(
      response => {
        this.brands = response;
        this.isLoading = false;
      },
      error => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Erreur lors du chargement des marques',
          showConfirmButton: false,
          timer: 2000
        });
      }
    );
  }

  addBrand() {
    const dialogRef = this.dialog.open(BrandAddComponent);

    dialogRef.afterClosed().subscribe(result => {
      let inputBrand = result;
      if (result) {
        this.isActionLoading = true;
        this.brandService.addBrand({
          name: inputBrand,
          storeId: this.storeId
        }).subscribe(
          response => {
            this.isActionLoading = false;
            this.getBrands();
            Swal.fire({
              icon: 'success',
              title: 'Marque créée !',
              showConfirmButton: false,
              timer: 1500
            });
          },
          error => {
            this.isActionLoading = false;
            Swal.fire({
              icon: 'error',
              title: 'Une erreur est survenue ! Merci de réessayer plus tard',
              showConfirmButton: false,
              timer: 1500
            });
          }
        );
      }
    });
  }

  selectBrand(brand: any) {
    if (this.mode == 'SELECT') {
      this.selectedBrand = brand;
    } else if (this.mode == 'DELETE') {
      this.deleteBrand(brand);
    } else if (this.mode == 'EDIT') {
      this.updateBrand(brand);
    }
  }

  deleteBrand(brand: any) {
    Swal.fire({
      title: 'Etes vous sûr de vouloir supprimer la marque "' + brand.name + '" ?',
      denyButtonText: `Annuler`,
      showDenyButton: true,
      confirmButtonText: 'Supprimer',
      confirmButtonColor: '#c62828',
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.isActionLoading = true;
        this.brandService.deleteBrand(brand.id).subscribe(
          response => {
            this.isActionLoading = false;
            Swal.fire({
              icon: 'success',
              title: 'Marque supprimée !',
              showConfirmButton: false,
              timer: 1500
            });
            this.getBrands();
            // Reset selection if deleted brand was selected
            if (this.selectedBrand?.id === brand.id) {
              this.selectedBrand = null;
            }
          },
          error => {
            this.isActionLoading = false;
            Swal.fire({
              icon: 'error',
              title: error.error?.message || 'Erreur lors de la suppression',
              showConfirmButton: false,
              timer: 1500
            });
          }
        );
      }
    });
  }

  updateBrand(brand: any) {
    const dialogRef = this.dialog.open(BrandAddComponent, { data: brand.name });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isActionLoading = true;
        this.brandService.updateBrand({ name: result, id: brand.id }).subscribe(
          response => {
            this.isActionLoading = false;
            Swal.fire({
              icon: 'success',
              title: 'Marque modifiée !',
              showConfirmButton: false,
              timer: 1500
            });
            this.getBrands();
          },
          error => {
            this.isActionLoading = false;
            Swal.fire({
              icon: 'error',
              title: error.error?.message || 'Erreur lors de la modification',
              showConfirmButton: false,
              timer: 1500
            });
          }
        );
      }
    });
  }
}
