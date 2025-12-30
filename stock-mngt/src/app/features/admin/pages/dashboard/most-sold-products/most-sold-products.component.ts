import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { faFire, faBox, faFireAlt, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/core/services/auth.service';
import { StatService } from 'src/app/core/services/stat.service';
import { AllSoldProductsModalComponent } from '../all-sold-products-modal/all-sold-products-modal.component';

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

  openAllProductsModal() {
    this.dialog.open(AllSoldProductsModalComponent, {
      width: '90vw',
      maxWidth: '850px',
      maxHeight: '90vh',
      panelClass: 'dark-modal'
    });
  }
}
