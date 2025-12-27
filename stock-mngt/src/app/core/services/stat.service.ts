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

  getOperationStatsByCategory(id, type, value): Observable<any> {
    return this.http.get<any>(this.baseUrl + 'store/' + id + '/operationStats/categories', {
      params: {
        type,
        value
      }
    });
  }

  generateReport(id, from, to): Observable<any> {
    return this.http.get<any>(this.baseUrl + 'store/' + id + '/generate-report', {
      params: {
        from,
        to
      }
    });
  }

  getOperationStatsByCategoryItems(id, type, value): Observable<any> {
    return this.http.get<any>(this.baseUrl + 'store/' + id + '/operationStats/categories/items', {
      params: {
        type,
        value
      }
    });
  }

   getCategoriesTotalSold(id, type, value): Observable<any> {
    return this.http.get<any>(this.baseUrl + 'store/' + id + '/total-sold-pie', {
      params: {
        type,
        value
      }
    });
  }

  getCategoriesTotalNetSold(id, type, value): Observable<any> {
    return this.http.get<any>(this.baseUrl + 'store/' + id + '/net-sold-pie', {
      params: {
        type,
        value
      }
    });
  }

    getParentCateoriesStats(id): Observable<any> {
    return this.http.get<any>(this.baseUrl + 'store/' + id + '/parentCategoriesStats');
  }

}
