import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

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
import { MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
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
    ProductAddComponent
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
    MatInputModule,
    MatPaginatorModule,
    NgSelectModule,
    NgxLoadingXModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
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
