import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  BASE_PATH = environment.BASE_PATH;
  baseUrl: string = this.BASE_PATH + '/products/';

  constructor(private http: HttpClient) { }

  // ===========================
  // 🔥 CART API METHODS (NEW)
  // ===========================

  addToCart(productId: number, quantity: number = 1): Observable<any> {
    return this.http.post(this.baseUrl + 'cart/add', { productId, quantity });
  }

  updateCart(productId: number, quantity: number): Observable<any> {
    return this.http.put(this.baseUrl + 'cart/update', { productId, quantity });
  }

  getCart(): Observable<any> {
    return this.http.get(this.baseUrl + 'cart');
  }

  removeFromCart(productId: number): Observable<any> {
    return this.http.delete(this.baseUrl + 'cart/' + productId);
  }

  clearCart(): Observable<any> {
    return this.http.delete(this.baseUrl + 'cart/clear');
  }


  // ===========================
  // EXISTING PRODUCT METHODS
  // ===========================

  getProductsByStoreId(id, query): Observable<any> {
    return this.http.get<any>(this.baseUrl + 'store/' + id, {
      params: {
        ...query
      }
    });
  }

  getProductsAllStores(query): Observable<any> {
    return this.http.get<any>(this.baseUrl + 'allStores', {
      params: {
        ...query
      }
    });
  }

  getPublicProducts(query): Observable<any> {
    return this.http.get<any>(this.baseUrl + 'allStores/products', {
      params: {
        ...query
      }
    });
  }

  countPublicProducts(query): Observable<any> {
    return this.http.get<any>(this.baseUrl + 'allStores/products/count', {
      params: {
        ...query
      }
    });
  }

  countProductsAllStores(query): Observable<any> {
    return this.http.get<any>(this.baseUrl + 'count/allStores', {
      params: {
        ...query
      }
    });
  }

  getCriticalStockProducts(id): Observable<any> {
    return this.http.get<any>(this.baseUrl + 'store/' + id + '/critical');
  }

  getAllProductsByStoreId(id): Observable<any> {
    return this.http.get<any>(this.baseUrl + 'all/store/' + id);
  }

  countProductsByStoreId(id, query): Observable<any> {
    return this.http.get<any>(this.baseUrl + 'count/store/' + id, {
      params: {
        ...query
      }
    });
  }

  getProduct(id): Observable<any> {
    return this.http.get<any>(this.baseUrl + id);
  }

  addProduct(body): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'create', body);
  }

  updateProduct(body): Observable<any> {
    return this.http.put<any>(this.baseUrl + 'edit', body);
  }

  deleteProduct(id): Observable<any> {
    return this.http.delete<any>(this.baseUrl + id);
  }

  bulkUpdateVisibility(body: { ids: number[], toDisplay: boolean, updateAll?: boolean, storeId?: number }): Observable<any> {
    return this.http.put<any>(this.baseUrl + 'bulk-visibility', body);
  }
}
