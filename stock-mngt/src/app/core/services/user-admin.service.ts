import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface AdminUser {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
    isConfirmed: boolean;
    createdAt: string;
    referredBy?: string;
    store?: {
        id: number;
        name: string;
        type: string;
        customDomain?: string;
    };
    subscription?: {
        duration: string;
        plan: string;
        activationDate: string;
        expirationDate: string;
    };
    address?: {
        country: string;
        city: string;
        state: string;
        street: string;
        postalCode: string;
    };
}

@Injectable({
    providedIn: 'root'
})
export class UserAdminService {
    private baseUrl = environment.BASE_PATH + '/users/';

    constructor(private http: HttpClient) { }

    // Get all users (admin)
    getAllUsers(search?: string, role?: string): Observable<{ success: boolean; users: AdminUser[] }> {
        let url = this.baseUrl + 'admin/all';
        const params: string[] = [];
        if (search) params.push(`search=${encodeURIComponent(search)}`);
        if (role) params.push(`role=${encodeURIComponent(role)}`);
        if (params.length) url += '?' + params.join('&');
        return this.http.get<any>(url);
    }

    // Toggle user account status (admin)
    toggleUserStatus(id: number): Observable<{ success: boolean; message: string; isConfirmed: boolean }> {
        return this.http.put<any>(this.baseUrl + 'admin/' + id + '/toggle-status', {});
    }

    // Delete user (admin)
    deleteUser(id: number): Observable<{ success: boolean; message: string }> {
        return this.http.delete<any>(this.baseUrl + 'admin/' + id);
    }

    // Extend subscription (uses existing endpoint)
    extendSubscription(userId: number, extensionDays: number): Observable<any> {
        return this.http.put<any>(this.baseUrl + 'extendSubscription/' + userId, { extensionDays });
    }
}
