import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AnalyticsService {
    private baseUrl = environment.BASE_PATH + '/analytics';

    constructor(private http: HttpClient) { }

    /**
     * Track a product event (view, click, cart_add, order, wishlist)
     */
    trackEvent(data: {
        productId: number;
        interactionType: 'view' | 'click' | 'cart_add' | 'cart_remove' | 'order' | 'wishlist_add' | 'wishlist_remove' | 'search';
        userId?: number;
        storeId?: number;
        categoryId?: number;
        quantity?: number;
        searchTerm?: string;
        sessionId?: string;
    }): Observable<any> {
        return this.http.post(`${this.baseUrl}/track`, data);
    }

    /**
     * Get product statistics
     */
    getProductStats(productId: number): Observable<any> {
        return this.http.get(`${this.baseUrl}/product/${productId}`);
    }

    /**
     * Get trending products
     */
    getTrending(storeId?: number, limit: number = 10): Observable<any> {
        let url = `${this.baseUrl}/trending?limit=${limit}`;
        if (storeId) url += `&storeId=${storeId}`;
        return this.http.get(url);
    }

    /**
     * Get personalized recommendations for a user
     */
    getRecommendations(userId: number, limit: number = 10, storeId?: number): Observable<any> {
        let url = `${this.baseUrl}/recommendations/${userId}?limit=${limit}`;
        if (storeId) url += `&storeId=${storeId}`;
        return this.http.get(url);
    }

    /**
     * Get similar products
     */
    getSimilarProducts(productId: number, limit: number = 5): Observable<any> {
        return this.http.get(`${this.baseUrl}/similar/${productId}?limit=${limit}`);
    }

    /**
     * Get store analytics summary
     */
    getStoreAnalytics(storeId: number): Observable<any> {
        return this.http.get(`${this.baseUrl}/store/${storeId}`);
    }
}
