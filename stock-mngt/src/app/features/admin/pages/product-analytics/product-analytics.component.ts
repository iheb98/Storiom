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
    allProductStats: any[] = [];

    // Computed top products based on source filter
    get topProducts(): any[] {
        return [...this.allProductStats]
            .map(p => ({
                product: p,
                ...this.getProductStats(p)
            }))
            .sort((a, b) => (b.popularityScore || 0) - (a.popularityScore || 0))
            .slice(0, 5)
            .filter(p => (p.viewCount || 0) > 0 || (p.orderCount || 0) > 0);
    }

    // Source Filter
    sourceFilter: 'all' | 'marketplace' | 'private_store' = 'all';

    // Raw stats by source
    combinedStats: any = { totalViews: 0, totalOrders: 0, totalCartAdds: 0, totalWishlists: 0, totalQuantitySold: 0 };
    marketplaceStats: any = { totalViews: 0, totalOrders: 0, totalCartAdds: 0, totalWishlists: 0, totalQuantitySold: 0 };
    privateStoreStats: any = { totalViews: 0, totalOrders: 0, totalCartAdds: 0, totalWishlists: 0, totalQuantitySold: 0 };

    // Computed getters based on active source filter
    get activeStats(): any {
        switch (this.sourceFilter) {
            case 'marketplace': return this.marketplaceStats;
            case 'private_store': return this.privateStoreStats;
            default: return this.combinedStats;
        }
    }

    get totalViews(): number { return this.activeStats.totalViews || 0; }
    get totalOrders(): number { return this.activeStats.totalOrders || 0; }
    get totalCartAdds(): number { return this.activeStats.totalCartAdds || 0; }
    get totalWishlists(): number { return this.activeStats.totalWishlists || 0; }
    get totalQuantitySold(): number { return this.activeStats.totalQuantitySold || 0; }
    get avgConversionRate(): number {
        return this.totalViews > 0
            ? parseFloat(((this.totalOrders / this.totalViews) * 100).toFixed(2))
            : 0;
    }

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
            const statsA = this.getProductStats(a);
            const statsB = this.getProductStats(b);

            switch (this.sortBy) {
                case 'name':
                    const nameA = a.name?.toLowerCase() || '';
                    const nameB = b.name?.toLowerCase() || '';
                    return this.sortOrder === 'asc'
                        ? nameA.localeCompare(nameB)
                        : nameB.localeCompare(nameA);
                case 'views':
                    valueA = statsA?.viewCount || 0;
                    valueB = statsB?.viewCount || 0;
                    break;
                case 'orders':
                    valueA = statsA?.orderCount || 0;
                    valueB = statsB?.orderCount || 0;
                    break;
                case 'cartAdds':
                    valueA = statsA?.cartAddCount || 0;
                    valueB = statsB?.cartAddCount || 0;
                    break;
                case 'wishlist':
                    valueA = statsA?.wishlistCount || 0;
                    valueB = statsB?.wishlistCount || 0;
                    break;
                case 'conversion':
                    valueA = this.getConversionRate(statsA);
                    valueB = this.getConversionRate(statsB);
                    break;
                case 'popularityScore':
                default:
                    valueA = statsA?.popularityScore || 0;
                    valueB = statsB?.popularityScore || 0;
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
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'auto' });
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
        }, 0);
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

                // Extract summary from aggregate data
                const summary = results.storeAnalytics?.summary || {};
                this.combinedStats = {
                    totalViews: parseInt(summary.totalViews) || 0,
                    totalOrders: parseInt(summary.totalOrders) || 0,
                    totalCartAdds: parseInt(summary.totalCartAdds) || 0,
                    totalWishlists: parseInt(summary.totalWishlists) || 0,
                    totalQuantitySold: parseInt(summary.totalQuantitySold) || 0
                };

                // Source breakdown
                const mk = results.storeAnalytics?.marketplace || {};
                const ps = results.storeAnalytics?.privateStore || {};
                this.marketplaceStats = {
                    totalViews: parseInt(mk.totalViews) || 0,
                    totalOrders: parseInt(mk.totalOrders) || 0,
                    totalCartAdds: parseInt(mk.totalCartAdds) || 0,
                    totalWishlists: parseInt(mk.totalWishlists) || 0,
                    totalQuantitySold: parseInt(mk.totalQuantitySold) || 0
                };
                this.privateStoreStats = {
                    totalViews: parseInt(ps.totalViews) || 0,
                    totalOrders: parseInt(ps.totalOrders) || 0,
                    totalCartAdds: parseInt(ps.totalCartAdds) || 0,
                    totalWishlists: parseInt(ps.totalWishlists) || 0,
                    totalQuantitySold: parseInt(ps.totalQuantitySold) || 0
                };

                // Handle products response - could be array or object with rows/products property
                const productsData = Array.isArray(results.products)
                    ? results.products
                    : (results.products?.rows || results.products?.products || []);

                // Process all products — stats is now an array of {source, viewCount, ...}
                this.allProductStats = productsData.map((product: any) => ({
                    ...product,
                    statsArray: Array.isArray(product.stats) ? product.stats : (product.stats ? [product.stats] : [])
                }));

                this.isLoading = false;
            },
            error => {
                console.error('Error loading analytics:', error);
                this.isLoading = false;
            }
        );
    }

    /** Get aggregated stats for a product based on the current source filter */
    getProductStats(product: any): any {
        const empty = { viewCount: 0, orderCount: 0, cartAddCount: 0, wishlistCount: 0, popularityScore: 0 };
        const arr = product.statsArray || [];
        if (arr.length === 0) return empty;

        if (this.sourceFilter === 'marketplace') {
            return arr.find((s: any) => s.source === 'marketplace') || empty;
        }
        if (this.sourceFilter === 'private_store') {
            return arr.find((s: any) => s.source === 'private_store') || empty;
        }
        // 'all' — combine both sources
        return arr.reduce((acc: any, s: any) => ({
            viewCount: (acc.viewCount || 0) + (s.viewCount || 0),
            orderCount: (acc.orderCount || 0) + (s.orderCount || 0),
            cartAddCount: (acc.cartAddCount || 0) + (s.cartAddCount || 0),
            wishlistCount: (acc.wishlistCount || 0) + (s.wishlistCount || 0),
            popularityScore: Math.max(acc.popularityScore || 0, s.popularityScore || 0)
        }), { ...empty });
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
