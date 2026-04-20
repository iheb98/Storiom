import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StoreAuthService } from 'src/app/core/services/store-auth.service';
import { CartService } from 'src/app/core/services/cart.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { environment } from 'src/environments/environment.prod';
import {
  faShoppingCart, faMinus, faPlus, faTrash, faArrowLeft, faLock, faShoppingBag
} from '@fortawesome/free-solid-svg-icons';

interface CartItem {
  id: number;
  product: any;
  quantity: number;
}

@Component({
  selector: 'app-store-cart',
  templateUrl: './store-cart.component.html',
  styleUrls: ['./store-cart.component.scss']
})
export class StoreCartComponent implements OnInit {
  environment = environment;
  cart: CartItem[] = [];
  totalItems = 0;
  totalPrice = 0;
  isLoading = false;
  isPreviewMode = false;
  basePath = '';

  // Icons
  faShoppingCart = faShoppingCart;
  faMinus = faMinus;
  faPlus = faPlus;
  faTrash = faTrash;
  faArrowLeft = faArrowLeft;
  faLock = faLock;
  faShoppingBag = faShoppingBag;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private storeAuth: StoreAuthService,
    private cartService: CartService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'auto' });

    const storeId = this.route.parent?.snapshot.paramMap.get('storeId');
    this.isPreviewMode = !!storeId;
    this.basePath = storeId ? `/preview-store/${storeId}` : '';

    if (this.storeAuth.isLoggedIn()) {
      this.loadCartFromApi();
    } else {
      this.loadCartFromLocalStorage();
    }
  }

  loadCartFromLocalStorage(): void {
    this.cart = this.cartService.getCart();
    this.parseProductImages();
    this.calculateTotals();
  }

  loadCartFromApi(): void {
    this.isLoading = true;
    this.cartService.loadCartFromApi();
    // Wait a moment for the API to update localStorage, then reload
    setTimeout(() => {
      this.cart = this.cartService.getCart();
      this.parseProductImages();
      this.calculateTotals();
      this.isLoading = false;
    }, 800);
  }

  parseProductImages(): void {
    this.cart.forEach(item => {
      if (item.product?.images && typeof item.product.images === 'string') {
        try { item.product.images = JSON.parse(item.product.images); } catch { item.product.images = []; }
      }
    });
  }

  getProductImage(product: any): string {
    let images = product?.images;
    if (!images) return 'assets/default_product.png';
    if (typeof images === 'string') {
      try { images = JSON.parse(images); } catch { return 'assets/default_product.png'; }
    }
    const idx = product?.mainImageIndex || 0;
    if (Array.isArray(images) && images.length > 0) {
      return this.environment.backend + '/' + images[images.length > idx ? idx : 0];
    }
    return 'assets/default_product.png';
  }

  getDiscountedPrice(product: any): number {
    if (!product?.discount || product.discount <= 0) return product?.sellingPrice || 0;
    return product.sellingPrice * (1 - product.discount / 100);
  }

  increaseQty(item: CartItem): void {
    item.quantity++;
    this.cartService.updateQuantity(item.product.id, item.quantity);
    this.calculateTotals();
  }

  decreaseQty(item: CartItem): void {
    if (item.quantity <= 1) return;
    item.quantity--;
    this.cartService.updateQuantity(item.product.id, item.quantity);
    this.calculateTotals();
  }

  removeItem(item: CartItem): void {
    this.cartService.removeFromCart(item.product.id);
    this.cart = this.cart.filter(i => i.id !== item.id);
    this.calculateTotals();
    this.toastService.showSuccess('Produit retiré du panier');
  }



  calculateTotals(): void {
    this.totalItems = this.cart.reduce((acc, item) => acc + item.quantity, 0);
    this.totalPrice = this.cart.reduce((acc, item) => acc + item.quantity * this.getDiscountedPrice(item.product), 0);
  }

  continueShopping(): void {
    this.router.navigate([this.basePath, 'products']);
  }

  checkout(): void {
    if (this.isPreviewMode) {
      this.toastService.showWarning('Commande impossible en mode aperçu');
      return;
    }
    // Real checkout would go here
    this.toastService.showWarning('Veuillez vous connecter pour commander.');
    this.router.navigate(['/login']);
  }
}
