import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from 'src/app/core/services/cart.service';
import { DomainService } from 'src/app/core/services/domain.service';
import { environment } from 'src/environments/environment';
import { Subscription } from 'rxjs';
import { faCheck, faShoppingCart, faTimes, faArrowRight } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-cart-popup',
  templateUrl: './cart-popup.component.html',
  styleUrls: ['./cart-popup.component.scss']
})
export class CartPopupComponent implements OnInit, OnDestroy {
  faCheck = faCheck;
  faCart = faShoppingCart;
  faTimes = faTimes;
  faArrowRight = faArrowRight;

  environment = environment;
  visible = false;
  product: any = null;
  cartCount = 0;
  basePath = '';
  private hideTimeout: any;
  private sub!: Subscription;
  private countSub!: Subscription;

  constructor(
    private cartService: CartService,
    private domainService: DomainService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.basePath = this.domainService.isCustomDomain
      ? '/store-home'
      : `/preview-store/${this.domainService.storeId}`;

    this.countSub = this.cartService.cartCount$.subscribe(c => this.cartCount = c);

    this.sub = this.cartService.productAdded$.subscribe(product => {
      this.product = product;
      this.visible = true;
      clearTimeout(this.hideTimeout);
      this.hideTimeout = setTimeout(() => this.close(), 5000);
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.countSub?.unsubscribe();
    clearTimeout(this.hideTimeout);
  }

  close(): void {
    this.visible = false;
  }

  goToCart(): void {
    this.close();
    this.router.navigate([this.basePath, 'cart']);
  }

  continueShopping(): void {
    this.close();
  }

  getProductImage(): string {
    if (!this.product) return '';
    let images = this.product.images;
    if (!images) return 'assets/default_product.png';
    if (typeof images === 'string') {
      try { images = JSON.parse(images); } catch { return 'assets/default_product.png'; }
    }
    const idx = this.product.mainImageIndex || 0;
    if (Array.isArray(images) && images.length > 0) {
      return this.environment.backend + '/' + images[images.length > idx ? idx : 0];
    }
    return 'assets/default_product.png';
  }

  getDiscountedPrice(): number {
    if (!this.product?.discount || this.product.discount <= 0) return this.product?.sellingPrice || 0;
    return this.product.sellingPrice * (1 - this.product.discount / 100);
  }
}
