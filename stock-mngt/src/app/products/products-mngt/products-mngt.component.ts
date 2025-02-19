import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/services/auth.service';
import { CategoryService } from 'src/app/services/category.service';
import { LoadingService } from 'src/app/services/loading.service';
import { ProductService } from 'src/app/services/product.service';
import { QueryService } from 'src/app/services/query.service';
import { SupplierService } from 'src/app/services/supplier.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

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
  currentSize = 6;

  filtersCollapsed = true;

  editIcon = faEdit
  deleteIcon = faTrash

  toggleFilters() {
      this.filtersCollapsed = !this.filtersCollapsed;
  }

  constructor(
    private productService: ProductService,
    private supplierService: SupplierService,
    private categoryService: CategoryService,
    private authService: AuthService,
    private loadingService: LoadingService,
    private router: Router,
    private queryService: QueryService
  ) { }

  ngOnInit(): void {
    this.getSuppliers();
    this.getCategories();
    this.queryService.buildQuery(this.nameFilter, this.descriptionFilter, this.supplierFilter, this.minBuyingPriceFilter, this.maxBuyingPriceFilter)
    this.getProducts(this.currentPage, this.currentSize)
    this.countProducts();
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
    if (this.maxBuyingPriceFilter  != null)
      query += query ? ",buyingPrice < '" + this.maxBuyingPriceFilter + "'" : "buyingPrice < '" + this.maxBuyingPriceFilter + "'"
    if (this.minSellingPriceFilter  != null)
      query += query ? ",sellingPrice > '" + this.minSellingPriceFilter + "'" : "sellingPrice > '" + this.minSellingPriceFilter + "'"
    if (this.maxSellingPriceFilter  != null)
      query += query ? ",sellingPrice < '" + this.maxSellingPriceFilter + "'" : "sellingPrice < '" + this.maxSellingPriceFilter + "'"
    return query
  }

  getSuppliers() {
    this.loadingService.screenLoading()
    this.supplierService.getAllSuppliersByStoreId(this.authService.getConnectedUser()?.store).subscribe(
      response => {
        this.loadingService.screenLoaded()
        this.suppliers = response
      },
      error => {
        this.loadingService.screenLoaded()
      }
    )
  }

  getCategories() {
    this.loadingService.screenLoading()
    this.categoryService.getFlatCategoriesByStoreId(this.authService.getConnectedUser()?.store).subscribe(
      response => {
        this.loadingService.screenLoaded()
        this.categories = response
      },
      error => {
        this.loadingService.screenLoaded()
      }
    )
  }

  getProducts(page, size) {
    this.loadingService.screenLoading()
    this.productService.getProductsByStoreId(this.authService.getConnectedUser()?.store, {
      page,
      size,
      query: this.buildQuery(),
    }).subscribe(
      response => {
        this.loadingService.screenLoaded()
        this.products = response
      },
      error => {
        this.loadingService.screenLoaded()
      }
    )
  }

  countProducts() {
    this.loadingService.screenLoading()
    this.productService.countProductsByStoreId(this.authService.getConnectedUser()?.store, {
      query: this.buildQuery()
    }).subscribe(response => {
      this.loadingService.screenLoaded()
      this.count = response;
    })
  }

  create() {
    this.router.navigate(['/products/add'])
  }

  reset() {
    this.loadingService.screenLoaded()
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
        this.loadingService.screenLoading()
        this.productService.deleteProduct(product.id).subscribe(response => {
          this.loadingService.screenLoaded()
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

}
