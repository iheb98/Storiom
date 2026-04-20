import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PublicService } from 'src/app/core/services/public.service';
import { CartService } from 'src/app/core/services/cart.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { ProductService } from 'src/app/core/services/product.service';
import { DomainService } from 'src/app/core/services/domain.service';
import { environment } from 'src/environments/environment.prod';
import {
  faCartPlus, faSearch, faTimes, faFilter, faThLarge, faList,
  faChevronDown, faChevronRight, faBars, faAngleDown
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-store-products',
  templateUrl: './store-products.component.html',
  styleUrls: ['./store-products.component.scss']
})
export class StoreProductsComponent implements OnInit {
  environment = environment;
  products: any[] = [];
  categoryTree: any[] = [];       // raw tree from API
  categories: any[] = [];          // flattened for toolbar select (kept as fallback)
  isLoading = true;
  storeId: string | null = null;
  basePath = '';
  searchQuery = '';
  selectedCategory: number | null = null;
  sortBy = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  selectedBrand: number | null = null;
  brands: any[] = [];
  count = 0;
  currentPage = 0;
  currentSize = 24;

  // Icons
  faCartPlus = faCartPlus;
  faSearch = faSearch;
  faTimes = faTimes;
  faFilter = faFilter;
  faThLarge = faThLarge;
  faList = faList;
  faChevronDown = faChevronDown;
  faChevronRight = faChevronRight;
  faBars = faBars;
  faAngleDown = faAngleDown;

  // UI
  viewMode: 'grid' | 'list' = 'grid';
  sidebarOpen = true;
  expandedCategories: { [id: number]: boolean } = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private publicService: PublicService,
    private cartService: CartService,
    private authService: AuthService,
    private productService: ProductService,
    private domainService: DomainService
  ) {}

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'auto' });

    // Get storeId from parent route or domain service
    this.storeId = this.route.parent?.snapshot.paramMap.get('storeId') || null;
    if (this.storeId) {
      this.basePath = `/preview-store/${this.storeId}`;
    } else if (this.domainService.isCustomDomain) {
      this.basePath = '/store-home';
      this.storeId = this.domainService.storeId?.toString() || null;
    }

    // Read query params
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['searchable'] || '';
      this.selectedCategory = params['category'] ? +params['category'] : null;
      this.sortBy = params['sort'] || '';
      this.minPrice = params['minPrice'] ? +params['minPrice'] : null;
      this.maxPrice = params['maxPrice'] ? +params['maxPrice'] : null;
      this.selectedBrand = params['brand'] ? +params['brand'] : null;
      this.loadProducts();
    });

    this.loadCategories();
    this.loadBrands();
  }

  loadCategories(): void {
    this.publicService.getCategoryTree(this.storeId).subscribe(res => {
      this.categoryTree = res;
      this.categories = this.flattenCategories(res);
    });
  }

  loadBrands(): void {
    if (!this.storeId) return;
    this.publicService.getStoreBrands(this.storeId).subscribe(res => {
      this.brands = res;
    });
  }

  flattenCategories(cats: any[], level = 0): any[] {
    let result: any[] = [];
    for (const cat of cats) {
      result.push({ ...cat, level, displayName: '\u00A0\u00A0'.repeat(level) + cat.name });
      if (cat.subCategories?.length > 0) {
        result = result.concat(this.flattenCategories(cat.subCategories, level + 1));
      }
    }
    return result;
  }

  toggleCategory(catId: number): void {
    this.expandedCategories[catId] = !this.expandedCategories[catId];
  }

  isCategoryExpanded(catId: number): boolean {
    return !!this.expandedCategories[catId];
  }

  selectCategory(catId: number | null): void {
    this.selectedCategory = catId;
    this.currentPage = 0;
    this.applyFilters();
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  getCategoryName(catId: number | null): string {
    if (!catId) return 'Toutes';
    const found = this.categories.find(c => c.id === catId);
    return found ? found.name : '';
  }

  getBrandName(brandId: number | null): string {
    if (!brandId) return '';
    const found = this.brands.find(b => b.id === brandId);
    return found ? found.name : '';
  }

  loadProducts(): void {
    this.isLoading = true;
    const query: any = {
      page: this.currentPage,
      size: this.currentSize,
      searchable: this.searchQuery
    };
    if (this.storeId) {
      query.query = `storeId = '${this.storeId}'`;
      query.storeContext = 'true';
    }
    if (this.selectedCategory) {
      query.query = query.query ? `${query.query},categoryId = ${this.selectedCategory}` : `categoryId = ${this.selectedCategory}`;
    }
    if (this.sortBy) query.sort = this.sortBy;
    if (this.minPrice) query.minPrice = this.minPrice;
    if (this.maxPrice) query.maxPrice = this.maxPrice;
    if (this.selectedBrand) query.brandId = this.selectedBrand;

    this.publicService.getPublicProducts(query).subscribe(
      res => { this.products = res; this.isLoading = false; },
      () => { this.isLoading = false; }
    );

    this.publicService.countPublicProducts(query).subscribe(
      res => { this.count = res.count; }
    );
  }

  applyFilters(): void {
    const queryParams: any = {};
    if (this.searchQuery.trim()) queryParams.searchable = this.searchQuery.trim();
    if (this.selectedCategory) queryParams.category = this.selectedCategory;
    if (this.sortBy) queryParams.sort = this.sortBy;
    if (this.minPrice) queryParams.minPrice = this.minPrice;
    if (this.maxPrice) queryParams.maxPrice = this.maxPrice;
    if (this.selectedBrand) queryParams.brand = this.selectedBrand;
    this.currentPage = 0;
    this.router.navigate([], { queryParams });
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = null;
    this.sortBy = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.selectedBrand = null;
    this.currentPage = 0;
    this.router.navigate([], { queryParams: {} });
  }

  getProductImage(product: any): string {
    let images = product?.images;
    if (!images) return 'assets/default_product.png';
    if (typeof images === 'string') {
      try { images = JSON.parse(images); } catch { return 'assets/default_product.png'; }
    }
    const idx = product?.mainImageIndex || 0;
    if (Array.isArray(images) && images.length > 0) {
      return this.environment.backend + '/' + images[images.length > idx ? idx : 0];
    }
    return 'assets/default_product.png';
  }

  getDiscountedPrice(product: any): number {
    if (!product?.discount || product.discount <= 0) return product?.sellingPrice || 0;
    return product.sellingPrice * (1 - product.discount / 100);
  }

  addToCart(product: any, event: Event): void {
    event.stopPropagation();
    this.cartService.addToCart(product);
  }

  viewProduct(product: any): void {
    this.router.navigate([this.basePath, 'product', product.id]);
  }

  handlePageEvent(event: any): void {
    this.currentPage = event.pageIndex;
    this.currentSize = event.pageSize;
    this.loadProducts();
  }
}
