import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { ProductService } from 'src/app/core/services/product.service';
import { StatService } from 'src/app/core/services/stat.service';

@Component({
  selector: 'app-most-sold-products',
  templateUrl: './most-sold-products.component.html',
  styleUrls: ['./most-sold-products.component.scss']
})
export class MostSoldProductsComponent implements OnInit {
  user;
  products;
  operations = []
  constructor(
    private statService: StatService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.user = this.authService.getConnectedUser()
    this.getMostSoldProducts()
  }


  getMostSoldProducts() {
    this.statService.getMostSoldProducts(this.user?.store).subscribe(
      response => {
        this.operations = response.slice(0, 5)
      }
    )
  }
}
