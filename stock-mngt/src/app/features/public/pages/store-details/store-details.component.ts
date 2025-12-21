import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PublicService } from 'src/app/core/services/public.service';

import { environment } from 'src/environments/environment';
import { ProductService } from 'src/app/core/services/product.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { CartService } from 'src/app/core/services/cart.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
    selector: 'app-store-details',
    templateUrl: './store-details.component.html',
    styleUrls: ['./store-details.component.scss']
})
export class StoreDetailsComponent implements OnInit {

    store: any;
    products: any[] = [];
    environment = environment;
    storeId: string;

    // Filters
    categories: any[] = [];
    selectedCategory: number = null;
    minPrice: number = null;
    maxPrice: number = null;
    searchText: string = '';
    sortBy: string = 'createdAtDesc';
    minRating: number = null;

    // Pagination
    totalProducts = 0;
    pageSize = 12;
    pageIndex = 0;

    // UI State
    mobileFiltersOpen = false;
    collapsedSections = {
        search: false,
        category: false,
        price: false,
        rating: false
    };
    isStoreLoading = true;
    isProductsLoading = true;

    constructor(
        private route: ActivatedRoute,
        private publicService: PublicService,

        private productService: ProductService,
        private authService: AuthService,
        private cartService: CartService,
        private toastService: ToastService
    ) { }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            this.storeId = params.get('id');
            if (this.storeId) {
                this.loadStoreDetails();
                this.loadCategories();
                this.loadProducts();
            }
        });
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
        this.publicService.getCategoryTree().subscribe(res => {
            this.categories = this.flattenCategories(res);
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
        const cat = this.categories.find(c => c.id === categoryId);
        return cat ? cat.name.trim() : '';
    }

    addToCart(product: any, event: Event) {
        event.stopPropagation();
        if (this.authService.isLoggedIn()) {
            this.productService.addToCart(product.id, 1).subscribe({
                next: () => this.toastService.showSuccess('Produit ajouté au panier'),
                error: () => this.toastService.showError('Erreur lors de l\'ajout au panier')
            });
        } else {
            this.cartService.addToCart(product, 1);
            this.toastService.showSuccess('Produit ajouté au panier (Local)');
        }
    }
}
