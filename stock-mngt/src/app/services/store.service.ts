import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  BASE_PATH = environment.BASE_PATH;
  baseUrl: string = this.BASE_PATH + '/stores/';

  constructor(private http: HttpClient) { }

  getStoresByUserId(id): Observable<any> {
    return this.http.get<any>(this.baseUrl + 'user/' + id);
  }

  getStore(id): Observable<any> {
    return this.http.get<any>(this.baseUrl + id);
  }


  addStore(body): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'create', body);
  }

  updateStore(body): Observable<any> {
    return this.http.put<any>(this.baseUrl, body);
  }

  uploadFile(file): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'uploadFile', file);
  }

  deleteStore(id): Observable<any> {
    return this.http.delete<any>(this.baseUrl + "/" + id);
  }
}
