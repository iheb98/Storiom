import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StoreAuthService } from 'src/app/core/services/store-auth.service';
import { CartService } from 'src/app/core/services/cart.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { DomainService } from 'src/app/core/services/domain.service';
import { PublicService } from 'src/app/core/services/public.service';
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
  placingOrder = false;

  // Theme settings
  checkoutText = 'Commander';
  showContinueShopping = true;
  showFreeShipping = false;
  deliveryCost = 0;

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
    private toastService: ToastService,
    private domainService: DomainService,
    private publicService: PublicService
  ) {}

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'auto' });

    if (this.domainService.isCustomDomain) {
      this.basePath = '/store-home';
      this.isPreviewMode = false;
    } else {
      const storeId = this.route.parent?.snapshot.paramMap.get('storeId');
      this.isPreviewMode = !!storeId;
      this.basePath = storeId ? `/preview-store/${storeId}` : '/store-home';
    }

    if (this.storeAuth.isLoggedIn()) {
      this.loadCartFromApi();
    } else {
      this.loadCartFromLocalStorage();
    }

    this.loadThemeConfig();
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

  get totalWithDelivery(): number {
    return this.totalPrice + (this.deliveryCost || 0);
  }

  continueShopping(): void {
    this.router.navigate([this.basePath, 'products']);
  }

  checkout(): void {
    if (this.isPreviewMode) {
      this.toastService.showWarning('Commande impossible en mode aperçu');
      return;
    }

    // If not logged in as store customer, redirect to store login
    if (!this.storeAuth.isLoggedIn()) {
      this.toastService.showWarning('Veuillez vous connecter pour commander.');
      this.router.navigate([this.basePath, 'login']);
      return;
    }

    // Build order items
    const items = this.cart.map(item => ({
      productId: item.product?.id || item.product?.productId,
      quantity: item.quantity
    }));

    if (!items.length) return;

    const customer = this.storeAuth.getCustomer();

    this.placingOrder = true;
    this.storeAuth.placeOrder({
      items,
      customerName: customer ? `${customer.firstName} ${customer.lastName}` : '',
      customerPhone: customer?.phone || '',
      customerAddress: customer?.address
        ? [customer.address.street, customer.address.city, customer.address.state, customer.address.postalCode].filter(v => v).join(', ')
        : ''
    }).subscribe({
      next: (res: any) => {
        this.placingOrder = false;
        if (res.success) {
          this.toastService.showSuccess('Commande passée avec succès !');
          // Clear cart
          this.cartService.clearCart();
          this.cart = [];
          this.calculateTotals();
          this.router.navigate([this.basePath, 'account']);
        } else {
          this.toastService.showError(res.message || 'Erreur lors de la commande.');
        }
      },
      error: (err: any) => {
        this.placingOrder = false;
        this.toastService.showError(err?.error?.message || 'Erreur lors de la commande.');
      }
    });
  }

  loadThemeConfig(): void {
    const storeId = this.route.parent?.snapshot.paramMap.get('storeId')
      || this.domainService.storeId?.toString();
    if (!storeId) return;
    this.publicService.getStoreById(storeId).subscribe((store: any) => {
      const cp = store.theme?.cartPage;
      if (cp) {
        this.checkoutText = cp.checkoutText || 'Commander';
        this.showContinueShopping = cp.showContinueShopping !== false;
        this.showFreeShipping = cp.showFreeShipping !== false;
        this.deliveryCost = cp.deliveryCost || 0;
      }
    });
  }
}
