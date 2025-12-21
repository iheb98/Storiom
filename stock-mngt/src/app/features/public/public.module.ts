import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PublicRoutingModule } from './public-routing.module';
import { PublicComponent } from './public.component';
import { HomeComponent } from './pages/home/home.component';
import { PublicHeaderComponent } from './components/public-header/public-header.component';
import { PublicFooterComponent } from './components/public-footer/public-footer.component';
import { ProductCardComponent } from './components/product-card/product-card.component';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgxMatFileInputModule } from '@angular-material-components/file-input';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxLoadingXModule } from 'ngx-loading-x';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AdminRoutingModule } from '../admin/admin-routing.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ChartModule } from 'primeng/chart';
import { MatMenuModule } from '@angular/material/menu';
import { PublicProductsComponent } from './pages/public-products/public-products.component';
import { PublicViewProductComponent } from './pages/public-view-product/public-view-product.component';
import { CartComponent } from './pages/cart/cart.component';
import { AccountComponent } from './pages/account/account.component';
import { ProfileDetailsComponent } from './components/profile-details/profile-details.component';
import { StoresListComponent } from './pages/stores-list/stores-list.component';
import { StoreDetailsComponent } from './pages/store-details/store-details.component';
import { SellerOnboardingComponent } from './pages/seller-onboarding/store-onboarding.component';
import { CreateStoreComponent } from './pages/create-store/store-add.component';
import { LoginComponent } from 'src/app/general/login/login.component';
import { RegisterComponent } from 'src/app/general/register/register.component';
import { ReviewListComponent } from './components/review-list/review-list.component';
import { ReviewFormComponent } from './components/review-form/review-form.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [
    PublicComponent,
    HomeComponent,
    PublicHeaderComponent,
    PublicFooterComponent,
    ProductCardComponent,
    PublicLayoutComponent,
    PublicProductsComponent,
    PublicViewProductComponent,
    CartComponent,
    AccountComponent,
    ProfileDetailsComponent,
    StoresListComponent,
    StoreDetailsComponent,
    SellerOnboardingComponent,
    CreateStoreComponent,
    LoginComponent,
    RegisterComponent,
    ReviewListComponent,
    ReviewFormComponent
  ],
  imports: [
    CommonModule,
    PublicRoutingModule,
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
    ChartModule,
    MatMenuModule,
    SharedModule
  ]
})
export class PublicModule { }
