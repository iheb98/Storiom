import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { DashboardViewComponent } from 'src/app/features/admin/pages/dashboard/dashboard-view/dashboard-view.component';
import { AuthGuard } from 'src/app/core/services/auth.guard';

// Admin Feature Components
import { StoresMngtComponent } from 'src/app/features/admin/pages/stores/stores-mngt/stores-mngt.component';
import { StoreAddComponent } from 'src/app/features/admin/pages/stores/store-add/store-add.component';
import { StoreViewComponent } from 'src/app/features/admin/pages/stores/store-view/store-view.component';
import { StoreOnboardingComponent } from 'src/app/features/admin/pages/stores/store-onboarding/store-onboarding.component';
import { CategoriesMngtComponent } from 'src/app/features/admin/pages/categories/categories-mngt/categories-mngt.component';
import { SupplierAddComponent } from 'src/app/features/admin/pages/suppliers/supplier-add/supplier-add.component';
import { SuppliersMngtComponent } from 'src/app/features/admin/pages/suppliers/suppliers-mngt/suppliers-mngt.component';
import { CreditsMngtComponent } from 'src/app/features/admin/pages/credits/credits-mngt/credits-mngt.component';
import { CreditAddComponent } from 'src/app/features/admin/pages/credits/credit-add/credit-add.component';
import { ExpensesMngtComponent } from 'src/app/features/admin/pages/expenses/expenses-mngt/expenses-mngt.component';
import { ExpenseAddComponent } from 'src/app/features/admin/pages/expenses/expense-add/expense-add.component';
import { WorkersMngtComponent } from 'src/app/features/admin/pages/workers/workers-mngt/workers-mngt.component';
import { WorkerAddComponent } from 'src/app/features/admin/pages/workers/worker-add/worker-add.component';
import { ProductsMngtComponent } from 'src/app/features/admin/pages/products/products-mngt/products-mngt.component';
import { ProductAddComponent } from 'src/app/features/admin/pages/products/product-add/product-add.component';
import { ProductViewComponent } from 'src/app/features/admin/pages/products/product-view/product-view.component';
import { ReceiptsMngtComponent } from 'src/app/features/admin/pages/receipts/receipts-mngt/receipts-mngt.component';
import { ReceiptAddComponent } from 'src/app/features/admin/pages/receipts/receipt-add/receipt-add.component';
import { ReceiptViewComponent } from 'src/app/features/admin/pages/receipts/receipt-view/receipt-view.component';
import { OperationsMngtComponent } from 'src/app/features/admin/pages/receipts/operations-mngt/operations-mngt.component';
import { OperationEditComponent } from 'src/app/features/admin/pages/receipts/operation-edit/operation-edit.component';
import { GenerateReportComponent } from 'src/app/features/admin/pages/reports/generate-report/generate-report.component';
import { AdminLayoutComponent } from 'src/app/features/admin/layouts/admin-layout/admin-layout.component';
import { BrandsMngtComponent } from './pages/brands/brands-mngt/brands-mngt.component';
import { OrdersMngtComponent } from './pages/orders/orders-mngt/orders-mngt.component';
import { UserSettingsComponent } from './pages/settings/user-settings/user-settings.component';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardViewComponent },

      // ------------ Stores ------------
      { path: 'stores', component: StoresMngtComponent },
      { path: 'stores/add', component: StoreAddComponent },
      { path: 'stores/view', component: StoreViewComponent },
      { path: 'stores/onboarding', component: StoreOnboardingComponent },
      { path: 'stores/edit/:id', component: StoreAddComponent },

      // ------------ Brands ------------
      { path: 'brands', component: BrandsMngtComponent },

      // ------------ Categories ------------
      { path: 'categories', component: CategoriesMngtComponent },

      // ------------ Suppliers ------------
      { path: 'suppliers', component: SuppliersMngtComponent },
      { path: 'suppliers/add', component: SupplierAddComponent },
      { path: 'suppliers/edit/:id', component: SupplierAddComponent },

      // ------------ Credits ------------
      { path: 'credits', component: CreditsMngtComponent },
      { path: 'credits/add', component: CreditAddComponent },
      { path: 'credits/edit/:id', component: CreditAddComponent },

      // ------------ Expenses ------------
      { path: 'expenses', component: ExpensesMngtComponent },
      { path: 'expenses/add', component: ExpenseAddComponent },
      { path: 'expenses/edit/:id', component: ExpenseAddComponent },

      // ------------ Workers ------------
      { path: 'workers', component: WorkersMngtComponent },
      { path: 'workers/add', component: WorkerAddComponent },
      { path: 'workers/edit/:id', component: WorkerAddComponent },

      // ------------ Products ------------
      { path: 'products', component: ProductsMngtComponent },
      { path: 'products/add', component: ProductAddComponent },
      { path: 'products/edit/:id', component: ProductAddComponent },
      { path: 'products/view/:id', component: ProductViewComponent },

      // ------------ Receipts ------------
      { path: 'receipts', component: ReceiptsMngtComponent },
      { path: 'receipts/add', component: ReceiptAddComponent },
      { path: 'receipts/view/:id', component: ReceiptViewComponent },

      // ------------ Operations ------------
      { path: 'operations', component: OperationsMngtComponent },
      { path: 'operations/edit/:id', component: OperationEditComponent },

      // ------------ Reports ------------
      { path: 'reports/generate', component: GenerateReportComponent },

      // ------------ Orders ------------
      { path: 'orders', component: OrdersMngtComponent },

      // ------------ Settings ------------
      { path: 'settings', component: UserSettingsComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule { }
