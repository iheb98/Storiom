import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BrandService {
  BASE_PATH = environment.BASE_PATH;
  baseUrl: string = this.BASE_PATH + '/brands/';

  constructor(private http: HttpClient) { }

  getBrandsByStoreId(id): Observable<any> {
    return this.http.get<any>(this.baseUrl + 'store/' + id);
  }

  getBrand(id): Observable<any> {
    return this.http.get<any>(this.baseUrl + id);
  }

  addBrand(body): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'create', body);
  }

  updateBrand(body): Observable<any> {
    return this.http.put<any>(this.baseUrl + 'edit', body);
  }

  deleteBrand(id): Observable<any> {
    return this.http.delete<any>(this.baseUrl + "/" + id);
  }
}
