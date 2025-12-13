import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { faSearch, faShoppingCart, faUser, faStore, faBoxOpen, faShieldAlt, faTruck, faGem } from '@fortawesome/free-solid-svg-icons';
import { CategoryService } from 'src/app/core/services/category.service';
import { ProductService } from 'src/app/core/services/product.service';
import { PublicService } from 'src/app/core/services/public.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  environment = environment;
  categories: any[] = [];
  isLoading = true;
  featuredProducts: any[] = [];
  featuredStores: any[] = [];

  // Stats
  storesCount = 0;
  productsCount = 0;
  categoriesCount = 0;

  // Icons
  searchIcon = faSearch;
  cartIcon = faShoppingCart;
  userIcon = faUser;
  storeIcon = faStore;
  boxOpenIcon = faBoxOpen;
  shieldIcon = faShieldAlt;
  truckIcon = faTruck;
  gemIcon = faGem;

  constructor(
    private categoryService: CategoryService,
    private productService: ProductService,
    private publicService: PublicService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadCategories();
    this.loadFeaturedProducts();
    this.loadFeaturedStores();
    this.loadStats();
  }

  loadCategories() {
    this.isLoading = true;
    this.publicService.getCategoryTree().subscribe(
      response => {
        this.categories = response.slice(0, 8); // Show max 8 categories
        this.categoriesCount = response.length;
        this.isLoading = false;
      },
      error => {
        console.error('Error fetching categories:', error);
        this.isLoading = false;
      }
    );
  }

  loadFeaturedProducts() {
    this.publicService.getRandomProducts().subscribe(
      response => {
        this.featuredProducts = response.slice(0, 8); // Show max 8 products
      }
    );
  }

  loadFeaturedStores() {
    this.publicService.getAllStores().subscribe(
      response => {
        this.featuredStores = response.slice(0, 6); // Show max 6 stores
        this.storesCount = response.length;
      }
    );
  }

  loadStats() {
    this.publicService.countPublicProducts({}).subscribe(
      response => {
        this.productsCount = response.count || 0;
      }
    );
  }

  scrollToCategories() {
    const element = document.getElementById('categories');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  navigateToCategory(categoryId: number) {
    this.router.navigate(['/publicProducts'], { queryParams: { category: categoryId } });
  }

  navigateToStore(storeId: number) {
    this.router.navigate(['/store', storeId]);
  }
}