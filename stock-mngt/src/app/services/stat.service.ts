import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StatService {

  BASE_PATH = environment.BASE_PATH;
  baseUrl: string = this.BASE_PATH + '/stats/';

  constructor(private http: HttpClient) { }

  getWidgets(id): Observable<any> {
    return this.http.get<any>(this.baseUrl + 'store/' + id + '/widgets');
  }

  getMostSoldProducts(id): Observable<any> {
    return this.http.get<any>(this.baseUrl + 'store/' + id + '/bestSelling');
  }

  getMostProfitableProducts(id): Observable<any> {
    return this.http.get<any>(this.baseUrl + 'store/' + id + '/mostProfitable');
  }

  getOperationStats(id, type, value): Observable<any> {
    return this.http.get<any>(this.baseUrl + 'store/' + id + '/operationStats', {
      params: {
        type,
        value
      }
    });
  }

  getOperationStatsPerProduct(id, type, value, product): Observable<any> {
    return this.http.get<any>(this.baseUrl + 'store/' + id + '/operationStats/product', {
      params: {
        type,
        value,
        product
      }
    });
  }

}
