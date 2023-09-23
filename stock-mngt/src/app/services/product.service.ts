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

  getProductsByStoreId(id, query): Observable<any> {
    return this.http.get<any>(this.baseUrl + 'store/' + id, {
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
    return this.http.get<any>(this.baseUrl + 'count/store/' + id,
      {
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
}
