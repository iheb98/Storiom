import { Component, OnInit } from '@angular/core';
import { faExclamationTriangle, faArrowDown, faArrowUp, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/core/services/auth.service';
import { ProductService } from 'src/app/core/services/product.service';

@Component({
  selector: 'app-product-result-table',
  templateUrl: './product-result-table.component.html',
  styleUrls: ['./product-result-table.component.scss']
})
export class ProductResultTableComponent implements OnInit {
  // Icons
  faExclamationTriangle = faExclamationTriangle;
  faArrowDown = faArrowDown;
  faArrowUp = faArrowUp;
  faCheckCircle = faCheckCircle;

  user;
  products = [];

  // Loading States
  isLoading = true;

  constructor(
    private productService: ProductService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.user = this.authService.getConnectedUser();
    this.getLastOperations();
  }

  getLastOperations() {
    this.isLoading = true;
    this.productService.getCriticalStockProducts(this.user?.store).subscribe(
      response => {
        this.products = response.slice(0, 5);
        this.isLoading = false;
      },
      error => {
        this.isLoading = false;
      }
    );
  }
}
