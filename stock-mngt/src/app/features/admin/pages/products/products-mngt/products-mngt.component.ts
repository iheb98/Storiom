import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { faEdit, faTrash, faEye, faArrowUp, faArrowDown, faPen, } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/core/services/auth.service';
import { CategoryService } from 'src/app/core/services/category.service';

import { ProductService } from 'src/app/core/services/product.service';
import { QueryService } from 'src/app/core/services/query.service';
import { ReceiptService } from 'src/app/core/services/receipt.service';
import { SupplierService } from 'src/app/core/services/supplier.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { SellProductComponent } from '../sell-product/sell-product.component';

@Component({
  selector: 'app-products-mngt',
  templateUrl: './products-mngt.component.html',
  styleUrls: ['./products-mngt.component.scss']
})
export class ProductsMngtComponent implements OnInit {
  environment = environment
  minBuyingPriceFilter = null;
  maxBuyingPriceFilter = null;

  minSellingPriceFilter = null;
  maxSellingPriceFilter = null;

  minQuantityFilter = null;
  maxQuantityFilter = null;

  nameFilter = '';
  descriptionFilter = '';
  colorFilter = '';

  supplierFilter = null
  categoryFilter = null
  suppliers = []
  products = []
  categories = [];
  count;

  currentPage = 0;
  currentSize = 24;

  filtersCollapsed = true;
  searchable;
  isCriticalFilter = false;

  editIcon = faEdit
  deleteIcon = faTrash

  selectedImage: string | null = null;

  faEye = faEye;
  faArrowUp = faArrowUp;
  faArrowDown = faArrowDown;


  toggleFilters() {
    this.filtersCollapsed = !this.filtersCollapsed;
  }

  constructor(
    private productService: ProductService,
    private receiptService: ReceiptService,
    private supplierService: SupplierService,
    private categoryService: CategoryService,
    private authService: AuthService,

    private router: Router,
    private route: ActivatedRoute,
    private queryService: QueryService,
    public dialog: MatDialog) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.isCriticalFilter = params['filter'] === 'critical';

      this.getSuppliers();
      this.getCategories();
      this.queryService.buildQuery(this.nameFilter, this.descriptionFilter, this.supplierFilter, this.minBuyingPriceFilter, this.maxBuyingPriceFilter)
      this.getProducts(this.currentPage, this.currentSize)
      this.countProducts();
    });
  }

  buildQuery() {
    let query = "";
    if (this.nameFilter)
      query += query ? ",name ~ '" + this.nameFilter + "'" : "name ~ '" + this.nameFilter + "'"
    // if (this.colorFilter)
    //   query += query ? ",color ~ '" + this.colorFilter + "'" : "color ~ '" + this.colorFilter + "'"
    if (this.descriptionFilter)
      query += query ? ",description ~ '" + this.descriptionFilter + "'" : "description ~ '" + this.descriptionFilter + "'"
    if (this.supplierFilter)
      query += query ? ",supplierId = '" + this.supplierFilter + "'" : "supplierId = '" + this.supplierFilter + "'"
    if (this.categoryFilter)
      query += query ? ",categoryId = '" + this.categoryFilter + "'" : "categoryId = '" + this.categoryFilter + "'"
    if (this.minQuantityFilter != null)
      query += query ? ",quantity > '" + this.minQuantityFilter + "'" : "quantity > '" + this.minQuantityFilter + "'"
    if (this.maxQuantityFilter != null)
      query += query ? ",quantity < '" + this.maxQuantityFilter + "'" : "quantity < '" + this.maxQuantityFilter + "'"
    if (this.minBuyingPriceFilter != null)
      query += query ? ",buyingPrice > '" + this.minBuyingPriceFilter + "'" : "buyingPrice > '" + this.minBuyingPriceFilter + "'"
    if (this.maxBuyingPriceFilter != null)
      query += query ? ",buyingPrice < '" + this.maxBuyingPriceFilter + "'" : "buyingPrice < '" + this.maxBuyingPriceFilter + "'"
    if (this.minSellingPriceFilter != null)
      query += query ? ",sellingPrice > '" + this.minSellingPriceFilter + "'" : "sellingPrice > '" + this.minSellingPriceFilter + "'"
    if (this.maxSellingPriceFilter != null)
      query += query ? ",sellingPrice < '" + this.maxSellingPriceFilter + "'" : "sellingPrice < '" + this.maxSellingPriceFilter + "'"
    return query
  }

  getSuppliers() {
    //
    this.supplierService.getAllSuppliersByStoreId(this.authService.getConnectedUser()?.store).subscribe(
      response => {
        //
        this.suppliers = response
      },
      error => {

      }
    )
  }

  getCategories() {
    //
    this.categoryService.getFlatCategoriesByStoreId(this.authService.getConnectedUser()?.store).subscribe(
      response => {
        //
        this.categories = response
      },
      error => {

      }
    )
  }

  getProducts(page, size) {

    this.productService.getProductsByStoreId(this.authService.getConnectedUser()?.store, {
      page,
      size,
      query: this.buildQuery(),
      critical: this.isCriticalFilter
    }).subscribe(
      response => {

        this.products = response
      },
      error => {

      }
    )
  }

  countProducts() {
    //
    this.productService.countProductsByStoreId(this.authService.getConnectedUser()?.store, {
      query: this.buildQuery(),
      critical: this.isCriticalFilter
    }).subscribe(response => {
      //
      this.count = response;
    })
  }

  create() {
    this.router.navigate(['/products/add'])
  }

  reset() {

  }

  filter() {
    this.getProducts(this.currentPage, this.currentSize)
    this.countProducts()
    console.log(this.buildQuery())
  }

  handlePageEvent(event) {
    this.currentPage = event.pageIndex;
    this.currentSize = event.pageSize;
    this.getProducts(this.currentPage, this.currentSize)
  }

  consulter(id) {
    this.router.navigate(['/products/view/' + id])
  }

  sell(product) {
    const dialogRef = this.dialog.open(SellProductComponent, {
      data: {
        product,
        operationType: "SOLD"
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(result)

      if (result && result?.success) {
        product.quantity -= result.amount
      }
    });
  }

  load(product) {
    const dialogRef = this.dialog.open(SellProductComponent, {
      data: {
        product,
        operationType: "LOADED"
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(result)

      if (result && result?.success) {
        product.quantity += result.amount
      }
    });
  }

  navigateTo(link) {
    this.router.navigate([link])
  }

  deleteProduct(product) {
    Swal.fire({
      title: 'Etes vous sûr de vouloir supprimer le produit ' + product.name + '?',
      denyButtonText: `Annuler`,
      showDenyButton: true,
      confirmButtonText: 'Supprimer',
    }).then((result) => {
      if (result.isConfirmed) {

        this.productService.deleteProduct(product.id).subscribe(response => {

          Swal.fire({
            icon: 'success',
            title: 'Produit supprimé !',
            showConfirmButton: false,
            timer: 1500
          })
          this.getProducts(this.currentPage, this.currentSize)
          this.countProducts()
        })
      }
    })

  }
  openImage(image: string) {
    this.selectedImage = image;
  }

  closeImage() {
    this.selectedImage = null;
  }

  search() {
    console.log(this.searchable)

    this.productService.getProductsByStoreId(this.authService.getConnectedUser()?.store, {
      page: this.currentPage,
      size: this.currentSize,
      searchable: this.searchable,
    }).subscribe(
      response => {

        this.products = response
      },
      error => {

      }
    )

    this.productService.countProductsByStoreId(this.authService.getConnectedUser()?.store, {
      searchable: this.searchable,
    }).subscribe(response => {

      this.count = response;
    })
  }

  // ========================================
  // Bulk Visibility Actions
  // ========================================
  selectedIds: number[] = [];

  toggleSelection(id: number) {
    const index = this.selectedIds.indexOf(id);
    if (index === -1) {
      this.selectedIds.push(id);
    } else {
      this.selectedIds.splice(index, 1);
    }
  }

  isSelected(id: number): boolean {
    return this.selectedIds.includes(id);
  }

  toggleSelectAll(checked: boolean) {
    if (checked) {
      this.selectedIds = this.products.map(p => p.id);
    } else {
      this.selectedIds = [];
    }
  }

  get isAllSelected(): boolean {
    return this.products.length > 0 && this.selectedIds.length === this.products.length;
  }

  bulkUpdateDisplay(toDisplay: boolean, updateAll: boolean = false) {
    if (!updateAll && this.selectedIds.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Aucun produit sélectionné',
        text: 'Veuillez sélectionner au moins un produit.'
      });
      return;
    }

    const action = toDisplay ? 'afficher' : 'masquer';
    const scope = updateAll ? 'TOUS les produits' : `${this.selectedIds.length} produit(s) sélectionné(s)`;

    Swal.fire({
      title: `${toDisplay ? 'Afficher' : 'Masquer'} les produits`,
      text: `Voulez-vous ${action} ${scope} sur le marketplace ?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, confirmer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: toDisplay ? '#28a745' : '#dc3545'
    }).then((result) => {
      if (result.isConfirmed) {


        this.productService.bulkUpdateVisibility({
          ids: this.selectedIds,
          toDisplay: toDisplay,
          updateAll: updateAll,
          storeId: this.authService.getConnectedUser()?.store
        }).subscribe(
          response => {

            Swal.fire({
              icon: 'success',
              title: response.message || 'Mise à jour réussie!',
              showConfirmButton: false,
              timer: 1500
            });
            this.selectedIds = [];
            this.getProducts(this.currentPage, this.currentSize);
          },
          error => {

            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: error?.error?.message || 'Une erreur est survenue'
            });
          }
        );
      }
    });
  }
}
