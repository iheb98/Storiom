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
import { StoresMngtComponent } from './features/admin/pages/stores/stores-mngt/stores-mngt.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { StoreAddComponent } from './features/admin/pages/stores/store-add/store-add.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { LoginComponent } from './general/login/login.component';
import { RequestInterceptor } from './core/services/request.interceptor';
import { RegisterComponent } from './general/register/register.component';
import { CategoriesMngtComponent } from './features/admin/pages/categories/categories-mngt/categories-mngt.component';
import { StoreViewComponent } from './features/admin/pages/stores/store-view/store-view.component';
import { AddCategoryComponent } from './features/admin/pages/categories/add-category/add-category.component';
import { NgxLoadingXModule } from 'ngx-loading-x';
import { SuppliersMngtComponent } from './features/admin/pages/suppliers/suppliers-mngt/suppliers-mngt.component';
import { SupplierAddComponent } from './features/admin/pages/suppliers/supplier-add/supplier-add.component';
import { ProductsMngtComponent } from './features/admin/pages/products/products-mngt/products-mngt.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { ProductAddComponent } from './features/admin/pages/products/product-add/product-add.component';
import { ProductViewComponent } from './features/admin/pages/products/product-view/product-view.component';
import { ReceiptsMngtComponent } from './features/admin/pages/receipts/receipts-mngt/receipts-mngt.component';
import { ReceiptAddComponent } from './features/admin/pages/receipts/receipt-add/receipt-add.component';
import { ProductsSearchReceiptComponent } from './features/admin/pages/products/products-search-receipt/products-search-receipt.component';
import { ReceiptViewComponent } from './features/admin/pages/receipts/receipt-view/receipt-view.component';
import { WorkersMngtComponent } from './features/admin/pages/workers/workers-mngt/workers-mngt.component';
import { WorkerAddComponent } from './features/admin/pages/workers/worker-add/worker-add.component';
import { CreditsMngtComponent } from './features/admin/pages/credits/credits-mngt/credits-mngt.component';
import { CreditAddComponent } from './features/admin/pages/credits/credit-add/credit-add.component';
import { ExpensesMngtComponent } from './features/admin/pages/expenses/expenses-mngt/expenses-mngt.component';
import { ExpenseAddComponent } from './features/admin/pages/expenses/expense-add/expense-add.component';
import { DashboardViewComponent } from './features/admin/pages/dashboard/dashboard-view/dashboard-view.component';
import { ReceiptResultTableComponent } from './features/admin/pages/dashboard/receipt-result-table/receipt-result-table.component';
import { ProductResultTableComponent } from './features/admin/pages/dashboard/product-result-table/product-result-table.component';
import { MostSoldProductsComponent } from './features/admin/pages/dashboard/most-sold-products/most-sold-products.component';
import { MostProfitableProductsComponent } from './features/admin/pages/dashboard/most-profitable-products/most-profitable-products.component';
import { ChartModule } from 'primeng/chart';
import { OperationStatsComponent } from './features/admin/pages/dashboard/operation-stats/operation-stats.component';
import { HeaderComponent } from './market/header/header.component';
import { FooterComponent } from './market/footer/footer.component';
import { SidenavComponent } from './market/sidenav/sidenav.component';
import { ProductListComponent } from './market/product-list/product-list.component';
import { ProductCardComponent } from './market/product-card/product-card.component';
import { MainComponent } from './market/main/main.component';
import { CategoryStatsComponent } from './features/admin/pages/dashboard/category-stats/category-stats.component';
import { LandingPageComponent } from './general/landing-page/landing-page.component';
import { AddProductFromReceiptComponent } from './features/admin/pages/products/add-product-from-receipt/add-product-from-receipt.component';
import { GenerateReportComponent } from './features/admin/pages/reports/generate-report/generate-report.component';
import { SubscriptionComponent } from './general/subscription/subscription.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OverlayModule } from '@angular/cdk/overlay';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { TermsComponent } from './pages/terms/terms.component';
import { ConfirmAccountComponent } from './general/confirm-account/confirm-account.component';
import { SellProductComponent } from './features/admin/pages/products/sell-product/sell-product.component';
import { OperationsMngtComponent } from './features/admin/pages/receipts/operations-mngt/operations-mngt.component';
import { OperationEditComponent } from './features/admin/pages/receipts/operation-edit/operation-edit.component';
import { ParentCategoriesStatsComponent } from './features/admin/pages/dashboard/parent-categories-stats/parent-categories-stats.component';
import { AdminLayoutComponent } from './features/admin/layouts/admin-layout/admin-layout.component';
import { PublicLayoutComponent } from './features/public/layouts/public-layout/public-layout.component';
import { AdminModule } from './features/admin/admin.module';
import { PublicModule } from './features/public/public.module';


@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    LoginComponent,
    RegisterComponent,
    LandingPageComponent,
    SubscriptionComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    TermsComponent,
    ConfirmAccountComponent,
    HomeComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
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
    FontAwesomeModule,
    ChartModule,
    HttpClientModule,
    MatTooltipModule,
    OverlayModule,
    AdminModule,
    PublicModule
  ],
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: RequestInterceptor,
    multi: true
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
