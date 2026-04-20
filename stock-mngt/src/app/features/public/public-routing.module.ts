import { NgModule, Injectable } from '@angular/core';
import { RouterModule, Routes, Router, CanActivate, UrlTree } from '@angular/router';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';
import { HomeComponent } from './pages/home/home.component';
import { StoreLandingComponent } from './pages/store-landing/store-landing.component';
import { PublicProductsComponent } from './pages/public-products/public-products.component';
import { PublicViewProductComponent } from './pages/public-view-product/public-view-product.component';
import { StoreViewProductComponent } from './pages/store-view-product/store-view-product.component';
import { StoreLoginComponent } from './pages/store-login/store-login.component';
import { StoreRegisterComponent } from './pages/store-register/store-register.component';
import { StoreForgotPasswordComponent } from './pages/store-forgot-password/store-forgot-password.component';
import { StoreResetPasswordComponent } from './pages/store-reset-password/store-reset-password.component';
import { StoreConfirmComponent } from './pages/store-confirm/store-confirm.component';
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
import { StoreServicesComponent } from './pages/store-services/store-services.component';
import { MyServiceRequestsComponent } from './pages/my-service-requests/my-service-requests.component';
import { TrackRequestComponent } from './pages/track-request/track-request.component';
import { AllServicesComponent } from './pages/all-services/all-services.component';
import { AboutComponent } from './pages/about/about.component';
import { ContactComponent } from './pages/contact/contact.component';
import { PrivacyComponent } from './pages/privacy/privacy.component';
import { ShippingComponent } from './pages/shipping/shipping.component';
import { FaqComponent } from './pages/faq/faq.component';
import { StoreLayoutComponent } from './layouts/store-layout/store-layout.component';
import { StoreProductsComponent } from './pages/store-products/store-products.component';
import { StoreCartComponent } from './pages/store-cart/store-cart.component';
import { StoreProfileComponent } from './pages/store-profile/store-profile.component';
import { DomainService } from 'src/app/core/services/domain.service';

/**
 * Guard: allows access only on custom domains.
 * On platform domain, redirects to marketplace home.
 */
@Injectable({ providedIn: 'root' })
export class CustomDomainGuard implements CanActivate {
  constructor(private domainService: DomainService, private router: Router) {}
  canActivate(): boolean | UrlTree {
    if (this.domainService.isCustomDomain) { return true; }
    return this.router.parseUrl('/');
  }
}

/**
 * Guard: allows access only on the platform domain.
 * On custom domain, redirects to /store-home.
 */
@Injectable({ providedIn: 'root' })
export class PlatformDomainGuard implements CanActivate {
  constructor(private domainService: DomainService, private router: Router) {}
  canActivate(): boolean | UrlTree {
    if (!this.domainService.isCustomDomain) { return true; }
    return this.router.parseUrl('/store-home');
  }
}

const routes: Routes = [
  // ═══ CUSTOM DOMAIN STORE (e.g. myshop.com) ═══
  {
    path: 'store-home',
    component: StoreLayoutComponent,
    canActivate: [CustomDomainGuard],
    children: [
      { path: '', component: StoreLandingComponent },
      { path: 'products', component: StoreProductsComponent },
      { path: 'product/:id', component: StoreViewProductComponent },
      { path: 'cart', component: StoreCartComponent },
      { path: 'login', component: StoreLoginComponent },
      { path: 'register', component: StoreRegisterComponent },
      { path: 'forgot-password', component: StoreForgotPasswordComponent },
      { path: 'reset-password/:token', component: StoreResetPasswordComponent },
      { path: 'confirm', component: StoreConfirmComponent },
      { path: 'account', component: StoreProfileComponent }
    ]
  },
  // ═══ STORE LAYOUT (preview mode via storiom.com) ═══
  {
    path: 'preview-store/:storeId',
    component: StoreLayoutComponent,
    children: [
      { path: '', component: StoreLandingComponent },
      { path: 'products', component: StoreProductsComponent },
      { path: 'product/:id', component: StoreViewProductComponent },
      { path: 'cart', component: StoreCartComponent },
      { path: 'login', component: StoreLoginComponent },
      { path: 'register', component: StoreRegisterComponent },
      { path: 'forgot-password', component: StoreForgotPasswordComponent },
      { path: 'reset-password/:token', component: StoreResetPasswordComponent },
      { path: 'confirm', component: StoreConfirmComponent },
      { path: 'account', component: StoreProfileComponent }
    ]
  },
  // ═══ MARKETPLACE LAYOUT (storiom.com) ═══
  {
    path: '',
    component: PublicLayoutComponent,
    canActivate: [PlatformDomainGuard],
    children: [
      { path: '', component: HomeComponent },
      { path: 'publicProducts', component: PublicProductsComponent },
      { path: 'publicProduct/:id', component: PublicViewProductComponent },
      { path: 'stores', component: StoresListComponent },
      { path: 'stores/:id', component: StoreDetailsComponent },
      { path: 'services', component: AllServicesComponent },
      { path: 'store/:storeId/services', component: StoreServicesComponent },
      { path: 'my-service-requests', component: MyServiceRequestsComponent, canActivate: [AuthGuard] },
      { path: 'track-request', component: TrackRequestComponent },
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
      { path: 'products', redirectTo: 'publicProducts', pathMatch: 'full' },
      { path: 'about', component: AboutComponent },
      { path: 'contact', component: ContactComponent },
      { path: 'privacy', component: PrivacyComponent },
      { path: 'shipping', component: ShippingComponent },
      { path: 'faq', component: FaqComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicRoutingModule { }
