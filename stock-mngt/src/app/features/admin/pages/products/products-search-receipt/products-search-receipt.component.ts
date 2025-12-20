import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

import { ProductService } from 'src/app/core/services/product.service';
import { QueryService } from 'src/app/core/services/query.service';
import { SupplierService } from 'src/app/core/services/supplier.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

export interface DialogData {
  selectedProducts: any[];
  receiptType: any;
}
@Component({
  selector: 'app-products-search-receipt',
  templateUrl: './products-search-receipt.component.html',
  styleUrls: ['./products-search-receipt.component.scss']
})
export class ProductsSearchReceiptComponent implements OnInit {
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
  suppliers = []
  products = []
  count;

  currentPage = 0;
  currentSize = 6;

  selectedProducts = this.data;

  filtersCollapsed = true;

  toggleFilters() {
    this.filtersCollapsed = !this.filtersCollapsed;
  }


  constructor(
    private productService: ProductService,
    private supplierService: SupplierService,
    private authService: AuthService,

    private router: Router,
    private queryService: QueryService,
    public dialogRef: MatDialogRef<ProductsSearchReceiptComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) { }

  ngOnInit(): void {
    this.getSuppliers()
    this.queryService.buildQuery(this.nameFilter, this.descriptionFilter, this.supplierFilter, this.minBuyingPriceFilter, this.maxBuyingPriceFilter)
    this.getProducts(this.currentPage, this.currentSize)
    this.countProducts();
  }

  buildQuery() {
    let query = "";
    if (this.nameFilter)
      query += query ? ",name ~ '" + this.nameFilter + "'" : "name ~ '" + this.nameFilter + "'"
    if (this.colorFilter)
      query += query ? ",color ~ '" + this.colorFilter + "'" : "color ~ '" + this.colorFilter + "'"
    if (this.descriptionFilter)
      query += query ? ",description ~ '" + this.descriptionFilter + "'" : "description ~ '" + this.descriptionFilter + "'"
    if (this.supplierFilter)
      query += query ? ",supplierId = '" + this.supplierFilter + "'" : "supplierId = '" + this.supplierFilter + "'"
    if (this.minQuantityFilter)
      query += query ? ",quantityPrice > '" + this.minQuantityFilter + "'" : "quantityPrice > '" + this.minQuantityFilter + "'"
    if (this.maxQuantityFilter)
      query += query ? ",quantityPrice < '" + this.maxQuantityFilter + "'" : "quantityPrice < '" + this.maxQuantityFilter + "'"
    if (this.minBuyingPriceFilter)
      query += query ? ",buyingPrice > '" + this.minBuyingPriceFilter + "'" : "buyingPrice > '" + this.minBuyingPriceFilter + "'"
    if (this.maxBuyingPriceFilter)
      query += query ? ",buyingPrice < '" + this.maxBuyingPriceFilter + "'" : "buyingPrice < '" + this.maxBuyingPriceFilter + "'"
    if (this.minSellingPriceFilter)
      query += query ? ",sellingPrice > '" + this.minSellingPriceFilter + "'" : "sellingPrice > '" + this.minSellingPriceFilter + "'"
    if (this.maxSellingPriceFilter)
      query += query ? ",sellingPrice < '" + this.maxSellingPriceFilter + "'" : "sellingPrice < '" + this.maxSellingPriceFilter + "'"
    return query
  }

  getSuppliers() {

    this.supplierService.getAllSuppliersByStoreId(this.authService.getConnectedUser()?.store).subscribe(
      response => {

        this.suppliers = response
      },
      error => {

      }
    )
  }

  isSelected(id) {
    return this.data.selectedProducts.find(element => element?.id == id) != null
  }
  getProducts(page, size) {

    this.productService.getProductsByStoreId(this.authService.getConnectedUser()?.store, {
      page,
      size,
      query: this.buildQuery(),
    }).subscribe(
      response => {

        this.products = response
      },
      error => {

      }
    )
  }

  countProducts() {

    this.productService.countProductsByStoreId(this.authService.getConnectedUser()?.store, {
      query: this.buildQuery()
    }).subscribe(response => {

      this.count = response;
    })
  }

  addToSelectedList(product) {
    this.data.selectedProducts.push({ ...product, amount: 1, price: this.data.receiptType == 'LOADED' ? product.buyingPrice : product.sellingPrice })
  }

  removeFromSelectedList(id) {
    this.data.selectedProducts = this.data.selectedProducts.filter(element => element?.id != id)
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

}
