import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { CartService } from 'src/app/core/services/cart.service';
import { ProductService } from 'src/app/core/services/product.service';
import { OrderService } from 'src/app/core/services/order.service';
import { environment } from 'src/environments/environment.prod';

interface CartItem {
  id: number;
  product: any;
  quantity: number;
}

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  environment = environment
  cart: CartItem[] = [];
  totalItems = 0;
  totalPrice = 0;

  constructor(
    private router: Router,
    private authService: AuthService,
    private cartService: CartService,
    private productService: ProductService,
    private orderService: OrderService
  ) { }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.loadCartFromApi();
    } else {
      this.loadCartFromLocalStorage();
    }
  }

  loadCartFromLocalStorage() {
    const data = localStorage.getItem('cart');
    this.cart = data ? JSON.parse(data) : [];
    this.calculateTotals();
  }

  loadCartFromApi() {
    this.productService.getCart().subscribe((res: any) => {
      // Backend returns a list of items which contains 'product' object and 'quantity'
      // Mapping might be needed if structure is slightly different, but assuming standard response for now based on routes/products.js
      this.cart = res;
      this.calculateTotals();
    }, (error) => {
      console.error('Error fetching cart', error);
      // Fallback or error handling
    });
  }

  // saveCart method is less relevant for API flow since we do singular updates, 
  // but we can keep it for purely local storage bulk updates if needed.
  // We will refactor usage of saveCart in increase/decrease/remove.

  increaseQty(item: CartItem) {
    if (this.authService.isLoggedIn()) {
      // When logged in, we update directly via API
      const newQty = item.quantity + 1;
      this.productService.updateCart(item.product.id, newQty).subscribe(res => {
        if (res.success) {
          item.quantity = newQty;
          this.calculateTotals();
        }
      });
    } else {
      item.quantity++;
      this.saveLocalCart();
    }
  }

  decreaseQty(item: CartItem) {
    if (item.quantity > 1) {
      if (this.authService.isLoggedIn()) {
        const newQty = item.quantity - 1;
        this.productService.updateCart(item.product.id, newQty).subscribe(res => {
          if (res.success) {
            item.quantity = newQty;
            this.calculateTotals();
          }
        });
      } else {
        item.quantity--;
        this.saveLocalCart();
      }
    }
  }

  removeItem(item: CartItem) {
    if (this.authService.isLoggedIn()) {
      this.productService.removeFromCart(item.product.id).subscribe(res => {
        if (res.success) {
          this.cart = this.cart.filter(i => i.id !== item.id);
          this.calculateTotals();
        }
      });
    } else {
      this.cart = this.cart.filter(i => i.id !== item.id);
      this.saveLocalCart();
    }
  }

  saveLocalCart() {
    localStorage.setItem('cart', JSON.stringify(this.cart));
    this.calculateTotals();
  }

  calculateTotals() {
    this.totalItems = this.cart.reduce((acc, item) => acc + item.quantity, 0);
    this.totalPrice = this.cart.reduce((acc, item) => acc + item.quantity * item.product.sellingPrice, 0);
  }

  goToMarketplace() {
    this.router.navigate(['/marketplace']);
  }

  checkout() {
    if (!this.authService.isLoggedIn()) {
      // Redirect to login or show message
      alert("Please login to checkout.");
      this.router.navigate(['/login']);
      return;
    }

    if (this.cart.length === 0) return;

    this.orderService.createOrder().subscribe(
      (res) => {
        if (res.success) {
          alert("Order placed successfully!");
          this.cart = []; // Clear local view
          this.calculateTotals();
          // Optionally navigate to orders page
          this.router.navigate(['/profile']); // or wherever "My Orders" is
        }
      },
      (err) => {
        console.error(err);
        alert("Failed to place order: " + (err.error?.message || err.message));
      }
    );
  }
}
