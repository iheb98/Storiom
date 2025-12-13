import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PublicService } from 'src/app/core/services/public.service';
import { LoadingService } from 'src/app/core/services/loading.service';
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

    // Pagination
    totalProducts = 0;
    pageSize = 12;
    pageIndex = 0;

    constructor(
        private route: ActivatedRoute,
        private publicService: PublicService,
        private loadingService: LoadingService,
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
                this.loadCategories(); // Ideally fetch categories specific to this store if API supports it, using generic tree for now or filtered
                this.loadProducts();
            }
        });
    }

    loadStoreDetails() {
        this.publicService.getStoreById(this.storeId).subscribe(res => {
            this.store = res;
        });
    }

    loadCategories() {
        this.publicService.getCategoryTree().subscribe(res => {
            this.categories = res;
        });
    }

    loadProducts() {
        this.loadingService.screenLoading();

        const query = `storeId = ${this.storeId}` +
            (this.selectedCategory ? `, categoryId = ${this.selectedCategory}` : '') +
            (this.minPrice ? `, sellingPrice > ${this.minPrice}` : '') +
            (this.maxPrice ? `, sellingPrice < ${this.maxPrice}` : '');

        this.publicService.getPublicProducts({
            page: this.pageIndex,
            size: this.pageSize,
            query: query,
            searchable: this.searchText,
            sort: this.sortBy
        }).subscribe(res => {
            this.products = res;
            this.loadingService.screenLoaded();
        }, err => {
            console.error(err);
            this.loadingService.screenLoaded();
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
        this.applyFilters();
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
