import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-product-result-table',
  templateUrl: './product-result-table.component.html',
  styleUrls: ['./product-result-table.component.scss']
})
export class ProductResultTableComponent implements OnInit {

  user;
  products = []
  constructor(
    private productService: ProductService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.user = this.authService.getConnectedUser()
    this.getLastOperations()
  }


  getLastOperations() {
    this.productService.getCriticalStockProducts(this.user?.store).subscribe(
      response => {
        this.products = response.slice(0, 5)
      }
    )
  }
}
