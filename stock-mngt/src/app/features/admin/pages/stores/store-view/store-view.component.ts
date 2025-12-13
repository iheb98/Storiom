import { Component, OnInit } from '@angular/core';
import { faEdit, faInfo } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/core/services/auth.service';
import { LoadingService } from 'src/app/core/services/loading.service';
import { StoreService } from 'src/app/core/services/store.service';
import { ProductService } from 'src/app/core/services/product.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-store-view',
  templateUrl: './store-view.component.html',
  styleUrls: ['./store-view.component.scss']
})
export class StoreViewComponent implements OnInit {
  store: any;
  storeWebsite: string;
  backend_URL = environment.backend;
  editIcon = faEdit;
  infoIcon = faInfo;
  selectedImage: string | null = null;

  // Stats
  productsCount = 0;
  ordersCount = 0;
  averageRating = 0;
  totalViews = 0;

  constructor(
    private authService: AuthService,
    private storeService: StoreService,
    private productService: ProductService,
    private loadingService: LoadingService
  ) { }

  ngOnInit(): void {
    this.loadStore();
  }

  loadStore() {
    this.loadingService.screenLoading();
    const storeId = this.authService.getConnectedUser()?.store;

    this.storeService.getStore(storeId).subscribe(
      store => {
        this.store = store;
        this.storeWebsite = this.fillLink(this.store?.site);
        this.loadingService.screenLoaded();
        this.loadStats(storeId);
      },
      error => {
        this.loadingService.screenLoaded();
        Swal.fire({
          icon: 'error',
          title: error?.error?.message || 'Une erreur est survenue ! Merci de réessayer plus tard',
          showConfirmButton: false,
          timer: 1500
        });
      }
    );
  }

  loadStats(storeId: number) {
    // Load products count
    this.productService.countProductsByStoreId(storeId, {}).subscribe(
      res => {
        this.productsCount = res?.count || 0;
      }
    );

    // Load orders count - this would need a backend endpoint
    // For now, we'll set it to 0
    this.ordersCount = 0;

    // Calculate average rating from store reviews if available
    if (this.store?.reviews && this.store.reviews.length > 0) {
      const sum = this.store.reviews.reduce((acc: number, r: any) => acc + (r.rating || 0), 0);
      this.averageRating = sum / this.store.reviews.length;
    }

    // Views would need tracking - for now set to 0
    this.totalViews = 0;
  }

  fillLink(link: string): string {
    if (link != null) {
      if (link.indexOf('http://') === -1 && link.indexOf('https://') === -1) {
        return 'http://' + link;
      }
      return link;
    }
    return null;
  }

  openImage(image: string) {
    this.selectedImage = image;
  }

  closeImage() {
    this.selectedImage = null;
  }
}
