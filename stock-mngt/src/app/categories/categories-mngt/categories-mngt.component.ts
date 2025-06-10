import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { CategoryService } from 'src/app/services/category.service';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AddCategoryComponent } from '../add-category/add-category.component';
import { faICursor, faMousePointer, faTrash } from '@fortawesome/free-solid-svg-icons';
import { faEdit } from '@fortawesome/free-regular-svg-icons';
import { SPINNER } from 'ngx-loading-x';
import Swal from 'sweetalert2/dist/sweetalert2.js';

@Component({
  selector: 'app-categories-mngt',
  templateUrl: './categories-mngt.component.html',
  styleUrls: ['./categories-mngt.component.scss']
})
export class CategoriesMngtComponent implements OnInit {

  mode;

  loading;
  spinnerType = SPINNER.threeStrings;

  categories;

  selectedCategory;
  selectedSubCategory1;
  selectedSubCategory2;
  selectedSubCategory3;
  selectedSubCategory4;

  storeId;

  faTrash = faTrash;
  faEdit = faEdit;
  faSelect = faMousePointer;

  connectedUserRole

  constructor(
    private categoryService: CategoryService,
    private authService: AuthService,
    public dialog: MatDialog) { }

  ngOnInit(): void {
    this.mode = 'SELECT'
    this.storeId = this.authService.getConnectedUser()?.store
    this.loading = false;
    this.getCategories();
    this.connectedUserRole = this.authService.getConnectedUser()?.role
    console.log(this.connectedUserRole)

  }

  getCategories() {
    this.categoryService.getCategoriesByStoreId(this.storeId).subscribe(
      response => {
        this.categories = response;
      }
    )
  }

  addCategory() {
    const dialogRef = this.dialog.open(AddCategoryComponent);

    dialogRef.afterClosed().subscribe(result => {
      let inputCategory = result;
      if (result) {
        this.loading = true;
        this.categoryService.addCategory({
          name: inputCategory,
          storeId: this.storeId
        }).subscribe(
          response => {
            this.loading = false;
            this.getCategories()
          }, error => {
            this.loading = false;
            Swal.fire({
              icon: 'error',
              title: 'Une erreur est survenue ! Merci de réessayer plus tard',
              showConfirmButton: false,
              timer: 1500
            })
          }
        )
      }

    });
  }


  addSubCategory(parentCategory) {
    const dialogRef = this.dialog.open(AddCategoryComponent);

    dialogRef.afterClosed().subscribe(result => {
      let inputCategory = result;
      if (result) {
        this.loading = true;
        this.categoryService.addCategory({
          name: inputCategory,
          parentCategoryId: parentCategory.id
        }).subscribe(
          response => {
            parentCategory.subCategories.push({ ...response, subCategories: [] })
            this.loading = false;
            this.getCategories()
          }, error => {
            this.loading = false;
            Swal.fire({
              icon: 'error',
              title: 'Une erreur est survenue ! Merci de réessayer plus tard',
              showConfirmButton: false,
              timer: 1500
            })
          }
        )
      }

    });
  }


  selectCategory(category) {
    if (this.mode == 'SELECT') {
      this.selectedCategory = category
      this.selectedSubCategory1 = null
      this.selectedSubCategory2 = null
      this.selectedSubCategory3 = null
      this.selectedSubCategory4 = null
    } else if (this.mode == 'DELETE') {
      this.deleteCategory(category)
    } else if (this.mode == 'EDIT') {
      this.updateCategory(category)
    }

  }

  selectSubCategory1(category) {
    if (this.mode == 'SELECT') {
      this.selectedSubCategory1 = category
      this.selectedSubCategory2 = null
      this.selectedSubCategory3 = null
      this.selectedSubCategory4 = null
    } else if (this.mode == 'DELETE') {
      this.deleteCategory(category)
    } else if (this.mode == 'EDIT') {
      this.updateCategory(category)
    }
  }

  selectSubCategory2(category) {
    if (this.mode == 'SELECT') {
      this.selectedSubCategory2 = category
      this.selectedSubCategory3 = null
      this.selectedSubCategory4 = null
    } else if (this.mode == 'DELETE') {
      this.deleteCategory(category)
    } else if (this.mode == 'EDIT') {
      this.updateCategory(category)
    }
  }

  selectSubCategory3(category) {
    if (this.mode == 'SELECT') {
      this.selectedSubCategory3 = category
      this.selectedSubCategory4 = null
    } else if (this.mode == 'DELETE') {
      this.deleteCategory(category)
    } else if (this.mode == 'EDIT') {
      this.updateCategory(category)
    }
  }

  selectSubCategory4(category) {
    if (this.mode == 'SELECT') {
      this.selectedSubCategory4 = category
    } else if (this.mode == 'DELETE') {
      this.deleteCategory(category)
    } else if (this.mode == 'EDIT') {
      this.updateCategory(category)
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


  deleteCategory(category) {
    Swal.fire({
      title: 'Etes vous sûr de vouloir supprimer la catégorie "' + category.name + '" et tous ses sous-catégories ?',
      denyButtonText: `Annuler`,
      showDenyButton: true,
      confirmButtonText: 'Supprimer',
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        this.categoryService.deleteCategory(category.id).subscribe(response => {
          this.loading = false;
          Swal.fire({
            icon: 'success',
            title: 'Catégorie supprimée !',
            showConfirmButton: false,
            timer: 1500
          })
          this.getCategories()
        }, error => {
          this.loading = false;
          Swal.fire({
            icon: 'error',
            title: error.error.message,
            showConfirmButton: false,
            timer: 1500
          })
        })
      }
    })
  }

  updateCategory(category) {
    const dialogRef = this.dialog.open(AddCategoryComponent, { data: category.name });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.categoryService.updateCategory({ name: result, id: category.id }).subscribe(response => {
          this.loading = false;
          Swal.fire({
            icon: 'success',
            title: 'Catégorie modifiée !',
            showConfirmButton: false,
            timer: 1500
          })
          this.getCategories()
        }, error => {
          this.loading = false;
          Swal.fire({
            icon: 'error',
            title: error.error.message,
            showConfirmButton: false,
            timer: 1500
          })
        })
      }
    });
  }
}
