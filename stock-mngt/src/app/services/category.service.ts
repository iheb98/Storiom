import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  BASE_PATH = environment.BASE_PATH;
  baseUrl: string = this.BASE_PATH + '/categories/';

  constructor(private http: HttpClient) { }

  getCategoriesByStoreId(id): Observable<any> {
    return this.http.get<any>(this.baseUrl + 'store/' + id);
  }

  getCategory(id): Observable<any> {
    return this.http.get<any>(this.baseUrl + id);
  }


  addCategory(body): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'create', body);
  }

  updateCategory(body): Observable<any> {
    return this.http.put<any>(this.baseUrl + 'edit', body);
  }

  uploadFile(file): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'uploadFile', file);
  }

  deleteCategory(id): Observable<any> {
    return this.http.delete<any>(this.baseUrl + "/" + id);
  }
}
