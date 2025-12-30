import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { faCoins, faBox, faChartLine, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/core/services/auth.service';
import { StatService } from 'src/app/core/services/stat.service';
import { AllProfitableProductsModalComponent } from '../all-profitable-products-modal/all-profitable-products-modal.component';

@Component({
  selector: 'app-most-profitable-products',
  templateUrl: './most-profitable-products.component.html',
  styleUrls: ['./most-profitable-products.component.scss']
})
export class MostProfitableProductsComponent implements OnInit {
  // Icons
  faCoins = faCoins;
  faBox = faBox;
  faChartLine = faChartLine;
  faArrowRight = faArrowRight;

  user;
  products;
  operations = [];

  // Loading States
  isLoading = true;

  constructor(
    private statService: StatService,
    private authService: AuthService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.user = this.authService.getConnectedUser();
    this.getMostProfitableProducts();
  }

  getMostProfitableProducts() {
    this.isLoading = true;
    this.statService.getMostProfitableProducts(this.user?.store).subscribe(
      response => {
        this.operations = response.slice(0, 5);
        this.isLoading = false;
      },
      error => {
        this.isLoading = false;
      }
    );
  }

  openAllProductsModal() {
    this.dialog.open(AllProfitableProductsModalComponent, {
      width: '90vw',
      maxWidth: '850px',
      maxHeight: '90vh',
      panelClass: 'dark-modal'
    });
  }
}
