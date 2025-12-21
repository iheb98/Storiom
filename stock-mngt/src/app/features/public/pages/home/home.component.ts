import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  faSearch, faShoppingCart, faUser, faStore, faBoxOpen, faShieldAlt, faTruck, faGem,
  faShoppingBag, faChevronDown, faTag, faArrowRight, faTimesCircle, faCartPlus, faCreditCard, faBox
} from '@fortawesome/free-solid-svg-icons';
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
  featuredProducts: any[] = [];
  featuredStores: any[] = [];

  // Stats
  storesCount = 0;
  productsCount = 0;
  categoriesCount = 0;

  // Loading States
  isCategoriesLoading = true;
  isProductsLoading = true;
  isStoresLoading = true;
  isStatsLoading = true;

  // Icons
  searchIcon = faSearch;
  cartIcon = faShoppingCart;
  userIcon = faUser;
  storeIcon = faStore;
  boxOpenIcon = faBoxOpen;
  shieldIcon = faShieldAlt;
  truckIcon = faTruck;
  gemIcon = faGem;
  shoppingBagIcon = faShoppingBag;
  chevronDownIcon = faChevronDown;
  tagIcon = faTag;
  arrowRightIcon = faArrowRight;
  timesCircleIcon = faTimesCircle;
  cartPlusIcon = faCartPlus;
  creditCardIcon = faCreditCard;
  boxIcon = faBox;

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
    this.isCategoriesLoading = true;
    this.publicService.getCategoryTree().subscribe(
      response => {
        this.categories = response.slice(0, 8);
        this.categoriesCount = response.length;
        this.isCategoriesLoading = false;
      },
      error => {
        console.error('Error fetching categories:', error);
        this.isCategoriesLoading = false;
      }
    );
  }

  loadFeaturedProducts() {
    this.isProductsLoading = true;
    this.publicService.getRandomProducts().subscribe(
      response => {
        this.featuredProducts = response.slice(0, 8);
        this.isProductsLoading = false;
      },
      error => {
        this.isProductsLoading = false;
      }
    );
  }

  loadFeaturedStores() {
    this.isStoresLoading = true;
    this.publicService.getAllStores().subscribe(
      response => {
        this.featuredStores = response.slice(0, 6);
        this.storesCount = response.length;
        this.isStoresLoading = false;
      },
      error => {
        this.isStoresLoading = false;
      }
    );
  }

  loadStats() {
    this.isStatsLoading = true;
    this.publicService.countPublicProducts({}).subscribe(
      response => {
        this.productsCount = response.count || 0;
        this.isStatsLoading = false;
      },
      error => {
        this.isStatsLoading = false;
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