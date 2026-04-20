import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { StoreAuthService } from './store-auth.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private LS_KEY = 'cart';
  private _cartCount = new BehaviorSubject<number>(0);
  cartCount$ = this._cartCount.asObservable();

  private storeCartUrl = environment.apiUrl + '/store-customers';

  constructor(
    private http: HttpClient,
    private storeAuth: StoreAuthService
  ) {
    this.updateCartCount();
  }

  // ========================================
  // Public API — used by all components
  // ========================================

  getCart(): any[] {
    return JSON.parse(localStorage.getItem(this.LS_KEY) || '[]');
  }

  saveCart(cart: any[]) {
    localStorage.setItem(this.LS_KEY, JSON.stringify(cart));
    this._cartCount.next(cart.reduce((sum, item) => sum + (item.quantity || 1), 0));
  }

  addToCart(product: any, quantity: number = 1): void {
    // Always update localStorage immediately for UI
    this.addToLocalCart(product, quantity);

    // If logged in, also persist to the backend
    if (this.storeAuth.isLoggedIn()) {
      this.http.post(this.storeCartUrl + '/cart/add', { productId: product.id, quantity }, {
        headers: { Authorization: `Bearer ${this.storeAuth.getToken()}` }
      }).subscribe();
    }
  }

  removeFromCart(productId: number): void {
    this.removeFromLocalCart(productId);

    if (this.storeAuth.isLoggedIn()) {
      this.http.delete(this.storeCartUrl + '/cart/' + productId, {
        headers: { Authorization: `Bearer ${this.storeAuth.getToken()}` }
      }).subscribe();
    }
  }

  clearCart(): void {
    localStorage.removeItem(this.LS_KEY);
    this._cartCount.next(0);

    if (this.storeAuth.isLoggedIn()) {
      this.http.delete(this.storeCartUrl + '/cart', {
        headers: { Authorization: `Bearer ${this.storeAuth.getToken()}` }
      }).subscribe();
    }
  }

  updateQuantity(productId: number, quantity: number): void {
    const cart = this.getCart();
    const item = cart.find(i => (i.product?.id || i.id) === productId);
    if (item) {
      item.quantity = quantity;
      this.saveCart(cart);
    }

    if (this.storeAuth.isLoggedIn()) {
      this.http.put(this.storeCartUrl + '/cart/update', { productId, quantity }, {
        headers: { Authorization: `Bearer ${this.storeAuth.getToken()}` }
      }).subscribe();
    }
  }

  /**
   * Called after login to merge localStorage cart into the DB
   * and load the full persisted cart from the server.
   */
  syncCartOnLogin(): void {
    const localCart = this.getCart();
    const token = this.storeAuth.getToken();
    if (!token) return;

    const headers = { Authorization: `Bearer ${token}` };

    // Push local items to the API (server handles dedup)
    if (localCart.length > 0) {
      let synced = 0;
      localCart.forEach(item => {
        this.http.post(this.storeCartUrl + '/cart/add',
          { productId: item.product?.id || item.id, quantity: item.quantity || 1 },
          { headers }
        ).subscribe({
          next: () => { synced++; if (synced === localCart.length) this.loadCartFromApi(); },
          error: () => { synced++; if (synced === localCart.length) this.loadCartFromApi(); }
        });
      });
    } else {
      this.loadCartFromApi();
    }
  }

  /**
   * Load the full cart from API and save it to localStorage.
   */
  loadCartFromApi(): void {
    const token = this.storeAuth.getToken();
    if (!token) return;

    this.http.get<any[]>(this.storeCartUrl + '/cart', {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe(
      (items: any[]) => {
        const cart = items.map(item => ({
          id: item.product?.id || item.productId,
          product: item.product,
          quantity: item.quantity
        }));
        this.saveCart(cart);
      },
      () => {
        this.updateCartCount();
      }
    );
  }

  // ========================================
  // Private helpers
  // ========================================

  private addToLocalCart(product: any, quantity: number): void {
    const cart = this.getCart();
    const existing = cart.find(item => (item.product?.id || item.id) === product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ id: product.id, product, quantity });
    }
    this.saveCart(cart);
  }

  private removeFromLocalCart(productId: number): void {
    let cart = this.getCart();
    cart = cart.filter(item => (item.product?.id || item.id) !== productId);
    this.saveCart(cart);
  }

  private updateCartCount(): void {
    const cart = this.getCart();
    this._cartCount.next(cart.reduce((sum, item) => sum + (item.quantity || 1), 0));
  }
}
