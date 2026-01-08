import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class WishlistService {
    private baseUrl = environment.BASE_PATH + '/wishlist';

    // Track wishlist product IDs for quick lookup
    private wishlistIdsSubject = new BehaviorSubject<Set<number>>(new Set());
    public wishlistIds$ = this.wishlistIdsSubject.asObservable();

    constructor(private http: HttpClient) { }

    /**
     * Add product to wishlist
     */
    addToWishlist(productId: number): Observable<any> {
        return this.http.post(`${this.baseUrl}/add`, { productId }).pipe(
            tap(() => {
                const currentIds = this.wishlistIdsSubject.value;
                currentIds.add(productId);
                this.wishlistIdsSubject.next(new Set(currentIds));
            })
        );
    }

    /**
     * Remove product from wishlist
     */
    removeFromWishlist(productId: number): Observable<any> {
        return this.http.delete(`${this.baseUrl}/${productId}`).pipe(
            tap(() => {
                const currentIds = this.wishlistIdsSubject.value;
                currentIds.delete(productId);
                this.wishlistIdsSubject.next(new Set(currentIds));
            })
        );
    }

    /**
     * Get user's full wishlist with product details
     */
    getWishlist(): Observable<any[]> {
        return this.http.get<any[]>(this.baseUrl);
    }

    /**
     * Check if a single product is in wishlist
     */
    checkInWishlist(productId: number): Observable<{ inWishlist: boolean }> {
        return this.http.get<{ inWishlist: boolean }>(`${this.baseUrl}/check/${productId}`);
    }

    /**
     * Check multiple products at once (efficient for product lists)
     */
    checkBatchWishlist(productIds: number[]): Observable<{ wishlistProductIds: number[] }> {
        return this.http.post<{ wishlistProductIds: number[] }>(`${this.baseUrl}/check-batch`, { productIds }).pipe(
            tap(response => {
                this.wishlistIdsSubject.next(new Set(response.wishlistProductIds));
            })
        );
    }

    /**
     * Get wishlist count
     */
    getWishlistCount(): Observable<{ count: number }> {
        return this.http.get<{ count: number }>(`${this.baseUrl}/count`);
    }

    /**
     * Check if product is in local wishlist cache
     */
    isInWishlist(productId: number): boolean {
        return this.wishlistIdsSubject.value.has(productId);
    }

    /**
     * Toggle wishlist status
     */
    toggleWishlist(productId: number): Observable<any> {
        if (this.isInWishlist(productId)) {
            return this.removeFromWishlist(productId);
        } else {
            return this.addToWishlist(productId);
        }
    }

    /**
     * Clear local cache (on logout)
     */
    clearCache(): void {
        this.wishlistIdsSubject.next(new Set());
    }
}
