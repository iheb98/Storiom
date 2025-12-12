import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { ProductService } from 'src/app/core/services/product.service';
import { PublicService } from 'src/app/core/services/public.service';
import { LoadingService } from 'src/app/core/services/loading.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { CartService } from 'src/app/core/services/cart.service';
import { ToastService } from 'src/app/core/services/toast.service';

interface CartItem {
  id: number;
  product: any;
  quantity: number;
}

@Component({
  selector: 'app-public-view-product',
  templateUrl: './public-view-product.component.html',
  styleUrls: ['./public-view-product.component.scss']
})
export class PublicViewProductComponent implements OnInit {

  environment = environment;
  product: any;
  id: string | null = null;
  selectedImage: string | null = null;

  quantity: number = 1; // ✅ default quantity

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private publicService: PublicService,
    private loadingService: LoadingService,
    private cartService: CartService,
    private authService: AuthService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.id = params.get('id');
      if (this.id) this.loadProduct(this.id);
    });
  }

  loadProduct(id: string) {
    this.loadingService.screenLoading();
    this.publicService.getPublicProduct(id).subscribe(res => {
      this.product = res;
      this.loadingService.screenLoaded();
    }, () => {
      this.loadingService.screenLoaded();
    });
  }

  // ----------------------------
  // Quantity management
  // ----------------------------
  increaseQuantity() {
    if (this.product?.quantity) {
      this.quantity++;
    }
  }

  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(product: any) {

    if (this.authService.isLoggedIn()) {
      // User is logged in → use API
      this.productService.addToCart(product.id, this.quantity).subscribe({
        next: () => {
          this.toastService.showSuccess('Produit ajouté au panier');
        },
        error: () => {
          this.toastService.showError('Échec de l\'ajout au panier');
        }
      });
    } else {
      // User NOT logged in → use localStorage
      this.cartService.addToCart(product, this.quantity);
      this.toastService.showSuccess('Produit ajouté au panier (Local)');
    }
  }

  openImage(image: string) {
    this.selectedImage = image;
  }

  closeImage() {
    this.selectedImage = null;
  }
}
