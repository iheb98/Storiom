import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  BASE_PATH = environment.BASE_PATH;
  baseUrl: string = this.BASE_PATH + '/stores/';

  // Subject to notify when store is updated
  private storeUpdatedSource = new Subject<void>();
  storeUpdated$ = this.storeUpdatedSource.asObservable();

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
    return this.http.put<any>(this.baseUrl + 'edit', body);
  }

  uploadFile(file): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'uploadFile', file);
  }

  deleteStore(id): Observable<any> {
    return this.http.delete<any>(this.baseUrl + "/" + id);
  }

  // Notify subscribers that store has been updated
  notifyStoreUpdate() {
    this.storeUpdatedSource.next();
  }

  // Storage tracking
  getStorageUsage(storeId: number): Observable<any> {
    return this.http.get<any>(this.baseUrl + storeId + '/storage');
  }

  updateStorageUsage(storeId: number, bytes: number, operation: 'add' | 'subtract'): Observable<any> {
    return this.http.post<any>(this.baseUrl + storeId + '/storage/update', { bytes, operation });
  }

  purchaseStorageExtension(storeId: number): Observable<any> {
    return this.http.post<any>(this.baseUrl + storeId + '/storage/purchase', {});
  }

  getStoragePurchases(storeId: number): Observable<any> {
    return this.http.get<any>(this.baseUrl + storeId + '/storage-purchases');
  }
}
