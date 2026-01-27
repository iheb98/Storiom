import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { CategoryService } from 'src/app/core/services/category.service';
import { MatDialog } from '@angular/material/dialog';
import { AddCategoryComponent } from '../add-category/add-category.component';
import {
  faMousePointer, faTrash, faFolderOpen, faFolder, faHome, faChevronRight,
  faPlus, faPen, faEdit, faLayerGroup
} from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2/dist/sweetalert2.js';

@Component({
  selector: 'app-categories-mngt',
  templateUrl: './categories-mngt.component.html',
  styleUrls: ['./categories-mngt.component.scss']
})
export class CategoriesMngtComponent implements OnInit {

  // Icons
  faMousePointer = faMousePointer;
  faTrash = faTrash;
  faEdit = faEdit;
  faFolderOpen = faFolderOpen;
  faFolder = faFolder;
  faHome = faHome;
  faChevronRight = faChevronRight;
  faPlus = faPlus;
  faPen = faPen;
  faLayerGroup = faLayerGroup;

  // State
  mode: 'SELECT' | 'EDIT' | 'DELETE' = 'SELECT';
  isLoading = true;
  isActionLoading = false;

  categories: any[] = [];

  selectedCategory: any = null;
  selectedSubCategory1: any = null;
  selectedSubCategory2: any = null;
  selectedSubCategory3: any = null;
  selectedSubCategory4: any = null;

  storeId: number;
  connectedUserRole: string;

  constructor(
    private categoryService: CategoryService,
    private authService: AuthService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'auto' });
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    }, 0);
    this.storeId = this.authService.getConnectedUser()?.store;
    this.connectedUserRole = this.authService.getConnectedUser()?.role;
    this.getCategories();
  }

  getCategories() {
    this.isLoading = true;
    this.categoryService.getCategoriesByStoreId(this.storeId).subscribe(
      response => {
        this.categories = response;
        this.isLoading = false;
      },
      error => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Erreur lors du chargement des catégories',
          showConfirmButton: false,
          timer: 2000
        });
      }
    );
  }

  addCategory() {
    const dialogRef = this.dialog.open(AddCategoryComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isActionLoading = true;
        this.categoryService.addCategory({
          name: result.name,
          image: result.image,
          icon: result.icon,
          storeId: this.storeId
        }).subscribe(
          response => {
            this.isActionLoading = false;
            this.getCategories();
            Swal.fire({
              icon: 'success',
              title: 'Catégorie créée !',
              showConfirmButton: false,
              timer: 1500
            });
          }, error => {
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


  addSubCategory(parentCategory: any) {
    const dialogRef = this.dialog.open(AddCategoryComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isActionLoading = true;
        this.categoryService.addCategory({
          name: result.name,
          image: result.image,
          icon: result.icon,
          parentCategoryId: parentCategory.id
        }).subscribe(
          response => {
            parentCategory.subCategories.push({ ...response, subCategories: [] });
            this.isActionLoading = false;
            this.getCategories();
            Swal.fire({
              icon: 'success',
              title: 'Sous-catégorie créée !',
              showConfirmButton: false,
              timer: 1500
            });
          }, error => {
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


  selectCategory(category: any) {
    if (this.mode == 'SELECT') {
      this.selectedCategory = category;
      this.selectedSubCategory1 = null;
      this.selectedSubCategory2 = null;
      this.selectedSubCategory3 = null;
      this.selectedSubCategory4 = null;
    } else if (this.mode == 'DELETE') {
      this.deleteCategory(category);
    } else if (this.mode == 'EDIT') {
      this.updateCategory(category);
    }
  }

  selectSubCategory1(category: any) {
    if (this.mode == 'SELECT') {
      this.selectedSubCategory1 = category;
      this.selectedSubCategory2 = null;
      this.selectedSubCategory3 = null;
      this.selectedSubCategory4 = null;
    } else if (this.mode == 'DELETE') {
      this.deleteCategory(category);
    } else if (this.mode == 'EDIT') {
      this.updateCategory(category);
    }
  }

  selectSubCategory2(category: any) {
    if (this.mode == 'SELECT') {
      this.selectedSubCategory2 = category;
      this.selectedSubCategory3 = null;
      this.selectedSubCategory4 = null;
    } else if (this.mode == 'DELETE') {
      this.deleteCategory(category);
    } else if (this.mode == 'EDIT') {
      this.updateCategory(category);
    }
  }

  selectSubCategory3(category: any) {
    if (this.mode == 'SELECT') {
      this.selectedSubCategory3 = category;
      this.selectedSubCategory4 = null;
    } else if (this.mode == 'DELETE') {
      this.deleteCategory(category);
    } else if (this.mode == 'EDIT') {
      this.updateCategory(category);
    }
  }

  selectSubCategory4(category: any) {
    if (this.mode == 'SELECT') {
      this.selectedSubCategory4 = category;
    } else if (this.mode == 'DELETE') {
      this.deleteCategory(category);
    } else if (this.mode == 'EDIT') {
      this.updateCategory(category);
    }
  }

  deleteCategory(category: any) {
    Swal.fire({
      title: 'Etes vous sûr de vouloir supprimer la catégorie "' + category.name + '" et tous ses sous-catégories ?',
      denyButtonText: `Annuler`,
      showDenyButton: true,
      confirmButtonText: 'Supprimer',
      confirmButtonColor: '#c62828',
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.isActionLoading = true;
        this.categoryService.deleteCategory(category.id).subscribe(response => {
          this.isActionLoading = false;
          Swal.fire({
            icon: 'success',
            title: 'Catégorie supprimée !',
            showConfirmButton: false,
            timer: 1500
          });
          this.getCategories();
          // Reset selections if deleted category was selected
          if (this.selectedCategory?.id === category.id) {
            this.selectedCategory = null;
            this.selectedSubCategory1 = null;
            this.selectedSubCategory2 = null;
            this.selectedSubCategory3 = null;
            this.selectedSubCategory4 = null;
          }
        }, error => {
          this.isActionLoading = false;
          Swal.fire({
            icon: 'error',
            title: error.error?.message || 'Erreur lors de la suppression',
            showConfirmButton: false,
            timer: 1500
          });
        });
      }
    });
  }

  updateCategory(category: any) {
    const dialogRef = this.dialog.open(AddCategoryComponent, {
      data: { name: category.name, image: category.image, icon: category.icon }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isActionLoading = true;
        this.categoryService.updateCategory({
          id: category.id,
          name: result.name,
          image: result.image,
          icon: result.icon
        }).subscribe(response => {
          this.isActionLoading = false;
          Swal.fire({
            icon: 'success',
            title: 'Catégorie modifiée !',
            showConfirmButton: false,
            timer: 1500
          });
          this.getCategories();
        }, error => {
          this.isActionLoading = false;
          Swal.fire({
            icon: 'error',
            title: error.error?.message || 'Erreur lors de la modification',
            showConfirmButton: false,
            timer: 1500
          });
        });
      }
    });
  }

  resetBreadcrumb() {
    this.selectedCategory = null;
    this.selectedSubCategory1 = null;
    this.selectedSubCategory2 = null;
    this.selectedSubCategory3 = null;
    this.selectedSubCategory4 = null;
  }
}
