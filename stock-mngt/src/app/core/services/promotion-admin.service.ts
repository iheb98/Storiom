import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface PromotionConfig {
    id: number;
    isActive: boolean;
    discountPercent: number;
    maxUsers: number;
    usedCount: number;
    description: string;
}

export interface PromotionStatus {
    success: boolean;
    active: boolean;
    discountPercent?: number;
    slotsRemaining?: number;
    description?: string;
    reason?: string;
}

@Injectable({
    providedIn: 'root'
})
export class PromotionAdminService {
    private baseUrl = environment.BASE_PATH + '/promotions/';

    constructor(private http: HttpClient) { }

    // Get promo config (admin)
    getConfig(): Observable<{ success: boolean; config: PromotionConfig }> {
        return this.http.get<any>(this.baseUrl + 'config');
    }

    // Update promo config (admin)
    updateConfig(data: Partial<PromotionConfig>): Observable<{ success: boolean; config: PromotionConfig; message: string }> {
        return this.http.put<any>(this.baseUrl + 'config', data);
    }

    // Reset used count (admin)
    resetCount(): Observable<{ success: boolean; config: PromotionConfig; message: string }> {
        return this.http.put<any>(this.baseUrl + 'reset', {});
    }

    // Get public promo status (for subscription page)
    getStatus(): Observable<PromotionStatus> {
        return this.http.get<PromotionStatus>(this.baseUrl + 'status');
    }
}
