import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    BASE_PATH = environment.BASE_PATH;

    constructor(private http: HttpClient) { }

    // Get orders for a specific store
    getStoreOrders(storeId: number): Observable<any> {
        return this.http.get(`${this.BASE_PATH}/orders/store/${storeId}`);
    }

    // Update order status
    updateOrderStatus(orderId: number, status: string): Observable<any> {
        return this.http.put(`${this.BASE_PATH}/orders/${orderId}/status`, { status });
    }

    // Get my orders (customer view - might be useful reuse)
    getMyOrders(): Observable<any> {
        return this.http.get(`${this.BASE_PATH}/orders/my-orders`);
    }

    // Create Order (Checkout)
    createOrder(): Observable<any> {
        return this.http.post(`${this.BASE_PATH}/orders/create`, {});
    }
}
