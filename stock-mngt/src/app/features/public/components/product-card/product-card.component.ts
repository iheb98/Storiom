import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from 'src/app/core/services/product.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { CartService } from 'src/app/core/services/cart.service';
import { AnalyticsService } from 'src/app/core/services/analytics.service';
import { WishlistService } from 'src/app/core/services/wishlist.service';
import { environment } from 'src/environments/environment';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent implements OnInit {
  environment = environment

  @Input() product: any;
  isInWishlist = false;

  get averageRating(): number {
    if (!this.product?.reviews?.length) return 0;
    const total = this.product.reviews.reduce((acc: number, r: any) => acc + r.rating, 0);
    return total / this.product.reviews.length;
  }

  get reviewCount(): number {
    return this.product?.reviews?.length || 0;
  }

  constructor(
    private router: Router,
    private productService: ProductService,
    private authService: AuthService,
    private cartService: CartService,
    private toastService: ToastService,
    private analyticsService: AnalyticsService,
    private wishlistService: WishlistService
  ) { }

  ngOnInit(): void {
    // Check wishlist status - prefer isInWishlist from product API response
    if (this.product?.id && this.authService.isLoggedIn()) {
      // Use isInWishlist from API if available (avoids extra API call)
      if (this.product.isInWishlist !== undefined) {
        this.isInWishlist = this.product.isInWishlist;
      } else {
        // Fallback: check via individual API call
        this.wishlistService.checkInWishlist(this.product.id).subscribe(
          result => this.isInWishlist = result.inWishlist
        );
      }
      // Subscribe to wishlist changes for real-time updates when toggling
      this.wishlistService.wishlistIds$.subscribe(ids => {
        if (ids.size > 0) {
          this.isInWishlist = ids.has(this.product?.id);
        }
      });
    }
  }

  addToCart(event: Event) {
    event.stopPropagation(); // Prevent card click logic

    // Track cart_add event
    this.trackEvent('cart_add');

    if (this.authService.isLoggedIn()) {
      this.productService.addToCart(this.product.id, 1).subscribe({
        next: (res) => {
          this.toastService.showSuccess('Produit ajouté au panier');
        },
        error: (err) => {
          console.error(err);
          this.toastService.showError('Échec de l\'ajout au panier');
        }
      });
    } else {
      this.cartService.addToCart(this.product);
      this.toastService.showSuccess('Produit ajouté au panier (Local)');
    }
  }

  viewDetails() {
    if (this.product && this.product.id) {
      // Track click event
      this.trackEvent('view');
      // Navigate to public view product page
      this.router.navigate(['/publicProduct', this.product.id]);
    }
  }

  isNew(product: any): boolean {
    // Logic to check if product is new (e.g. created in last 7 days)
    return false;
  }

  getDiscountedPrice(): number {
    if (!this.product?.discount || this.product.discount <= 0) {
      return this.product?.sellingPrice || 0;
    }
    // sellingPrice is the original price, calculate discounted price
    return this.product.sellingPrice * (1 - this.product.discount / 100);
  }

  goToStore(event: Event) {
    event.stopPropagation();
    console.log("test")
    if (this.product?.store?.id) {
      console.log("test 3")
      console.log(this.product.store.id)
      this.router.navigate(['/stores', this.product.store.id]);
    }
  }

  // Track analytics events
  private trackEvent(interactionType: 'view' | 'click' | 'cart_add' | 'wishlist_add' | 'wishlist_remove') {
    if (this.product?.id) {
      const userId = this.authService.getConnectedUser()?.id;
      this.analyticsService.trackEvent({
        productId: this.product.id,
        interactionType,
        userId,
        storeId: this.product.storeId || this.product.store?.id,
        categoryId: this.product.categoryId || this.product.category?.id
      }).subscribe({
        error: (err) => console.log('Analytics tracking failed:', err)
      });
    }
  }

  toggleWishlist(event: Event) {
    event.stopPropagation();

    if (!this.authService.isLoggedIn()) {
      this.toastService.showWarning('Connectez-vous pour ajouter aux favoris');
      this.router.navigate(['/login']);
      return;
    }

    if (this.isInWishlist) {
      this.wishlistService.removeFromWishlist(this.product.id).subscribe({
        next: () => {
          this.isInWishlist = false;
          this.toastService.showSuccess('Retiré des favoris');
        },
        error: () => this.toastService.showError('Échec de la suppression')
      });
    } else {
      this.wishlistService.addToWishlist(this.product.id).subscribe({
        next: () => {
          this.isInWishlist = true;
          this.toastService.showSuccess('Ajouté aux favoris');
        },
        error: () => this.toastService.showError('Échec de l\'ajout')
      });
    }
  }
}
