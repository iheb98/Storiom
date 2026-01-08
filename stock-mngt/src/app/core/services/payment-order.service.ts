import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface PaymentOrderCreate {
    paymentType: 'SUBSCRIPTION' | 'STORAGE_EXTENSION';
    subscriptionPlan?: '1M' | '3M' | '6M' | '12M';
    storageGB?: number;
    storageDuration?: '1M' | '3M' | '6M' | '12M';
}

export interface BankInstructions {
    bankName: string;
    accountHolder: string;
    rib: string;
    instructions: string[];
}

export interface PaymentOrder {
    id: number;
    orderNumber: string;
    userId: number;
    paymentType: 'SUBSCRIPTION' | 'STORAGE_EXTENSION';
    subscriptionPlan?: '1M' | '3M' | '6M' | '12M';
    storageGB?: number;
    amount: number;
    currency: string;
    status: 'PENDING' | 'USER_CONFIRMED' | 'PAID' | 'CANCELLED';
    userConfirmedAt?: Date;
    bankReference?: string;
    validatedAt?: Date;
    validatedBy?: number;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
    user?: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
    };
}

export interface PricingInfo {
    subscription: { [key: string]: number };
    storage: { pricePerUnit: number; unitSizeGB: number };
    storagePlans?: { [key: number]: { [key: string]: number } };
    currency: string;
}

@Injectable({
    providedIn: 'root'
})
export class PaymentOrderService {
    private baseUrl = environment.BASE_PATH + '/payment-orders/';

    constructor(private http: HttpClient) { }

    // Get pricing info
    getPricing(): Observable<PricingInfo> {
        return this.http.get<PricingInfo>(this.baseUrl + 'pricing');
    }

    // Create a new payment order
    createOrder(data: PaymentOrderCreate): Observable<{ success: boolean; order: PaymentOrder; bankInstructions: BankInstructions }> {
        return this.http.post<any>(this.baseUrl + 'create', data);
    }

    // Get user's orders
    getMyOrders(): Observable<{ success: boolean; orders: PaymentOrder[] }> {
        return this.http.get<any>(this.baseUrl + 'my-orders');
    }

    // Get single order
    getOrder(id: number): Observable<{ success: boolean; order: PaymentOrder; bankInstructions: BankInstructions }> {
        return this.http.get<any>(this.baseUrl + id);
    }

    // User confirms payment made
    confirmPayment(id: number): Observable<{ success: boolean; message: string; order: PaymentOrder }> {
        return this.http.post<any>(this.baseUrl + id + '/confirm-payment', {});
    }

    // User cancels their own order
    cancelMyOrder(id: number): Observable<{ success: boolean; message: string; order: PaymentOrder }> {
        return this.http.post<any>(this.baseUrl + id + '/cancel', {});
    }

    // ============================================
    // ADMIN METHODS
    // ============================================

    // Get all orders (admin)
    getAllOrders(status?: string): Observable<{ success: boolean; orders: PaymentOrder[] }> {
        const url = status ? `${this.baseUrl}admin/all?status=${status}` : `${this.baseUrl}admin/all`;
        return this.http.get<any>(url);
    }

    // Validate order (admin)
    validateOrder(id: number, bankReference?: string, notes?: string): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'admin/' + id + '/validate', { bankReference, notes });
    }

    // Cancel order (admin)
    cancelOrder(id: number, notes?: string): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'admin/' + id + '/cancel', { notes });
    }
}
