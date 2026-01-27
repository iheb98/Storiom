import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { Router } from '@angular/router';
import {
  faEdit, faInfo, faBox, faShoppingCart, faFolder, faTruck,
  faCheckCircle, faTimesCircle, faEye, faEyeSlash, faPhoneAlt, faPhone,
  faEnvelope, faGlobe, faMapMarkerAlt, faRoad, faCity, faMap,
  faBolt, faPlus, faExternalLinkAlt, faStore, faChevronDown, faChevronUp,
  faDatabase, faCloud, faCrown
} from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/core/services/auth.service';

import { StoreService } from 'src/app/core/services/store.service';
import { ProductService } from 'src/app/core/services/product.service';
import { CategoryService } from 'src/app/core/services/category.service';
import { SupplierService } from 'src/app/core/services/supplier.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';
import { OrderService } from 'src/app/core/services/order.service';

@Component({
  selector: 'app-store-view',
  templateUrl: './store-view.component.html',
  styleUrls: ['./store-view.component.scss']
})
export class StoreViewComponent implements OnInit, AfterViewChecked {
  @ViewChild('descriptionEl') descriptionEl: ElementRef;
  store: any;
  storeWebsite: string;
  backend_URL = environment.backend;

  // Icons
  editIcon = faEdit;
  infoIcon = faInfo;
  boxIcon = faBox;
  cartIcon = faShoppingCart;
  folderIcon = faFolder;
  truckIcon = faTruck;
  checkIcon = faCheckCircle;
  timesIcon = faTimesCircle;
  eyeIcon = faEye;
  eyeSlashIcon = faEyeSlash;
  phoneHeaderIcon = faPhoneAlt;
  phoneIcon = faPhone;
  envelopeIcon = faEnvelope;
  globeIcon = faGlobe;
  mapMarkerIcon = faMapMarkerAlt;
  roadIcon = faRoad;
  cityIcon = faCity;
  mapIcon = faMap;
  boltIcon = faBolt;
  plusIcon = faPlus;
  externalLinkIcon = faExternalLinkAlt;
  storeIcon = faStore;
  chevronDownIcon = faChevronDown;
  chevronUpIcon = faChevronUp;
  databaseIcon = faDatabase;
  cloudIcon = faCloud;
  crownIcon = faCrown;

  selectedImage: string | null = null;

  // Stats
  productsCount = 0;
  ordersCount = 0;
  categoriesCount = 0;
  suppliersCount = 0;

  // Storage Tracking
  storageUsedBytes = 0;
  storageUsedMB = '0.00';
  storageLimitMB = 500;
  totalLimitMB = 500;
  purchasedStorageGB = '0.00';
  storagePercentage = 0;
  isPurchasing = false;
  purchasedStorageExpiresAt: Date | null = null;
  isStorageExpired = false;

  // Storage Purchases
  storagePurchases: any[] = [];
  isStorageDetailsExpanded = false;

  // Subscription Tracking
  subscription: any = null;
  subscriptionDaysLeft = 0;
  isSubscriptionActive = false;

  // Loading States
  isLoading = true;
  isDescriptionExpanded = false;
  isDescriptionOverflowing = false;

  constructor(
    private authService: AuthService,
    private storeService: StoreService,
    private productService: ProductService,
    private orderService: OrderService,
    private categoryService: CategoryService,
    private supplierService: SupplierService,
    private router: Router
  ) { }

  ngOnInit(): void {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'auto' });
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    }, 0);
    this.loadData();
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

  loadData() {
    this.isLoading = true;
    const storeId = this.authService.getConnectedUser()?.store;

    // Load all data in parallel using forkJoin
    forkJoin({
      store: this.storeService.getStore(storeId),
      products: this.productService.countProductsByStoreId(storeId, {}),
      orders: this.orderService.getStoreOrders(storeId),
      categories: this.categoryService.getCategoriesByStoreId(storeId),
      suppliers: this.supplierService.getAllSuppliersByStoreId(storeId),
      storage: this.storeService.getStorageUsage(storeId)
    }).subscribe(
      results => {
        // Store data
        this.store = results.store;
        this.storeWebsite = this.fillLink(this.store?.site);

        // Stats
        this.productsCount = typeof results.products === 'object' ? (results.products?.count || 0) : (results.products || 0);
        this.ordersCount = results.orders?.length || 0;
        this.categoriesCount = results.categories?.length || 0;
        this.suppliersCount = results.suppliers?.length || 0;

        // Storage
        this.storageUsedBytes = results.storage?.storageUsedBytes || 0;
        this.storageUsedMB = results.storage?.storageUsedMB || '0.00';
        this.storageLimitMB = parseFloat(results.storage?.storageLimitMB) || 500;
        this.totalLimitMB = parseFloat(results.storage?.totalLimitMB) || 500;
        this.purchasedStorageGB = results.storage?.purchasedStorageGB || '0.00';
        this.storagePercentage = parseFloat(results.storage?.percentageUsed) || 0;
        this.purchasedStorageExpiresAt = results.storage?.purchasedStorageExpiresAt ? new Date(results.storage.purchasedStorageExpiresAt) : null;
        this.isStorageExpired = results.storage?.isStorageExpired ?? true;

        // Load storage purchases (async, not blocking)
        this.loadStoragePurchases(storeId);

        // Load subscription data
        this.loadSubscription();

        this.isLoading = false;
      },
      error => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: error?.error?.message || 'Erreur lors du chargement du magasin',
          showConfirmButton: false,
          timer: 2000
        });
      }
    );
  }

  loadStoragePurchases(storeId: number) {
    this.storeService.getStoragePurchases(storeId).subscribe(
      res => {
        this.storagePurchases = res?.purchases || [];
      },
      error => {
        console.error('Error loading storage purchases:', error);
      }
    );
  }

  purchaseStorage() {
    // Redirect to subscription page with storage purchase intent
    this.router.navigate(['/admin/subscription'], { queryParams: { action: 'storage' } });
  }

  fillLink(link: string): string {
    if (link != null) {
      if (link.indexOf('http://') === -1 && link.indexOf('https://') === -1) {
        return 'http://' + link;
      }
      return link;
    }
    return null;
  }

  openImage(image: string) {
    this.selectedImage = image;
  }

  closeImage() {
    this.selectedImage = null;
  }

  // Format storage: show GB if >= 1024 MB, otherwise show MB
  formatStorage(mb: number | string): string {
    const mbValue = typeof mb === 'string' ? parseFloat(mb) : mb;
    if (isNaN(mbValue)) return '0 MB';
    if (mbValue >= 1024) {
      return (mbValue / 1024).toFixed(2) + ' GB';
    }
    return mbValue.toFixed(2) + ' MB';
  }

  // Get storage expiry days remaining
  getStorageExpiryDays(): number {
    if (!this.purchasedStorageExpiresAt) return 0;
    const now = new Date();
    const expiry = new Date(this.purchasedStorageExpiresAt);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }

  // Load subscription details
  loadSubscription() {
    const userId = this.authService.getConnectedUser()?.id;
    if (!userId) return;

    this.authService.getSubscriptionDetails(userId).subscribe(
      (response: any) => {
        if (response.success && response.subscription) {
          const sub = response.subscription;
          const now = new Date();
          const expDate = new Date(sub.expirationDate);

          // Calculate days remaining
          const msPerDay = 24 * 60 * 60 * 1000;
          this.subscriptionDaysLeft = Math.max(0, Math.ceil((expDate.getTime() - now.getTime()) / msPerDay));
          this.isSubscriptionActive = this.subscriptionDaysLeft > 0;
          this.subscription = sub;
        } else {
          this.subscriptionDaysLeft = 0;
          this.isSubscriptionActive = false;
        }
      },
      error => {
        console.error('Error loading subscription:', error);
        this.subscriptionDaysLeft = 0;
        this.isSubscriptionActive = false;
      }
    );
  }
}
