import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReceiptService {

  BASE_PATH = environment.BASE_PATH;
  baseUrl: string = this.BASE_PATH + '/receipts/';

  constructor(private http: HttpClient) { }

  getReceiptsByStoreId(id, query): Observable<any> {
    return this.http.get<any>(this.baseUrl + 'store/' + id, {
      params: {
        ...query
      }
    });
  }

  getAllReceiptsByStoreId(id): Observable<any> {
    return this.http.get<any>(this.baseUrl + 'all/store/' + id);
  }

  countReceiptsByStoreId(id, query): Observable<any> {
    return this.http.get<any>(this.baseUrl + 'count/store/' + id,
      {
        params: {
          ...query
        }
      });
  }

  getReceipt(id): Observable<any> {
    return this.http.get<any>(this.baseUrl + id);
  }




  addReceipt(body): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'create', body);
  }

  updateReceipt(body): Observable<any> {
    return this.http.put<any>(this.baseUrl + 'edit', body);
  }

  deleteReceipt(id): Observable<any> {
    return this.http.delete<any>(this.baseUrl + "/" + id);
  }
}
