import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DeliveryWorkerService {

    BASE_PATH = environment.BASE_PATH;
    baseUrl: string = this.BASE_PATH + '/delivery-workers/';

    constructor(private http: HttpClient) { }

    getByStoreId(storeId: number): Observable<any> {
        return this.http.get<any>(this.baseUrl + 'store/' + storeId);
    }

    getById(id: number): Observable<any> {
        return this.http.get<any>(this.baseUrl + id);
    }

    create(body: any): Observable<any> {
        return this.http.post<any>(this.baseUrl, body);
    }

    update(id: number, body: any): Observable<any> {
        return this.http.put<any>(this.baseUrl + id, body);
    }

    delete(id: number): Observable<any> {
        return this.http.delete<any>(this.baseUrl + id);
    }
}
