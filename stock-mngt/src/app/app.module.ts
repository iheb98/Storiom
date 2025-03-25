import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { NgxMatFileInputModule } from '@angular-material-components/file-input';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { NavbarComponent } from './general/navbar/navbar.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HomeComponent } from './general/home/home.component';
import { StoresMngtComponent } from './stores/stores-mngt/stores-mngt.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { StoreAddComponent } from './stores/store-add/store-add.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { LoginComponent } from './general/login/login.component';
import { RequestInterceptor } from './services/request.interceptor';
import { RegisterComponent } from './general/register/register.component';
import { CategoriesMngtComponent } from './categories/categories-mngt/categories-mngt.component';
import { StoreViewComponent } from './stores/store-view/store-view.component';
import { AddCategoryComponent } from './categories/add-category/add-category.component';
import { NgxLoadingXModule } from 'ngx-loading-x';
import { SuppliersMngtComponent } from './suppliers/suppliers-mngt/suppliers-mngt.component';
import { SupplierAddComponent } from './suppliers/supplier-add/supplier-add.component';
import { ProductsMngtComponent } from './products/products-mngt/products-mngt.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { ProductAddComponent } from './products/product-add/product-add.component';
import { ProductViewComponent } from './products/product-view/product-view.component';
import { BrandsMngtComponent } from './brands/brands-mngt/brands-mngt.component';
import { BrandAddComponent } from './brands/brand-add/brand-add.component';
import { ReceiptsMngtComponent } from './receipts/receipts-mngt/receipts-mngt.component';
import { ReceiptAddComponent } from './receipts/receipt-add/receipt-add.component';
import { ProductsSearchReceiptComponent } from './products/products-search-receipt/products-search-receipt.component';
import { ReceiptViewComponent } from './receipts/receipt-view/receipt-view.component';
import { WorkersMngtComponent } from './workers/workers-mngt/workers-mngt.component';
import { WorkerAddComponent } from './workers/worker-add/worker-add.component';
import { CreditsMngtComponent } from './credits/credits-mngt/credits-mngt.component';
import { CreditAddComponent } from './credits/credit-add/credit-add.component';
import { ExpensesMngtComponent } from './expenses/expenses-mngt/expenses-mngt.component';
import { ExpenseAddComponent } from './expenses/expense-add/expense-add.component';
import { DashboardViewComponent } from './dashboard/dashboard-view/dashboard-view.component';
import { ReceiptResultTableComponent } from './dashboard/receipt-result-table/receipt-result-table.component';
import { ProductResultTableComponent } from './dashboard/product-result-table/product-result-table.component';
import { MostSoldProductsComponent } from './dashboard/most-sold-products/most-sold-products.component';
import { MostProfitableProductsComponent } from './dashboard/most-profitable-products/most-profitable-products.component';
import { ChartModule } from 'primeng/chart';
import { OperationStatsComponent } from './dashboard/operation-stats/operation-stats.component';
import { HeaderComponent } from './market/header/header.component';
import { FooterComponent } from './market/footer/footer.component';
import { SidenavComponent } from './market/sidenav/sidenav.component';
import { ProductListComponent } from './market/product-list/product-list.component';
import { ProductCardComponent } from './market/product-card/product-card.component';
import { MainComponent } from './market/main/main.component';
import { CategoryStatsComponent } from './dashboard/category-stats/category-stats.component';
import { LandingPageComponent } from './general/landing-page/landing-page.component';
import { AddProductFromReceiptComponent } from './products/add-product-from-receipt/add-product-from-receipt.component';
import { GenerateReportComponent } from './reports/generate-report/generate-report.component';
import { SubscriptionComponent } from './general/subscription/subscription.component';


@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    HomeComponent,
    StoresMngtComponent,
    StoreAddComponent,
    LoginComponent,
    RegisterComponent,
    CategoriesMngtComponent,
    StoreViewComponent,
    AddCategoryComponent,
    SuppliersMngtComponent,
    SupplierAddComponent,
    ProductsMngtComponent,
    ProductAddComponent,
    ProductViewComponent,
    BrandsMngtComponent,
    BrandAddComponent,
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
    MainComponent,
    CategoryStatsComponent,
    LandingPageComponent,
    AddProductFromReceiptComponent,
    GenerateReportComponent,
    SubscriptionComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
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
    ChartModule,
    HttpClientModule
  ],
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: RequestInterceptor,
    multi: true
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
