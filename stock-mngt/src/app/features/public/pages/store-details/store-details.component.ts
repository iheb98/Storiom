import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PublicService } from 'src/app/core/services/public.service';

import { environment } from 'src/environments/environment';
import { ProductService } from 'src/app/core/services/product.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { CartService } from 'src/app/core/services/cart.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { StoreServiceService } from 'src/app/core/services/store-service.service';
import { ServiceRequestService } from 'src/app/core/services/service-request.service';
import { AnalyticsService } from 'src/app/core/services/analytics.service';

@Component({
    selector: 'app-store-details',
    templateUrl: './store-details.component.html',
    styleUrls: ['./store-details.component.scss']
})
export class StoreDetailsComponent implements OnInit, AfterViewChecked {
    @ViewChild('descriptionEl') descriptionEl: ElementRef;

    store: any;
    products: any[] = [];
    services: any[] = [];
    environment = environment;
    storeId: string;

    // Active tab
    activeTab: 'products' | 'services' = 'products';

    // Filters
    categories: any[] = [];
    flatCategories: any[] = [];
    selectedCategory: number = null;
    minPrice: number = null;
    maxPrice: number = null;
    searchText: string = '';
    sortBy: string = null;
    minRating: number = null;

    // Category tree expansion
    expandedCategories: Set<number> = new Set();

    // Pagination
    totalProducts = 0;
    pageSize = 12;
    pageIndex = 0;

    // UI State
    mobileFiltersOpen = false;
    isDescriptionExpanded = false;
    collapsedSections = {
        search: false,
        category: false,
        price: false,
        rating: false
    };
    isStoreLoading = true;
    isProductsLoading = true;
    isServicesLoading = true;
    isDescriptionOverflowing = false;
    isRequesting = false;

    // Modal State
    showModal = false;
    modalMode: 'login' | 'request' | 'success' | 'error' = 'request';
    selectedService: any = null;
    customerNote = '';
    trackingCode = '';
    errorMessage = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private publicService: PublicService,
        private productService: ProductService,
        private authService: AuthService,
        private cartService: CartService,
        private toastService: ToastService,
        private storeServiceService: StoreServiceService,
        private serviceRequestService: ServiceRequestService,
        private analyticsService: AnalyticsService
    ) { }

    ngOnInit(): void {
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'auto' });
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
        }, 0);
        this.route.paramMap.subscribe(params => {
            this.storeId = params.get('id');
            if (this.storeId) {
                this.loadStoreDetails();
                this.loadCategories();
                this.loadProducts();
                this.loadServices();
            }
        });
    }

    ngAfterViewChecked(): void {
        this.checkDescriptionOverflow();
    }

    checkDescriptionOverflow() {
        if (this.descriptionEl?.nativeElement) {
            const el = this.descriptionEl.nativeElement;
            this.isDescriptionOverflowing = el.scrollHeight > el.clientHeight;
        }
    }

    loadStoreDetails() {
        this.isStoreLoading = true;
        this.publicService.getStoreById(this.storeId).subscribe(res => {
            this.store = res;
            this.isStoreLoading = false;
        }, error => {
            this.isStoreLoading = false;
        });
    }

    loadCategories() {
        this.publicService.getCategoryTree(this.storeId).subscribe(res => {
            this.categories = res;
            this.flatCategories = this.flattenCategories(res);
        });
    }

    flattenCategories(categories: any[], level = 0): any[] {
        let result = [];
        for (const cat of categories) {
            result.push({ ...cat, name: '  '.repeat(level) + cat.name });
            if (cat.children && cat.children.length > 0) {
                result = result.concat(this.flattenCategories(cat.children, level + 1));
            }
        }
        return result;
    }

    // Category Tree Methods
    toggleCategoryExpand(categoryId: number, event: Event) {
        event.stopPropagation();
        if (this.expandedCategories.has(categoryId)) {
            this.expandedCategories.delete(categoryId);
        } else {
            this.expandedCategories.add(categoryId);
        }
    }

    isCategoryExpanded(categoryId: number): boolean {
        return this.expandedCategories.has(categoryId);
    }

    selectCategory(categoryId: number) {
        this.selectedCategory = categoryId;
        this.applyFilters();
        this.closeMobileFilters();
    }

    hasSubCategories(category: any): boolean {
        return category.subCategories && category.subCategories.length > 0;
    }

    closeMobileFilters() {
        this.mobileFiltersOpen = false;
        document.body.style.overflow = '';
    }

    loadProducts() {
        this.isProductsLoading = true;

        // Build query matching public-products component format
        let query = `storeId = '${this.storeId}'`;
        if (this.selectedCategory) query += `,categoryId = ${this.selectedCategory}`;
        if (this.minPrice != null) query += `,sellingPrice > '${this.minPrice}'`;
        if (this.maxPrice != null) query += `,sellingPrice < '${this.maxPrice}'`;

        this.publicService.getPublicProducts({
            page: this.pageIndex,
            size: this.pageSize,
            query: query,
            searchable: this.searchText,
            sort: this.sortBy
        }).subscribe(res => {
            this.products = res;
            this.isProductsLoading = false;
        }, err => {
            console.error(err);
            this.isProductsLoading = false;
        });

        // Count for pagination
        this.publicService.countPublicProducts({
            query: query,
            searchable: this.searchText
        }).subscribe(res => {
            this.totalProducts = res.count;
        });
    }

    onPageChange(event: any) {
        this.pageIndex = event.pageIndex;
        this.pageSize = event.pageSize;
        this.loadProducts();
    }

    applyFilters() {
        this.pageIndex = 0;
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'auto' });
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
        }, 0);
        this.loadProducts();
    }

    resetFilters() {
        this.selectedCategory = null;
        this.minPrice = null;
        this.maxPrice = null;
        this.searchText = '';
        this.sortBy = 'createdAtDesc';
        this.minRating = null;
        this.applyFilters();
    }

    // UI Helpers
    toggleSection(section: string) {
        this.collapsedSections[section] = !this.collapsedSections[section];
    }

    toggleMobileFilters() {
        this.mobileFiltersOpen = !this.mobileFiltersOpen;
        // Prevent body scroll when modal is open
        document.body.style.overflow = this.mobileFiltersOpen ? 'hidden' : '';
    }

    hasActiveFilters(): boolean {
        return !!(this.searchText || this.selectedCategory || this.minPrice || this.maxPrice || this.minRating);
    }

    get activeFiltersCount(): number {
        let count = 0;
        if (this.searchText) count++;
        if (this.selectedCategory) count++;
        if (this.minPrice || this.maxPrice) count++;
        if (this.minRating) count++;
        return count;
    }

    getCategoryName(categoryId: number): string {
        const cat = this.flatCategories.find(c => c.id === categoryId);
        return cat ? cat.name.trim() : '';
    }

    addToCart(product: any, event: Event) {
        event.stopPropagation();

        // Track cart_add event
        this.trackEvent(product, 'cart_add');

        this.cartService.addToCart(product, 1);
        this.toastService.showSuccess('Produit ajouté au panier');
    }

    // Track analytics events
    private trackEvent(product: any, interactionType: 'click' | 'cart_add' | 'view') {
        if (product?.id) {
            const userId = this.authService.getConnectedUser()?.id;
            this.analyticsService.trackEvent({
                productId: product.id,
                interactionType,
                userId,
                storeId: parseInt(this.storeId),
                categoryId: product.categoryId || product.category?.id
            }).subscribe({
                error: (err) => console.log('Analytics tracking failed:', err)
            });
        }
    }

    // Services
    loadServices() {
        this.isServicesLoading = true;
        this.storeServiceService.getActiveByStoreId(parseInt(this.storeId)).subscribe(
            (services) => {
                this.services = services;
                this.isServicesLoading = false;
            },
            (error) => {
                console.error('Error loading services:', error);
                this.isServicesLoading = false;
            }
        );
    }

    setActiveTab(tab: 'products' | 'services') {
        this.activeTab = tab;
    }

    requestService(service: any) {
        this.selectedService = service;
        this.customerNote = '';
        this.trackingCode = '';
        this.errorMessage = '';

        if (!this.authService.isLoggedIn()) {
            this.modalMode = 'login';
            this.showModal = true;
            return;
        }

        this.modalMode = 'request';
        this.showModal = true;
    }

    closeModal() {
        this.showModal = false;
        this.selectedService = null;
        this.customerNote = '';
    }

    goToLogin() {
        this.closeModal();
        this.router.navigate(['/login']);
    }

    confirmRequest() {
        if (!this.selectedService) return;

        this.isRequesting = true;
        this.serviceRequestService.create({
            storeServiceId: this.selectedService.id,
            customerNote: this.customerNote
        }).subscribe(
            (response: any) => {
                this.isRequesting = false;
                this.trackingCode = response.trackingCode;
                this.modalMode = 'success';
            },
            (error) => {
                this.isRequesting = false;
                this.errorMessage = error.error?.message || 'Une erreur est survenue';
                this.modalMode = 'error';
            }
        );
    }

    getCategoryIcon(category: string): string {
        const icons: any = {
            'repair': 'fa-wrench',
            'internet': 'fa-wifi',
            'mobile': 'fa-mobile-alt',
            'computer': 'fa-laptop',
            'general': 'fa-cog'
        };
        return icons[category] || 'fa-cog';
    }

    getCategoryLabel(category: string): string {
        const labels: any = {
            'repair': 'Réparation',
            'internet': 'Internet',
            'mobile': 'Mobile',
            'computer': 'Informatique',
            'general': 'Général'
        };
        return labels[category] || 'Général';
    }
}
