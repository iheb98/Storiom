import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  BASE_PATH = environment.BASE_PATH;
  baseUrl: string = this.BASE_PATH + '/expenses/';

  constructor(private http: HttpClient) { }

  getExpensesByStoreId(id, query): Observable<any> {
    return this.http.get<any>(this.baseUrl + 'store/' + id, {
      params: {
        ...query
      }
    });
  }

  getAllExpensesByStoreId(id): Observable<any> {
    return this.http.get<any>(this.baseUrl + 'all/store/' + id);
  }

  countExpensesByStoreId(id, query): Observable<any> {
    return this.http.get<any>(this.baseUrl + 'count/store/' + id,
      {
        params: {
          ...query
        }
      });
  }

  getExpense(id): Observable<any> {
    return this.http.get<any>(this.baseUrl + id);
  }




  addExpense(body): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'create', body);
  }

  updateExpense(body): Observable<any> {
    return this.http.put<any>(this.baseUrl + 'edit', body);
  }

  deleteExpense(id): Observable<any> {
    return this.http.delete<any>(this.baseUrl + "/" + id);
  }
}
