import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { BrandService } from 'src/app/services/brand.service';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BrandAddComponent } from '../brand-add/brand-add.component';
import { faICursor, faMousePointer, faTrash } from '@fortawesome/free-solid-svg-icons';
import { faEdit } from '@fortawesome/free-regular-svg-icons';
import { SPINNER } from 'ngx-loading-x';
import Swal from 'sweetalert2/dist/sweetalert2.js';

@Component({
  selector: 'app-brands-mngt',
  templateUrl: './brands-mngt.component.html',
  styleUrls: ['./brands-mngt.component.scss']
})
export class BrandsMngtComponent implements OnInit {

  mode;

  loading;
  spinnerType = SPINNER.threeStrings;

  brands;

  selectedBrand;

  storeId;

  faTrash = faTrash;
  faEdit = faEdit;
  faSelect = faMousePointer;
  connectedUserRole
  constructor(
    private brandService: BrandService,
    private authService: AuthService,
    public dialog: MatDialog) { }

  ngOnInit(): void {
    this.mode = 'SELECT'
    this.storeId = this.authService.getConnectedUser()?.store
    this.loading = false;
    this.getBrands();
    this.connectedUserRole = this.authService.getConnectedUser()?.role
  }

  getBrands() {
    this.brandService.getBrandsByStoreId(this.storeId).subscribe(
      response => {
        this.brands = response;
      }
    )
  }

  addBrand() {
    const dialogRef = this.dialog.open(BrandAddComponent);

    dialogRef.afterClosed().subscribe(result => {
      let inputBrand = result;
      if (result) {
        this.loading = true;
        this.brandService.addBrand({
          name: inputBrand,
          storeId: this.storeId
        }).subscribe(
          response => {
            this.loading = false;
            this.getBrands()
          }
        )
      }

    });
  }


  addSubBrand(parentBrand) {
    const dialogRef = this.dialog.open(BrandAddComponent);

    dialogRef.afterClosed().subscribe(result => {
      let inputBrand = result;
      if (result) {
        this.loading = true;
        this.brandService.addBrand({
          name: inputBrand
        }).subscribe(
          response => {
            this.loading = false;
            this.getBrands()
          }
        )
      }
    });
  }


  selectBrand(brand) {
    if (this.mode == 'SELECT') {
      this.selectedBrand = brand
    } else if (this.mode == 'DELETE') {
      this.deleteBrand(brand)
    } else if (this.mode == 'EDIT') {
      this.updateBrand(brand)
    }

  }

  showSuccessMessage(
    title, message, icon = null,
    showCancelButton = true) {
    return Swal.fire({
      title: title,
      text: message,
      icon: icon,
      showCancelButton: showCancelButton
    })
  }


  deleteBrand(brand) {
    Swal.fire({
      title: 'Etes vous sûr de vouloir supprimer la marque "' + brand.name + '" ?',
      denyButtonText: `Annuler`,
      showDenyButton: true,
      confirmButtonText: 'Supprimer',
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        this.brandService.deleteBrand(brand.id).subscribe(response => {
          this.loading = false;
          Swal.fire({
            icon: 'success',
            title: 'Marque supprimée !',
            showConfirmButton: false,
            timer: 1500
          })
          this.getBrands()
        })
      }
    })
  }

  updateBrand(brand) {
    const dialogRef = this.dialog.open(BrandAddComponent, { data: brand.name });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.brandService.updateBrand({ name: result, id: brand.id }).subscribe(response => {
          this.loading = false;
          Swal.fire({
            icon: 'success',
            title: 'Catégorie modifiée !',
            showConfirmButton: false,
            timer: 1500
          })
          this.getBrands()
        })
      }
    });
  }

}
