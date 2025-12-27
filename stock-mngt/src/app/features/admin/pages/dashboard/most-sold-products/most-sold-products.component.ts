import { Component, OnInit } from '@angular/core';
import { faFire, faBox, faFireAlt } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/core/services/auth.service';
import { StatService } from 'src/app/core/services/stat.service';

@Component({
  selector: 'app-most-sold-products',
  templateUrl: './most-sold-products.component.html',
  styleUrls: ['./most-sold-products.component.scss']
})
export class MostSoldProductsComponent implements OnInit {
  // Icons
  faFire = faFire;
  faBox = faBox;
  faFireAlt = faFireAlt;

  user;
  products;
  operations = [];

  // Loading States
  isLoading = true;

  constructor(
    private statService: StatService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.user = this.authService.getConnectedUser();
    this.getMostSoldProducts();
  }

  getMostSoldProducts() {
    this.isLoading = true;
    this.statService.getMostSoldProducts(this.user?.store).subscribe(
      response => {
        this.operations = response.slice(0, 5);
        this.isLoading = false;
      },
      error => {
        this.isLoading = false;
      }
    );
  }
}
