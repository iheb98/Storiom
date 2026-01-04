import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class StoreServiceService {
    BASE_PATH = environment.BASE_PATH;

    constructor(private http: HttpClient) { }

    // Get all services for a store
    getByStoreId(storeId: number): Observable<any> {
        return this.http.get(`${this.BASE_PATH}/store-services/store/${storeId}`);
    }

    // Get active services for a store (public)
    getActiveByStoreId(storeId: number): Observable<any> {
        return this.http.get(`${this.BASE_PATH}/store-services/store/${storeId}/active`);
    }

    // Get single service
    getById(id: number): Observable<any> {
        return this.http.get(`${this.BASE_PATH}/store-services/${id}`);
    }

    // Create service
    create(service: any): Observable<any> {
        return this.http.post(`${this.BASE_PATH}/store-services`, service);
    }

    // Update service
    update(id: number, service: any): Observable<any> {
        return this.http.put(`${this.BASE_PATH}/store-services/${id}`, service);
    }

    // Delete service
    delete(id: number): Observable<any> {
        return this.http.delete(`${this.BASE_PATH}/store-services/${id}`);
    }

    // Get all public services from all stores
    getAllPublic(searchable?: string): Observable<any> {
        const params = searchable ? { searchable } : {};
        return this.http.get(`${this.BASE_PATH}/public/allServices`, { params });
    }
}
