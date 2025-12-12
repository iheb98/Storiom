import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PublicComponent } from './public.component';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';
import { HomeComponent } from './pages/home/home.component';
import { PublicProductsComponent } from './pages/public-products/public-products.component';
import { PublicViewProductComponent } from './pages/public-view-product/public-view-product.component';
import { CartComponent } from './pages/cart/cart.component';
import { AccountComponent } from './pages/account/account.component';

const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'publicProducts', component: PublicProductsComponent },
      { path: 'publicProduct/:id', component: PublicViewProductComponent },
      { path: 'cart', component: CartComponent },
      { path: 'account', component: AccountComponent },
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
