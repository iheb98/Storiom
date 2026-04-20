import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { CartService } from 'src/app/core/services/cart.service';
import { ProductService } from 'src/app/core/services/product.service';
import { environment } from 'src/environments/environment.prod';
import { faCartPlus, faEye } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-store-product-card',
  templateUrl: './store-product-card.component.html',
  styleUrls: ['./store-product-card.component.scss']
})
export class StoreProductCardComponent {
  @Input() product: any;
  @Input() basePath = '';
  @Output() addedToCart = new EventEmitter<any>();

  environment = environment;
  faCartPlus = faCartPlus;
  faEye = faEye;
  imageLoaded = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private cartService: CartService,
    private productService: ProductService
  ) {}

  getProductImage(): string {
    // Prefer thumbnails for faster loading in cards
    let thumbs = this.product?.thumbnails;
    if (thumbs) {
      if (typeof thumbs === 'string') {
        try { thumbs = JSON.parse(thumbs); } catch { thumbs = null; }
      }
      const idx = this.product?.mainImageIndex || 0;
      if (Array.isArray(thumbs) && thumbs.length > 0) {
        return this.environment.backend + '/' + thumbs[thumbs.length > idx ? idx : 0];
      }
    }

    // Fallback to full images
    let images = this.product?.images;
    if (!images) return 'assets/default_product.png';
    if (typeof images === 'string') {
      try { images = JSON.parse(images); } catch { return 'assets/default_product.png'; }
    }
    const idx = this.product?.mainImageIndex || 0;
    if (Array.isArray(images) && images.length > 0) {
      return this.environment.backend + '/' + images[images.length > idx ? idx : 0];
    }
    return 'assets/default_product.png';
  }

  onImageLoad(): void {
    this.imageLoaded = true;
  }

  getDiscountedPrice(): number {
    if (!this.product?.discount || this.product.discount <= 0) return this.product?.sellingPrice || 0;
    return this.product.sellingPrice * (1 - this.product.discount / 100);
  }

  addToCart(event: Event): void {
    event.stopPropagation();
    this.cartService.addToCart(this.product);
    this.addedToCart.emit(this.product);
  }

  viewProduct(): void {
    this.router.navigate([this.basePath, 'product', this.product.id]);
  }
}
