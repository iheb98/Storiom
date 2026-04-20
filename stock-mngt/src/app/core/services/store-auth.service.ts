import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { DomainService } from './domain.service';

export interface StoreCustomer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  storeId: number;
}

@Injectable({
  providedIn: 'root'
})
export class StoreAuthService {
  private apiUrl = environment.apiUrl + '/store-customers';
  private TOKEN_KEY = 'store_customer_token';
  private REFRESH_KEY = 'store_customer_refresh_token';

  private _customer = new BehaviorSubject<StoreCustomer | null>(null);
  customer$ = this._customer.asObservable();

  constructor(
    private http: HttpClient,
    private domainService: DomainService
  ) {
    // Try to restore session from token
    if (this.isLoggedIn()) {
      this.loadProfile();
    }
  }

  get storeId(): number | null {
    return this.domainService.storeId;
  }

  register(data: { firstName: string; lastName: string; email: string; phone?: string; password: string }, storeIdOverride?: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, { ...data, storeId: storeIdOverride || this.storeId });
  }

  login(email: string, password: string, storeIdOverride?: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password, storeId: storeIdOverride || this.storeId }).pipe(
      tap(res => {
        if (res.success && res.accessToken) {
          this.storeTokens(res.accessToken, res.refreshToken);
          this.loadProfile();
        }
      })
    );
  }

  confirmAccount(token: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/confirm`, { token }).pipe(
      tap(res => {
        if (res.success && res.accessToken) {
          this.storeTokens(res.accessToken, res.refreshToken);
          this.loadProfile();
        }
      })
    );
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email, storeId: this.storeId });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, { token, newPassword });
  }

  loadProfile(): void {
    const token = this.getToken();
    if (!token) return;
    this.http.get<any>(`${this.apiUrl}/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: res => {
        if (res.success) this._customer.next(res.customer);
      },
      error: () => this.logout()
    });
  }

  updateProfile(data: Partial<StoreCustomer>): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, data, {
      headers: { Authorization: `Bearer ${this.getToken()}` }
    });
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getCustomer(): StoreCustomer | null {
    return this._customer.value;
  }

  storeTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_KEY, refreshToken);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    this._customer.next(null);
  }

  placeOrder(data: { items: { productId: number; quantity: number }[]; customerName?: string; customerPhone?: string; customerAddress?: string; notes?: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/place-order`, data, {
      headers: { Authorization: `Bearer ${this.getToken()}` }
    });
  }

  getMyOrders(): Observable<any> {
    return this.http.get(`${this.apiUrl}/my-orders`, {
      headers: { Authorization: `Bearer ${this.getToken()}` }
    });
  }

  submitReview(data: { rating: number; comment: string; productId: number }): Observable<any> {
    return this.http.post(`${this.apiUrl}/reviews`, data, {
      headers: { Authorization: `Bearer ${this.getToken()}` }
    });
  }

  getProductReviews(productId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/reviews/${productId}`);
  }
}
