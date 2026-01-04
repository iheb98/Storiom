import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ServiceRequestService {
    BASE_PATH = environment.BASE_PATH;

    constructor(private http: HttpClient) { }

    // Get customer's service requests
    getMyRequests(): Observable<any> {
        return this.http.get(`${this.BASE_PATH}/service-requests/my-requests`);
    }

    // Get store's service requests (admin)
    getByStoreId(storeId: number): Observable<any> {
        return this.http.get(`${this.BASE_PATH}/service-requests/store/${storeId}`);
    }

    // Get single request
    getById(id: number): Observable<any> {
        return this.http.get(`${this.BASE_PATH}/service-requests/${id}`);
    }

    // Create service request (logged in user)
    create(request: any): Observable<any> {
        return this.http.post(`${this.BASE_PATH}/service-requests`, request);
    }

    // Create guest service request (admin - for customers without account)
    createGuest(request: any): Observable<any> {
        return this.http.post(`${this.BASE_PATH}/service-requests/guest`, request);
    }

    // Public lookup by phone and tracking code (for guests)
    lookup(phone: string, code: string): Observable<any> {
        return this.http.post(`${this.BASE_PATH}/service-requests/lookup`, { phone, code });
    }

    // Update request status
    updateStatus(id: number, status: string, price?: number): Observable<any> {
        return this.http.put(`${this.BASE_PATH}/service-requests/${id}/status`, { status, price });
    }

    // Update request (notes, price)
    update(id: number, data: any): Observable<any> {
        return this.http.put(`${this.BASE_PATH}/service-requests/${id}`, data);
    }

    // Delete request
    delete(id: number): Observable<any> {
        return this.http.delete(`${this.BASE_PATH}/service-requests/${id}`);
    }
}

