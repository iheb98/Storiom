import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PublicComponent } from './public.component';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';
import { HomeComponent } from './pages/home/home.component';
import { PublicProductsComponent } from './pages/public-products/public-products.component';
import { PublicViewProductComponent } from './pages/public-view-product/public-view-product.component';
import { CartComponent } from './pages/cart/cart.component';
import { AccountComponent } from './pages/account/account.component';
import { StoresListComponent } from './pages/stores-list/stores-list.component';
import { StoreDetailsComponent } from './pages/store-details/store-details.component';
import { SellerOnboardingComponent } from './pages/seller-onboarding/store-onboarding.component';
import { CreateStoreComponent } from './pages/create-store/store-add.component';
import { AuthGuard } from 'src/app/core/services/auth.guard';
import { LoginComponent } from 'src/app/general/login/login.component';
import { RegisterComponent } from 'src/app/general/register/register.component';
import { ConfirmAccountComponent } from 'src/app/general/confirm-account/confirm-account.component';
import { ForgotPasswordComponent } from 'src/app/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from 'src/app/reset-password/reset-password.component';
import { TermsComponent } from 'src/app/pages/terms/terms.component';

const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'publicProducts', component: PublicProductsComponent },
      { path: 'publicProduct/:id', component: PublicViewProductComponent },
      { path: 'stores', component: StoresListComponent },
      { path: 'stores/:id', component: StoreDetailsComponent },
      { path: 'seller-onboarding', component: SellerOnboardingComponent },
      { path: 'create-store', component: CreateStoreComponent, canActivate: [AuthGuard] },
      { path: 'cart', component: CartComponent },
      { path: 'account', component: AccountComponent },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },

      { path: 'confirm', component: ConfirmAccountComponent },
      { path: 'forgot-password', component: ForgotPasswordComponent },
      { path: 'reset-password/:token', component: ResetPasswordComponent },
      { path: 'terms', component: TermsComponent },
      /*{ path: 'product/:id', component: ProductDetailsComponent },
     { path: 'cart', component: CartComponent },
     { path: 'checkout', component: CheckoutComponent }*/
    ]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicRoutingModule { }
