import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { HomeComponent } from './pages/home/home.component';
import { BrandAddComponent } from './pages/brands/brand-add/brand-add.component';
import { BrandsMngtComponent } from './pages/brands/brands-mngt/brands-mngt.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgxMatFileInputModule } from '@angular-material-components/file-input';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxLoadingXModule } from 'ngx-loading-x';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SellProductComponent } from './pages/products/sell-product/sell-product.component';
import { NavbarComponent } from 'src/app/general/navbar/navbar.component';
import { StoresMngtComponent } from './pages/stores/stores-mngt/stores-mngt.component';
import { StoreAddComponent } from './pages/stores/store-add/store-add.component';
import { CategoriesMngtComponent } from './pages/categories/categories-mngt/categories-mngt.component';
import { StoreViewComponent } from './pages/stores/store-view/store-view.component';
import { AddCategoryComponent } from './pages/categories/add-category/add-category.component';
import { SuppliersMngtComponent } from './pages/suppliers/suppliers-mngt/suppliers-mngt.component';
import { SupplierAddComponent } from './pages/suppliers/supplier-add/supplier-add.component';
import { ProductsMngtComponent } from './pages/products/products-mngt/products-mngt.component';
import { ProductAddComponent } from './pages/products/product-add/product-add.component';
import { ProductViewComponent } from './pages/products/product-view/product-view.component';
import { ReceiptsMngtComponent } from './pages/receipts/receipts-mngt/receipts-mngt.component';
import { ReceiptAddComponent } from './pages/receipts/receipt-add/receipt-add.component';
import { ProductsSearchReceiptComponent } from './pages/products/products-search-receipt/products-search-receipt.component';
import { ReceiptViewComponent } from './pages/receipts/receipt-view/receipt-view.component';
import { WorkersMngtComponent } from './pages/workers/workers-mngt/workers-mngt.component';
import { WorkerAddComponent } from './pages/workers/worker-add/worker-add.component';
import { CreditsMngtComponent } from './pages/credits/credits-mngt/credits-mngt.component';
import { CreditAddComponent } from './pages/credits/credit-add/credit-add.component';
import { ExpensesMngtComponent } from './pages/expenses/expenses-mngt/expenses-mngt.component';
import { ExpenseAddComponent } from './pages/expenses/expense-add/expense-add.component';
import { DashboardViewComponent } from './pages/dashboard/dashboard-view/dashboard-view.component';
import { ReceiptResultTableComponent } from './pages/dashboard/receipt-result-table/receipt-result-table.component';
import { ProductResultTableComponent } from './pages/dashboard/product-result-table/product-result-table.component';
import { MostSoldProductsComponent } from './pages/dashboard/most-sold-products/most-sold-products.component';
import { MostProfitableProductsComponent } from './pages/dashboard/most-profitable-products/most-profitable-products.component';
import { OperationStatsComponent } from './pages/dashboard/operation-stats/operation-stats.component';
import { HeaderComponent } from 'src/app/market/header/header.component';
import { FooterComponent } from 'src/app/market/footer/footer.component';
import { SidenavComponent } from 'src/app/market/sidenav/sidenav.component';
import { ProductListComponent } from 'src/app/market/product-list/product-list.component';
import { ProductCardComponent } from 'src/app/market/product-card/product-card.component';
import { CategoryStatsComponent } from './pages/dashboard/category-stats/category-stats.component';
import { AddProductFromReceiptComponent } from './pages/products/add-product-from-receipt/add-product-from-receipt.component';
import { GenerateReportComponent } from './pages/reports/generate-report/generate-report.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { OperationsMngtComponent } from './pages/receipts/operations-mngt/operations-mngt.component';
import { OperationEditComponent } from './pages/receipts/operation-edit/operation-edit.component';
import { ParentCategoriesStatsComponent } from './pages/dashboard/parent-categories-stats/parent-categories-stats.component';
import { ChartModule } from 'primeng/chart';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OrdersMngtComponent } from './pages/orders/orders-mngt/orders-mngt.component';


@NgModule({
  declarations: [
    AdminComponent,
    HomeComponent,
    BrandsMngtComponent,
    SellProductComponent,
    BrandAddComponent,
    NavbarComponent,
    StoresMngtComponent,
    StoreAddComponent,
    CategoriesMngtComponent,
    StoreViewComponent,
    AddCategoryComponent,
    SuppliersMngtComponent,
    SupplierAddComponent,
    ProductsMngtComponent,
    ProductAddComponent,
    ProductViewComponent,
    ReceiptsMngtComponent,
    ReceiptAddComponent,
    ProductsSearchReceiptComponent,
    ReceiptViewComponent,
    WorkersMngtComponent,
    WorkerAddComponent,
    CreditsMngtComponent,
    CreditAddComponent,
    ExpensesMngtComponent,
    ExpenseAddComponent,
    DashboardViewComponent,
    ReceiptResultTableComponent,
    ProductResultTableComponent,
    MostSoldProductsComponent,
    MostProfitableProductsComponent,
    OperationStatsComponent,
    HeaderComponent,
    FooterComponent,
    SidenavComponent,
    ProductListComponent,
    ProductCardComponent,
    CategoryStatsComponent,
    AddProductFromReceiptComponent,
    GenerateReportComponent,
    AdminLayoutComponent,
    OperationsMngtComponent,
    OperationEditComponent,
    ParentCategoriesStatsComponent,
    OrdersMngtComponent,
  ],
  imports: [
    CommonModule,
    MatSidenavModule,
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
    MatListModule,
    MatDialogModule,
    MatFormFieldModule,
    NgxMatFileInputModule,
    MatInputModule,
    MatPaginatorModule,
    NgSelectModule,
    NgxLoadingXModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    AdminRoutingModule,
    MatSidenavModule,
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
    MatListModule,
    MatDialogModule,
    MatFormFieldModule,
    NgxMatFileInputModule,
    MatInputModule,
    MatPaginatorModule,
    NgSelectModule,
    NgxLoadingXModule,
    MatTooltipModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    ChartModule,
    MatMenuModule
  ]
})
export class AdminModule { }
