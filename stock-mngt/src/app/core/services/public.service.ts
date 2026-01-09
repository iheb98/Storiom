import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PublicService {
  private apiUrl = environment.apiUrl + '/public';

  constructor(private http: HttpClient) { }

  /**
   * Fetches a list of random products for the homepage.
   * @param limit The number of products to fetch.
   */
  getRandomProducts(limit: number = 12): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/products/random?limit=${limit}`);
  }

  submitReview(reviewData: { rating: number, comment: string, productId: number }): Observable<any> {
    return this.http.post(`${this.apiUrl}/reviews`, reviewData);
  }

  getPublicProduct(id): Observable<any> {
    return this.http.get<any>(this.apiUrl + '/publicProduct/' + id);
  }

  getProductRecommendations(productId: number, limit: number = 8): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/products/${productId}/recommendations`, {
      params: { limit: limit.toString() }
    });
  }



  getPublicProducts(query): Observable<any> {
    const cleanParams: any = {};
    Object.keys(query).forEach(key => {
      if (query[key] != null && query[key] !== 'null' && query[key] !== '') {
        cleanParams[key] = query[key];
      }
    });
    return this.http.get<any>(this.apiUrl + '/allStores/products', {
      params: cleanParams
    });
  }

  countPublicProducts(query): Observable<any> {
    const cleanParams: any = {};
    Object.keys(query).forEach(key => {
      if (query[key] != null && query[key] !== 'null' && query[key] !== '') {
        cleanParams[key] = query[key];
      }
    });
    return this.http.get<any>(this.apiUrl + '/allStores/products/count', {
      params: cleanParams
    });
  }

  getAllStores(): Observable<any> {
    return this.http.get<any>(this.apiUrl + '/allStores');
  }

  getStoreById(id: any): Observable<any> {
    return this.http.get<any>(this.apiUrl + '/store/' + id);
  }


  /**
   * Fetches the category tree for the sidebar.
   */
  getCategoryTree(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/categories/tree`);
  }

  getPlatformStats(): Observable<{ stores: number, products: number, categories: number }> {
    return this.http.get<{ stores: number, products: number, categories: number }>(`${this.apiUrl}/platform-stats`);
  }

  sendContactMessage(data: { name: string, email: string, subject: string, message: string }): Observable<{ success: boolean, message: string }> {
    return this.http.post<{ success: boolean, message: string }>(`${this.apiUrl}/contact`, data);
  }
}