import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { AnalyticsService } from 'src/app/core/services/analytics.service';
import { ProductService } from 'src/app/core/services/product.service';
import { forkJoin } from 'rxjs';
import {
    faChartLine, faEye, faShoppingCart, faHeart, faSearch,
    faTrophy, faArrowUp, faArrowDown, faBox, faStar,
    faFire, faClock, faPercent, faSpinner, faExternalLinkAlt,
    faFilter, faSort, faTimes
} from '@fortawesome/free-solid-svg-icons';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

@Component({
    selector: 'app-product-analytics',
    templateUrl: './product-analytics.component.html',
    styleUrls: ['./product-analytics.component.scss']
})
export class ProductAnalyticsComponent implements OnInit {
    // Icons
    faChartLine = faChartLine;
    faEye = faEye;
    faShoppingCart = faShoppingCart;
    faHeart = faHeart;
    faSearch = faSearch;
    faTrophy = faTrophy;
    faArrowUp = faArrowUp;
    faArrowDown = faArrowDown;
    faBox = faBox;
    faStar = faStar;
    faFire = faFire;
    faClock = faClock;
    faPercent = faPercent;
    faSpinner = faSpinner;
    faExternalLinkAlt = faExternalLinkAlt;
    faFilter = faFilter;
    faSort = faSort;
    faTimes = faTimes;

    // State
    isLoading = true;
    storeId: number;
    backend_URL = environment.backend;

    // Analytics Data
    storeAnalytics: any = null;
    topProducts: any[] = [];
    allProductStats: any[] = [];

    // Summary Stats
    totalViews = 0;
    totalOrders = 0;
    totalCartAdds = 0;
    totalWishlists = 0;
    totalQuantitySold = 0;
    avgConversionRate = 0;

    // Filters
    searchTerm = '';
    sortBy = 'popularityScore';
    sortOrder: 'asc' | 'desc' = 'desc';

    // Pagination
    currentPage = 1;
    pageSize = 10;
    pageSizeOptions = [10, 25, 50, 100];

    get totalPages(): number {
        return Math.ceil(this.filteredProducts.length / this.pageSize);
    }

    get paginatedProducts(): any[] {
        const start = (this.currentPage - 1) * this.pageSize;
        return this.filteredProducts.slice(start, start + this.pageSize);
    }

    goToPage(page: number): void {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
        }
    }

    onPageSizeChange(): void {
        this.currentPage = 1; // Reset to first page when page size changes
    }

    // Reset page when filters change
    onFilterChange(): void {
        this.currentPage = 1;
    }

    // Computed property for filtered products
    get filteredProducts(): any[] {
        let result = [...this.allProductStats];

        // Apply search filter
        if (this.searchTerm.trim()) {
            const term = this.searchTerm.toLowerCase();
            result = result.filter(p =>
                p.name?.toLowerCase().includes(term) ||
                p.category?.name?.toLowerCase().includes(term)
            );
        }

        // Apply sorting
        result.sort((a, b) => {
            let valueA: number, valueB: number;

            switch (this.sortBy) {
                case 'name':
                    const nameA = a.name?.toLowerCase() || '';
                    const nameB = b.name?.toLowerCase() || '';
                    return this.sortOrder === 'asc'
                        ? nameA.localeCompare(nameB)
                        : nameB.localeCompare(nameA);
                case 'views':
                    valueA = a.stats?.viewCount || 0;
                    valueB = b.stats?.viewCount || 0;
                    break;
                case 'orders':
                    valueA = a.stats?.orderCount || 0;
                    valueB = b.stats?.orderCount || 0;
                    break;
                case 'cartAdds':
                    valueA = a.stats?.cartAddCount || 0;
                    valueB = b.stats?.cartAddCount || 0;
                    break;
                case 'wishlist':
                    valueA = a.stats?.wishlistCount || 0;
                    valueB = b.stats?.wishlistCount || 0;
                    break;
                case 'conversion':
                    valueA = this.getConversionRate(a.stats);
                    valueB = this.getConversionRate(b.stats);
                    break;
                case 'popularityScore':
                default:
                    valueA = a.stats?.popularityScore || 0;
                    valueB = b.stats?.popularityScore || 0;
                    break;
            }

            return this.sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
        });

        return result;
    }

    toggleSortOrder(): void {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    }

    constructor(
        private authService: AuthService,
        private analyticsService: AnalyticsService,
        private productService: ProductService,
        private router: Router
    ) { }

    ngOnInit(): void {
        window.scrollTo(0, 0);
        this.storeId = this.authService.getConnectedUser()?.store;
        if (this.storeId) {
            this.loadAnalytics();
        }
    }

    loadAnalytics(): void {
        this.isLoading = true;

        forkJoin({
            storeAnalytics: this.analyticsService.getStoreAnalytics(this.storeId),
            products: this.productService.getAllProductsByStoreId(this.storeId)
        }).subscribe(
            results => {
                this.storeAnalytics = results.storeAnalytics;
                this.topProducts = results.storeAnalytics?.topProducts || [];

                // Extract summary from aggregate data
                const summary = results.storeAnalytics?.summary || {};
                this.totalViews = parseInt(summary.totalViews) || 0;
                this.totalOrders = parseInt(summary.totalOrders) || 0;
                this.totalCartAdds = parseInt(summary.totalCartAdds) || 0;
                this.totalWishlists = parseInt(summary.totalWishlists) || 0;
                this.totalQuantitySold = parseInt(summary.totalQuantitySold) || 0;

                // Calculate conversion rate
                this.avgConversionRate = this.totalViews > 0
                    ? parseFloat(((this.totalOrders / this.totalViews) * 100).toFixed(2))
                    : 0;

                // Handle products response - could be array or object with rows/products property
                const productsData = Array.isArray(results.products)
                    ? results.products
                    : (results.products?.rows || results.products?.products || []);

                // Process all products with their stats
                this.allProductStats = productsData.map((product: any) => ({
                    ...product,
                    stats: product.stats || {
                        viewCount: 0,
                        orderCount: 0,
                        cartAddCount: 0,
                        wishlistCount: 0,
                        popularityScore: 0
                    }
                })).sort((a: any, b: any) =>
                    (b.stats?.popularityScore || 0) - (a.stats?.popularityScore || 0)
                );

                this.isLoading = false;
            },
            error => {
                console.error('Error loading analytics:', error);
                this.isLoading = false;
            }
        );
    }

    getProductImage(product: any): string {
        const idx = product?.mainImageIndex || 0;

        if (product?.thumbnails) {
            // Handle thumbnails as string (JSON) or array
            let thumbnails = product.thumbnails;
            if (typeof thumbnails === 'string') {
                try {
                    thumbnails = JSON.parse(thumbnails);
                } catch (e) {
                    return 'assets/default_product.png';
                }
            }
            if (Array.isArray(thumbnails) && thumbnails.length > 0) {
                const imageIdx = thumbnails.length > idx ? idx : 0;
                return this.backend_URL + '/' + thumbnails[imageIdx];
            }
        }
        return 'assets/default_product.png';
    }

    hasProductImage(product: any): boolean {
        if (!product?.thumbnails) return false;
        let thumbnails = product.thumbnails;
        if (typeof thumbnails === 'string') {
            try {
                thumbnails = JSON.parse(thumbnails);
            } catch (e) {
                return false;
            }
        }
        return Array.isArray(thumbnails) && thumbnails.length > 0;
    }

    getConversionRate(stats: any): number {
        if (!stats || stats.viewCount === 0) return 0;
        return parseFloat(((stats.orderCount / stats.viewCount) * 100).toFixed(1));
    }

    getPerformanceLevel(score: number): string {
        if (score >= 50) return 'excellent';
        if (score >= 20) return 'good';
        if (score >= 5) return 'average';
        return 'low';
    }

    formatNumber(num: number): string {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    }

    viewProduct(productId: number): void {
        this.router.navigate(['/admin/products/view', productId]);
    }

    refreshData(): void {
        this.loadAnalytics();
    }
}
