import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { LoadingService } from 'src/app/services/loading.service';
import { SupplierService } from 'src/app/services/supplier.service';

@Component({
  selector: 'app-products-mngt',
  templateUrl: './products-mngt.component.html',
  styleUrls: ['./products-mngt.component.scss']
})
export class ProductsMngtComponent implements OnInit {
  minBuyingPriceFilter;
  maxBuyingPriceFilter;

  minSellingPriceFilter;
  maxSellingPriceFilter;

  nameFilter;
  quantityFilter
  colorFilter;

  supplierFilter
  suppliers = [{ firstName: "test", lastName: "test 2" }, { firstName: "test", lastName: "test 2" }, { firstName: "test", lastName: "test 2" }, { firstName: "test", lastName: "test 2" }]


  constructor(
    private supplierService: SupplierService,
    private authService: AuthService,
    private loadingService: LoadingService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getSuppliers()
  }

  getSuppliers() {
    this.loadingService.screenLoading()
    this.supplierService.getAllSuppliersByStoreId(this.authService.getConnectedUser()?.store).subscribe(
      response => {
        this.loadingService.screenLoaded()
      }
    )
  }

  create() {
    this.router.navigate(['/products/add'])
  }

  reset() {
    this.loadingService.screenLoaded()

  }

  filter() {

  }

}
