import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { CartService } from 'src/app/core/services/cart.service';
import { ProductService } from 'src/app/core/services/product.service';
import { OrderService } from 'src/app/core/services/order.service';
import { environment } from 'src/environments/environment';
import { ToastService } from 'src/app/core/services/toast.service';
import {
  faShoppingCart, faStore, faCheck, faTimes, faMinus, faPlus,
  faTrash, faLock, faShieldAlt, faArrowLeft, faShoppingBag
} from '@fortawesome/free-solid-svg-icons';

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
  environment = environment;
  cart: CartItem[] = [];
  totalItems = 0;
  totalPrice = 0;
  isLoading = false;

  // Icons
  faShoppingCart = faShoppingCart;
  faStore = faStore;
  faCheck = faCheck;
  faTimes = faTimes;
  faMinus = faMinus;
  faPlus = faPlus;
  faTrash = faTrash;
  faLock = faLock;
  faShieldAlt = faShieldAlt;
  faArrowLeft = faArrowLeft;
  faShoppingBag = faShoppingBag;

  constructor(
    private router: Router,
    private authService: AuthService,
    private cartService: CartService,
    private productService: ProductService,
    private orderService: OrderService,
    private toastService: ToastService
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
    this.parseProductImages();
    this.calculateTotals();
  }

  loadCartFromApi() {
    this.isLoading = true;
    this.productService.getCart().subscribe((res: any) => {
      this.cart = res;
      this.parseProductImages();
      this.calculateTotals();
      this.isLoading = false;
    }, (error) => {
      console.error('Error fetching cart', error);
      this.isLoading = false;
    });
  }

  parseProductImages() {
    this.cart.forEach(item => {
      if (item.product?.images && typeof item.product.images === 'string') {
        try {
          item.product.images = JSON.parse(item.product.images);
        } catch {
          item.product.images = [];
        }
      }
    });
  }

  getProductImage(product: any): string {
    if (!product?.images) return 'assets/default_product.png';

    let images = product.images;

    if (typeof images === 'string') {
      try {
        images = JSON.parse(images);
      } catch {
        return 'assets/default_product.png';
      }
    }

    if (Array.isArray(images) && images.length > 0) {
      return this.environment.backend + '/' + images[0];
    }

    return 'assets/default_product.png';
  }

  isDefaultImage(product: any): boolean {
    if (!product?.images) return true;

    let images = product.images;

    if (typeof images === 'string') {
      try {
        images = JSON.parse(images);
      } catch {
        return true;
      }
    }

    return !Array.isArray(images) || images.length === 0;
  }

  increaseQty(item: CartItem) {
    if (this.authService.isLoggedIn()) {
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
          this.toastService.showSuccess('Produit retiré du panier');
        }
      });
    } else {
      this.cart = this.cart.filter(i => i.id !== item.id);
      this.saveLocalCart();
      this.toastService.showSuccess('Produit retiré du panier');
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
    this.router.navigate(['/publicProducts']);
  }

  checkout() {
    if (!this.authService.isLoggedIn()) {
      this.toastService.showWarning("Veuillez vous connecter pour commander.");
      this.router.navigate(['/login']);
      return;
    }

    if (this.cart.length === 0) return;

    this.orderService.createOrder().subscribe(
      (res) => {
        if (res.success) {
          this.toastService.showSuccess("Commande passée avec succès !");
          this.cart = [];
          this.calculateTotals();
          this.router.navigate(['/profile']);
        }
      },
      (err) => {
        console.error(err);
        this.toastService.showError("Échec de la commande : " + (err.error?.message || err.message));
      }
    );
  }
}
