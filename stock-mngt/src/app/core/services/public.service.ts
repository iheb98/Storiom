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

  getPublicProduct(id): Observable<any> {
    return this.http.get<any>(this.apiUrl + '/publicProduct/' + id);
  }


  getPublicProducts(query): Observable<any> {
    return this.http.get<any>(this.apiUrl + '/allStores/products', {
      params: {
        ...query
      }
    });
  }

  countPublicProducts(query): Observable<any> {
    return this.http.get<any>(this.apiUrl + '/allStores/products/count', {
      params: {
        ...query
      }
    });
  }

  getAllStores(): Observable<any> {
    return this.http.get<any>(this.apiUrl + '/allStores');
  }


  /**
   * Fetches the category tree for the sidebar.
   */
  getCategoryTree(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/categories/tree`);
  }
}