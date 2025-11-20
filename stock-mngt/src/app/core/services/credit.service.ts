import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CreditService {
  BASE_PATH = environment.BASE_PATH;
  baseUrl: string = this.BASE_PATH + '/credits/';

  constructor(private http: HttpClient) { }

  getBorrowersByStoreId(id, query): Observable<any> {
    return this.http.get<any>(this.baseUrl + 'store/' + id, {
      params: {
        ...query
      }
    });
  }

  getAllBorrowersByStoreId(id): Observable<any> {
    return this.http.get<any>(this.baseUrl + 'all/store/' + id);
  }

  countBorrowersByStoreId(id, query): Observable<any> {
    return this.http.get<any>(this.baseUrl + 'count/store/' + id,
      {
        params: {
          ...query
        }
      });
  }

  getBorrower(id): Observable<any> {
    return this.http.get<any>(this.baseUrl + id);
  }




  addBorrower(body): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'create', body);
  }

  updateBorrower(body): Observable<any> {
    return this.http.put<any>(this.baseUrl + 'edit', body);
  }

  deleteBorrower(id): Observable<any> {
    return this.http.delete<any>(this.baseUrl + "/" + id);
  }
}

