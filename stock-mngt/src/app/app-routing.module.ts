import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CategoriesMngtComponent } from './categories/categories-mngt/categories-mngt.component';
import { HomeComponent } from './general/home/home.component';
import { LoginComponent } from './general/login/login.component';
import { RegisterComponent } from './general/register/register.component';
import { AuthGuard } from './services/auth.guard';
import { RoleGuard } from './services/role.guard';
import { StoreAddComponent } from './stores/store-add/store-add.component';
import { StoresMngtComponent } from './stores/stores-mngt/stores-mngt.component';
import { StoreViewComponent } from './stores/store-view/store-view.component';
import { SuppliersMngtComponent } from './suppliers/suppliers-mngt/suppliers-mngt.component';
import { SupplierAddComponent } from './suppliers/supplier-add/supplier-add.component';
import { ProductsMngtComponent } from './products/products-mngt/products-mngt.component';
import { ProductAddComponent } from './products/product-add/product-add.component';

const routes: Routes = [
  // ------------ Store ------------
  { path: 'stores', component: StoresMngtComponent, canActivate: [AuthGuard] },
  { path: 'stores/add', component: StoreAddComponent },
  { path: 'stores/view', component: StoreViewComponent },

  // ------------ Categories ------------
  { path: 'categories', component: CategoriesMngtComponent },
  { path: 'categories/add', component: CategoriesMngtComponent },



  // ------------ Suppliers ------------
  { path: 'suppliers', component: SuppliersMngtComponent },
  { path: 'suppliers/add', component: SupplierAddComponent },
  { path: 'suppliers/:id', component: SupplierAddComponent },

  // ------------ Products ------------
  { path: 'products', component: ProductsMngtComponent },
  { path: 'products/add', component: ProductAddComponent },


  // ------------ General ------------
  { path: 'login', component: LoginComponent, data: { loginPage: true }, canActivate: [AuthGuard] },
  { path: 'register', component: RegisterComponent, data: { loginPage: true }, canActivate: [AuthGuard] },
  { path: '', component: StoreViewComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
