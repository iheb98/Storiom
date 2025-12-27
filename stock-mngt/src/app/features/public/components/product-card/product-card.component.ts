import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from 'src/app/core/services/product.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { CartService } from 'src/app/core/services/cart.service';
import { environment } from 'src/environments/environment';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent {
  environment = environment

  @Input() product: any;

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
    private toastService: ToastService
  ) { }

  addToCart(event: Event) {
    event.stopPropagation(); // Prevent card click logic

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
      // Navigate to public view product page
      this.router.navigate(['/publicProduct', this.product.id]);
    }
  }

  isNew(product: any): boolean {
    // Logic to check if product is new (e.g. created in last 7 days)
    return false;
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
}
