import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, timer } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    BASE_PATH = environment.BASE_PATH;

    private unreadCountSubject = new BehaviorSubject<number>(0);
    unreadCount$ = this.unreadCountSubject.asObservable();

    constructor(private http: HttpClient) { }

    getNotifications(storeId: number, unreadOnly = false): Observable<any> {
        const params: any = {};
        if (unreadOnly) params.unreadOnly = 'true';
        return this.http.get(`${this.BASE_PATH}/notifications/store/${storeId}`, { params });
    }

    markAsRead(notificationId: number): Observable<any> {
        return this.http.put(`${this.BASE_PATH}/notifications/${notificationId}/read`, {});
    }

    markAllAsRead(storeId: number): Observable<any> {
        return this.http.put(`${this.BASE_PATH}/notifications/store/${storeId}/read-all`, {});
    }

    updateUnreadCount(count: number) {
        this.unreadCountSubject.next(count);
    }
}
