import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CategoriesMngtComponent } from './categories/categories-mngt/categories-mngt.component';
import { LoginComponent } from './general/login/login.component';
import { RegisterComponent } from './general/register/register.component';
import { AuthGuard } from './services/auth.guard';
import { StoreAddComponent } from './stores/store-add/store-add.component';
import { StoresMngtComponent } from './stores/stores-mngt/stores-mngt.component';
import { StoreViewComponent } from './stores/store-view/store-view.component';
import { SuppliersMngtComponent } from './suppliers/suppliers-mngt/suppliers-mngt.component';
import { SupplierAddComponent } from './suppliers/supplier-add/supplier-add.component';
import { ProductsMngtComponent } from './products/products-mngt/products-mngt.component';
import { ProductAddComponent } from './products/product-add/product-add.component';
import { ProductViewComponent } from './products/product-view/product-view.component';
import { BrandsMngtComponent } from './brands/brands-mngt/brands-mngt.component';
import { ReceiptsMngtComponent } from './receipts/receipts-mngt/receipts-mngt.component';
import { ReceiptAddComponent } from './receipts/receipt-add/receipt-add.component';
import { ReceiptViewComponent } from './receipts/receipt-view/receipt-view.component';
import { WorkersMngtComponent } from './workers/workers-mngt/workers-mngt.component';
import { WorkerAddComponent } from './workers/worker-add/worker-add.component';
import { CreditsMngtComponent } from './credits/credits-mngt/credits-mngt.component';
import { CreditAddComponent } from './credits/credit-add/credit-add.component';
import { ExpensesMngtComponent } from './expenses/expenses-mngt/expenses-mngt.component';
import { ExpenseAddComponent } from './expenses/expense-add/expense-add.component';
import { DashboardViewComponent } from './dashboard/dashboard-view/dashboard-view.component';
import { MainComponent } from './market/main/main.component';
import { LandingPageComponent } from './general/landing-page/landing-page.component';
import { GenerateReportComponent } from './reports/generate-report/generate-report.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { TermsComponent } from './pages/terms/terms.component';
import { ConfirmAccountComponent } from './general/confirm-account/confirm-account.component';
import { OperationsMngtComponent } from './receipts/operations-mngt/operations-mngt.component';

const routes: Routes = [

  // ------------ Dashboard -------------
  { path: 'dashboard', component: DashboardViewComponent, canActivate: [AuthGuard] },

  // ------------ Store ------------
  { path: 'stores', component: StoresMngtComponent, canActivate: [AuthGuard] },
  { path: 'stores/add', component: StoreAddComponent, canActivate: [AuthGuard] },
  { path: 'stores/view', component: StoreViewComponent, canActivate: [AuthGuard] },
  { path: 'stores/:id', component: StoreAddComponent, canActivate: [AuthGuard] },

  // ------------ Brands ------------
  { path: 'brands', component: BrandsMngtComponent, canActivate: [AuthGuard] },

  // ------------ Categories ------------
  { path: 'categories', component: CategoriesMngtComponent, canActivate: [AuthGuard] },
  { path: 'categories/add', component: CategoriesMngtComponent, canActivate: [AuthGuard] },



  // ------------ Suppliers ------------
  { path: 'suppliers', component: SuppliersMngtComponent, canActivate: [AuthGuard] },
  { path: 'suppliers/add', component: SupplierAddComponent, canActivate: [AuthGuard] },
  { path: 'suppliers/:id', component: SupplierAddComponent, canActivate: [AuthGuard] },


  // ------------ Credits ------------
  { path: 'credits', component: CreditsMngtComponent, canActivate: [AuthGuard] },
  { path: 'credits/add', component: CreditAddComponent, canActivate: [AuthGuard] },
  { path: 'credits/:id', component: CreditAddComponent, canActivate: [AuthGuard] },


  // ------------ Expenses ------------
  { path: 'expenses', component: ExpensesMngtComponent, canActivate: [AuthGuard] },
  { path: 'expenses/add', component: ExpenseAddComponent, canActivate: [AuthGuard] },
  { path: 'expenses/:id', component: ExpenseAddComponent, canActivate: [AuthGuard] },



  // ------------ Workers ------------
  { path: 'workers', component: WorkersMngtComponent, canActivate: [AuthGuard] },
  { path: 'workers/add', component: WorkerAddComponent, canActivate: [AuthGuard] },
  { path: 'workers/:id', component: WorkerAddComponent, canActivate: [AuthGuard] },

  // ------------ Products ------------
  { path: 'products', component: ProductsMngtComponent, canActivate: [AuthGuard] },
  { path: 'products/add', component: ProductAddComponent, canActivate: [AuthGuard] },
  { path: 'products/edit/:id', component: ProductAddComponent, canActivate: [AuthGuard] },
  { path: 'products/view/:id', component: ProductViewComponent, canActivate: [AuthGuard] },


  // ------------ Receipts ------------
  { path: 'receipts', component: ReceiptsMngtComponent, canActivate: [AuthGuard] },
  { path: 'receipts/add', component: ReceiptAddComponent, canActivate: [AuthGuard] },
  { path: 'receipts/view/:id', component: ReceiptViewComponent, canActivate: [AuthGuard] },



  // ------------ Operations ------------
  { path: 'operations', component: OperationsMngtComponent, canActivate: [AuthGuard] },

  // ------------ Receipts ------------
  { path: 'reports/generate', component: GenerateReportComponent, canActivate: [AuthGuard] },

  // ------------ Market -------------
  { path: 'market', component: MainComponent },

  // ------------ General ------------
  { path: 'login', component: LoginComponent, data: { loginPage: true }, canActivate: [AuthGuard] },
  { path: 'register', component: RegisterComponent, data: { loginPage: true }, canActivate: [AuthGuard] },
  { path: 'confirm', component: ConfirmAccountComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password/:token', component: ResetPasswordComponent },
  { path: 'terms', component: TermsComponent },
  { path: '', component: LandingPageComponent, data: { loginPage: true }, canActivate: [AuthGuard] },
  //{ path: '', component: StoreViewComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
