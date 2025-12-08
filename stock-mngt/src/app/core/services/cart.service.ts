import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private LS_KEY = 'cart';

  constructor() {}

  getCart(): any[] {
    return JSON.parse(localStorage.getItem(this.LS_KEY) || '[]');
  }

  saveCart(cart: any[]) {
    localStorage.setItem(this.LS_KEY, JSON.stringify(cart));
  }

  addToCart(product: any, quantity: number = 1): void {
    const cart = this.getCart();

    const existing = cart.find(item => item.product.id === product.id);

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        id: product.id,
        product,
        quantity
      });
    }

    this.saveCart(cart);
  }

  removeFromCart(productId: number): void {
    let cart = this.getCart();
    cart = cart.filter(item => item.product.id !== productId);
    this.saveCart(cart);
  }

  clearCart(): void {
    localStorage.removeItem(this.LS_KEY);
  }
}
