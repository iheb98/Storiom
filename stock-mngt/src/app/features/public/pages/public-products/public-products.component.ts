import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from 'src/app/core/services/category.service';
import { ProductService } from 'src/app/core/services/product.service';
import { environment } from 'src/environments/environment.prod';
import { PublicService } from 'src/app/core/services/public.service';
import { LoadingService } from 'src/app/core/services/loading.service';
import { faCartPlus } from '@fortawesome/free-solid-svg-icons';
import { CartService } from 'src/app/core/services/cart.service';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-public-products',
  templateUrl: './public-products.component.html',
  styleUrls: ['./public-products.component.scss']
})
export class PublicProductsComponent implements OnInit {
  faCartPlus = faCartPlus
  environment = environment;
  products: any[] = [];
  categories: any[] = [];
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private publicService: PublicService,
    private categoryService: CategoryService,
    private cartService: CartService,
    private loadingService: LoadingService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadCategories();
    this.loadStores();

    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['searchable'] || '';
      this.filters.category = Number(params['category']) || '';
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
    });
  }

  loadStores() {
    this.publicService.getAllStores().subscribe(res => {
      this.stores = res;
    });
  }

  loadCategory(categoryId: string) {
    // this.categoryService.getCategoryById(categoryId).subscribe(res => {
    //   this.category = res;
    // });
  }

  buildQuery() {
    let query = '';
    //if (this.searchQuery) query += query ? `,name ~ '${this.searchQuery}'` : `name ~ '${this.searchQuery}'`;
    if (this.filters.category) query += query ? `,categoryId = ${this.filters.category}` : `categoryId = ${this.filters.category}`;
    if (this.filters.minPrice != null) query += query ? `,sellingPrice > '${this.filters.minPrice}'` : `sellingPrice > '${this.filters.minPrice}'`;
    if (this.filters.maxPrice != null) query += query ? `,sellingPrice < '${this.filters.maxPrice}'` : `sellingPrice < '${this.filters.maxPrice}'`;
    if (this.filters.store) query += query ? `,storeId = '${this.filters.store}'` : `storeId = '${this.filters.store}'`;
    return query;
  }

  loadProducts() {
    this.loadingService.screenLoading()
    const query = this.buildQuery();
    this.publicService.getPublicProducts({ page: this.currentPage, size: this.currentSize, query, sort: this.filters.sort, searchable: this.searchable }).subscribe(res => {
      this.products = res;
      this.loadingService.screenLoaded()
    }, (error) => {
      this.loadingService.screenLoaded()
    });

    this.publicService.countPublicProducts({ query, searchable: this.searchable }).subscribe(res => {
      this.count = res.count;
    });
  }


  applyFilters() {
    const queryParams: any = {
      searchable: this.searchable || null,
      category: this.filters.category || null,
      minPrice: this.filters.minPrice || null,
      maxPrice: this.filters.maxPrice || null,
      store: this.filters.store || null,
      sort: this.filters.sort || null
    };
    this.currentPage = 0

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

    const queryParams: any = {
      searchable: this.searchable || null,
      category: this.filters.category || null,
      minPrice: this.filters.minPrice || null,
      maxPrice: this.filters.maxPrice || null,
      store: this.filters.store || null,
      sort: this.filters.sort || null
    };
    this.currentPage = 0

    this.router.navigate([], { queryParams });
  }

  handlePageEvent(event: any) {
    this.currentPage = event.pageIndex;
    this.currentSize = event.pageSize;
    this.loadProducts();
  }

  addToCart(product: any) {
    if (this.authService.isLoggedIn()) {
      this.productService.addToCart(product.id, 1).subscribe(res => {
        // Optional: Show success message/toast
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