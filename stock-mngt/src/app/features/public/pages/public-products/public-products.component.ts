import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from 'src/app/core/services/category.service';
import { ProductService } from 'src/app/core/services/product.service';
import { environment } from 'src/environments/environment.prod';
import { PublicService } from 'src/app/core/services/public.service';

import { faCartPlus } from '@fortawesome/free-solid-svg-icons';
import { CartService } from 'src/app/core/services/cart.service';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-public-products',
  templateUrl: './public-products.component.html',
  styleUrls: ['./public-products.component.scss']
})
export class PublicProductsComponent implements OnInit {
  faCartPlus = faCartPlus;
  environment = environment;
  products: any[] = [];
  categories: any[] = [];
  flatCategories: any[] = [];
  stores: any[] = [];
  category: any = null;
  searchQuery: string = '';
  isLoading = true;
  searchable = '';
  count = 0;

  currentPage = 0;
  currentSize = 24;

  filters = {
    category: null,
    minPrice: null as number | null,
    maxPrice: null as number | null,
    store: null,
    sort: null
  };

  // UI State
  mobileFiltersOpen = false;
  collapsedSections = {
    search: false,
    category: false,
    price: false,
    store: false
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private publicService: PublicService,
    private categoryService: CategoryService,
    private cartService: CartService,

    private authService: AuthService
  ) { }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.loadCategories();
    this.loadStores();

    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['searchable'] || '';
      this.filters.category = Number(params['category']) || null;
      this.filters.minPrice = params['minPrice'] ? +params['minPrice'] : null;
      this.filters.maxPrice = params['maxPrice'] ? +params['maxPrice'] : null;
      this.filters.store = params['store'] || null;
      this.filters.sort = params['sort'] || null;
      this.searchable = params['searchable'] || '';

      if (this.filters.category) {
        this.loadCategory(this.filters.category);
      }

      this.loadProducts();
    });
  }

  loadCategories() {
    this.publicService.getCategoryTree().subscribe(res => {
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

  loadStores() {
    this.publicService.getAllStores().subscribe(res => {
      this.stores = res;
    });
  }

  loadCategory(categoryId: any) {
    // Optional: load category details
  }

  buildQuery() {
    let query = '';
    if (this.filters.category) query += query ? `,categoryId = ${this.filters.category}` : `categoryId = ${this.filters.category}`;
    if (this.filters.minPrice != null) query += query ? `,sellingPrice > '${this.filters.minPrice}'` : `sellingPrice > '${this.filters.minPrice}'`;
    if (this.filters.maxPrice != null) query += query ? `,sellingPrice < '${this.filters.maxPrice}'` : `sellingPrice < '${this.filters.maxPrice}'`;
    if (this.filters.store) query += query ? `,storeId = '${this.filters.store}'` : `storeId = '${this.filters.store}'`;
    return query;
  }

  loadProducts() {
    this.isLoading = true;
    const query = this.buildQuery();
    this.publicService.getPublicProducts({ page: this.currentPage, size: this.currentSize, query, sort: this.filters.sort, searchable: this.searchable }).subscribe(res => {
      this.products = res;
      this.isLoading = false;
    }, (error) => {
      this.isLoading = false;
    });

    this.publicService.countPublicProducts({ query, searchable: this.searchable }).subscribe(res => {
      this.count = res.count;
    });
  }

  applyFilters() {
    const queryParams: any = {};

    // Only add params if they have values
    if (this.searchable && this.searchable.trim()) {
      queryParams.searchable = this.searchable.trim();
    }
    if (this.filters.category) {
      queryParams.category = this.filters.category;
    }
    if (this.filters.minPrice != null) {
      queryParams.minPrice = this.filters.minPrice;
    }
    if (this.filters.maxPrice != null) {
      queryParams.maxPrice = this.filters.maxPrice;
    }
    if (this.filters.store) {
      queryParams.store = this.filters.store;
    }
    if (this.filters.sort) {
      queryParams.sort = this.filters.sort;
    }

    this.currentPage = 0;
    this.router.navigate([], { queryParams });
  }

  resetFilters() {
    this.filters = {
      category: null,
      minPrice: null,
      maxPrice: null,
      store: null,
      sort: null
    };
    this.searchable = '';
    this.currentPage = 0;
    this.router.navigate([], { queryParams: {} });
  }

  handlePageEvent(event: any) {
    this.currentPage = event.pageIndex;
    this.currentSize = event.pageSize;
    this.loadProducts();
  }

  // UI Helpers
  toggleSection(section: string) {
    this.collapsedSections[section] = !this.collapsedSections[section];
  }

  toggleMobileFilters() {
    this.mobileFiltersOpen = !this.mobileFiltersOpen;
    document.body.style.overflow = this.mobileFiltersOpen ? 'hidden' : '';
  }

  hasActiveFilters(): boolean {
    return !!(this.searchable || this.filters.category || this.filters.minPrice || this.filters.maxPrice || this.filters.store);
  }

  get activeFiltersCount(): number {
    let count = 0;
    if (this.searchable) count++;
    if (this.filters.category) count++;
    if (this.filters.minPrice || this.filters.maxPrice) count++;
    if (this.filters.store) count++;
    return count;
  }

  getCategoryName(categoryId: number): string {
    const cat = this.flatCategories.find(c => c.id === categoryId);
    return cat ? cat.name.trim() : '';
  }

  getStoreName(storeId: any): string {
    const store = this.stores.find(s => s.id === storeId);
    return store ? store.name : '';
  }

  addToCart(product: any) {
    if (this.authService.isLoggedIn()) {
      this.productService.addToCart(product.id, 1).subscribe(res => {
        console.log('Added to cart (server)');
      });
    } else {
      this.cartService.addToCart(product);
    }
  }

  viewProduct(product: any) {
    this.router.navigate(['/publicProduct', product.id]);
  }
}