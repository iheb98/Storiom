import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { StatService } from 'src/app/core/services/stat.service';

@Component({
  selector: 'app-most-profitable-products',
  templateUrl: './most-profitable-products.component.html',
  styleUrls: ['./most-profitable-products.component.scss']
})
export class MostProfitableProductsComponent implements OnInit {
  user;
  products;
  operations = []
  constructor(
    private statService: StatService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.user = this.authService.getConnectedUser()
    this.getMostProfitableProducts()
  }


  getMostProfitableProducts() {
    this.statService.getMostProfitableProducts(this.user?.store).subscribe(
      response => {
        this.operations = response.slice(0, 5)
      }
    )
  }
}