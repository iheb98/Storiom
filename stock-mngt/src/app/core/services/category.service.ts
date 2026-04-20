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

  getFlatCategoriesByStoreId(id): Observable<any> {
    return this.http.get<any>(this.baseUrl + 'store/' + id + '/flat');
  }

  getCategory(id): Observable<any> {
    return this.http.get<any>(this.baseUrl + id);
  }

  getParentCategory(id): Observable<any> {
    return this.http.get<any>(this.baseUrl +'parent/'+ id);
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

  // ========================================
  // Store Category Visibility
  // ========================================

  getStoreVisibility(storeId: number): Observable<any> {
    return this.http.get<any>(this.baseUrl + 'store/' + storeId + '/visibility');
  }

  toggleCategoryVisibility(storeId: number, categoryId: number, visible: boolean): Observable<any> {
    return this.http.put<any>(this.baseUrl + 'store/' + storeId + '/visibility/' + categoryId, { visible });
  }

  bulkSetVisibility(storeId: number, categories: { categoryId: number; visible: boolean }[]): Observable<any> {
    return this.http.put<any>(this.baseUrl + 'store/' + storeId + '/visibility', { categories });
  }
}
