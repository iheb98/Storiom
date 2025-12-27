import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {

  BASE_PATH = environment.BASE_PATH;
  baseUrl: string = this.BASE_PATH + '/suppliers/';

  constructor(private http: HttpClient) { }

  getSuppliersByStoreId(id, query): Observable<any> {
    return this.http.get<any>(this.baseUrl + 'store/' + id, {
      params: {
        ...query
      }
    });
  }

  getAllSuppliersByStoreId(id): Observable<any> {
    return this.http.get<any>(this.baseUrl + 'all/store/' + id);
  }

  countSuppliersByStoreId(id, query): Observable<any> {
    return this.http.get<any>(this.baseUrl + 'count/store/' + id,
      {
        params: {
          ...query
        }
      });
  }

  getSupplier(id): Observable<any> {
    return this.http.get<any>(this.baseUrl + id);
  }




  addSupplier(body): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'create', body);
  }

  updateSupplier(body): Observable<any> {
    return this.http.put<any>(this.baseUrl + 'edit', body);
  }

  deleteSupplier(id): Observable<any> {
    return this.http.delete<any>(this.baseUrl + "/" + id);
  }
}
