import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { faChartBar } from '@fortawesome/free-regular-svg-icons';
import {
  faEdit, faFile, faTimes, faArrowDown, faArrowUp, faCoins, faExclamationTriangle,
  faImages, faSearchPlus, faImage, faArrowLeft, faCube, faTag, faAlignLeft,
  faCalendarAlt, faClock, faBox, faPercent, faEye, faShoppingCart, faHeart, faTrophy, faChartLine, faCheckCircle,
  faLock, faLockOpen
} from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/core/services/auth.service';
import { ProductService } from 'src/app/core/services/product.service';
import { StatService } from 'src/app/core/services/stat.service';
import { AnalyticsService } from 'src/app/core/services/analytics.service';
import { environment } from 'src/environments/environment';
import { UserSettingsService } from 'src/app/core/services/user-settings.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-product-view',
  templateUrl: './product-view.component.html',
  styleUrls: ['./product-view.component.scss']
})
export class ProductViewComponent implements OnInit {

  // Icons
  faEdit = faEdit;
  faArrowDown = faArrowDown;
  faArrowUp = faArrowUp;
  faCoins = faCoins;
  faExclamationTriangle = faExclamationTriangle;
  faImages = faImages;
  faSearchPlus = faSearchPlus;
  faImage = faImage;
  faArrowLeft = faArrowLeft;
  faCube = faCube;
  faTag = faTag;
  faAlignLeft = faAlignLeft;
  faCalendarAlt = faCalendarAlt;
  faClock = faClock;
  faTimes = faTimes;
  faBox = faBox;
  faPercent = faPercent;
  faEye = faEye;
  faShoppingCart = faShoppingCart;
  faHeart = faHeart;
  faTrophy = faTrophy;
  faChartLine = faChartLine;
  faCheckCircle = faCheckCircle;
  faLock = faLock;
  faLockOpen = faLockOpen;
  textIcon = faFile;
  chartIcon = faChartBar;

  environment = environment;

  // Loading States
  isLoading = true;
  isStatsLoading = false;

  // Data
  years: number[] = [];
  operationsData: any;
  soldOperationsData: any[] = [];
  loadedOperationsData: any[] = [];
  operationsLabels: any[] = [];
  operationsOptions: any;
  operations: any[] = [];

  // Filters
  typesOfDate = ["Quotidien", "Mensuel", "Annuel"];
  selectedDateType = 'Mensuel';
  dayFilter: string;
  weekFilter: string;
  monthFilter: string;
  yearFilter: number;

  // Product
  user: any;
  id: string;
  product: any;
  selectedImage: string | null = null;

  // Edit Lock
  lockPassword = '';

  // Marketplace Analytics
  isAnalyticsLoading = false;
  productStats: any = null;
  analyticsSourceFilter: 'all' | 'marketplace' | 'private_store' = 'all';

  // Stats by source
  combinedStats: any = { viewCount: 0, orderCount: 0, cartAddCount: 0, wishlistCount: 0, totalQuantitySold: 0, popularityScore: 0, conversionRate: 0 };
  marketplaceStats: any = { viewCount: 0, orderCount: 0, cartAddCount: 0, wishlistCount: 0, totalQuantitySold: 0, popularityScore: 0, conversionRate: 0 };
  privateStoreStats: any = { viewCount: 0, orderCount: 0, cartAddCount: 0, wishlistCount: 0, totalQuantitySold: 0, popularityScore: 0, conversionRate: 0 };

  get activeAnalytics(): any {
    switch (this.analyticsSourceFilter) {
      case 'marketplace': return this.marketplaceStats;
      case 'private_store': return this.privateStoreStats;
      default: return this.combinedStats;
    }
  }

  get viewCount(): number { return this.activeAnalytics.viewCount || 0; }
  get orderCount(): number { return this.activeAnalytics.orderCount || 0; }
  get cartAddCount(): number { return this.activeAnalytics.cartAddCount || 0; }
  get wishlistCount(): number { return this.activeAnalytics.wishlistCount || 0; }
  get quantitySold(): number { return this.activeAnalytics.totalQuantitySold || 0; }
  get popularityScore(): number { return this.activeAnalytics.popularityScore || 0; }
  get conversionRate(): number {
    return this.viewCount > 0
      ? parseFloat(((this.orderCount / this.viewCount) * 100).toFixed(2))
      : 0;
  }

  hoursLabels = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];

  constructor(
    private productService: ProductService,
    private statService: StatService,
    private analyticsService: AnalyticsService,
    private authService: AuthService,
    private userSettingsService: UserSettingsService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'auto' });
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    }, 0);
    this.user = this.authService.getConnectedUser();
    this.userSettingsService.settings$.subscribe(settings => {
      this.lockPassword = settings?.defaults?.lockPassword || '';
    });

    this.route.paramMap.subscribe(paramMap => {
      this.id = paramMap.get('id');
      this.initializeFilters();
      this.getProduct(this.id);
    });
  }

  initializeFilters() {
    // Build years array
    for (let i = 2000; i <= new Date().getFullYear(); i++) {
      this.years.push(i);
    }

    // Set default filters
    const now = new Date();
    const month = (now.getMonth() + 1) < 10 ? "0" + (now.getMonth() + 1) : (now.getMonth() + 1);
    const day = now.getDate() < 10 ? "0" + now.getDate() : now.getDate();

    this.dayFilter = `${now.getFullYear()}-${month}-${day}`;
    this.monthFilter = `${now.getFullYear()}-${month}`;
    this.yearFilter = now.getFullYear();

    // Initialize chart options
    this.initChartOptions();
  }

  initChartOptions() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color') || '#2c3e50';
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary') || '#7f8c8d';
    const surfaceBorder = 'lightgray';

    this.operationsOptions = {
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        },
        x: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        }
      }
    };
  }

  getProduct(id: string) {
    this.isLoading = true;
    this.productService.getProduct(id).subscribe(
      response => {
        this.product = response;
        this.isLoading = false;
        this.getOperationStats();
        this.loadProductAnalytics();
      },
      error => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Erreur lors du chargement du produit',
          showConfirmButton: false,
          timer: 2000
        });
      }
    );
  }

  navigateTo(link: string) {
    this.router.navigate([link]);
  }

  getMensuel() {
    let days = [];
    this.soldOperationsData = [];
    this.loadedOperationsData = [];
    for (let i = 0; i < this.lastDay(new Date(this.monthFilter).getFullYear(), new Date(this.monthFilter).getMonth()); i++) {
      this.soldOperationsData.push(0);
      this.loadedOperationsData.push(0);
      days.push(i + 1);
    }
    this.operationsLabels = days;
    if (this.operations) {
      for (let operation of this.operations) {
        if (operation.type == "SOLD") {
          this.soldOperationsData[new Date(operation.date).getDate() - 1] +=
            (operation?.price && operation?.amount) ? operation?.price * operation?.amount : 0;
        } else if (operation.type == "LOADED") {
          this.loadedOperationsData[new Date(operation.date).getDate() - 1] +=
            (operation?.price && operation?.amount) ? operation?.price * operation?.amount : 0;
        }
      }
    }
    this.updateChart();
  }

  getQuotidien() {
    this.soldOperationsData = [];
    this.loadedOperationsData = [];
    this.operationsLabels = this.hoursLabels;
    for (let i = 0; i < 24; i++) {
      this.soldOperationsData.push(0);
      this.loadedOperationsData.push(0);
    }
    if (this.operations) {
      for (let operation of this.operations) {
        if (operation.type == "SOLD") {
          this.soldOperationsData[new Date(operation.date).getHours()] +=
            (operation?.price && operation?.amount) ? operation?.price * operation?.amount : 0;
        } else if (operation.type == "LOADED") {
          this.loadedOperationsData[new Date(operation.date).getHours()] +=
            (operation?.price && operation?.amount) ? operation?.price * operation?.amount : 0;
        }
      }
    }
    this.updateChart();
  }

  getAnnuel() {
    let months = [];
    this.soldOperationsData = [];
    this.loadedOperationsData = [];
    for (let i = 1; i <= 12; i++) {
      this.soldOperationsData.push(0);
      this.loadedOperationsData.push(0);
      months.push(i);
    }
    this.operationsLabels = months;
    if (this.operations) {
      for (let operation of this.operations) {
        if (operation.type == "SOLD") {
          this.soldOperationsData[new Date(operation.date).getMonth()] +=
            (operation?.price && operation?.amount) ? operation?.price * operation?.amount : 0;
        } else if (operation.type == "LOADED") {
          this.loadedOperationsData[new Date(operation.date).getMonth()] +=
            (operation?.price && operation?.amount) ? operation?.price * operation?.amount : 0;
        }
      }
    }
    this.updateChart();
  }

  updateChart() {
    this.operationsData = {
      labels: this.operationsLabels,
      datasets: [
        {
          label: 'Vendu',
          data: this.soldOperationsData,
          backgroundColor: ['#42A5F5'],
          borderWidth: 1
        },
        {
          label: 'Chargé',
          data: this.loadedOperationsData,
          backgroundColor: ['#ff9f40'],
          borderWidth: 1
        }
      ]
    };
    this.isStatsLoading = false;
  }

  getOperationStats() {
    let filterValue: string;
    let month: number;
    let year: number;
    let day: number;

    switch (this.selectedDateType) {
      case 'Quotidien':
        day = new Date(this.dayFilter).getDate();
        month = new Date(this.dayFilter).getMonth() + 1;
        year = new Date(this.dayFilter).getFullYear();
        filterValue = year + '-' + (month < 10 ? '0' + month : month) + '-' + day;
        break;
      case 'Annuel':
        year = this.yearFilter;
        filterValue = String(year);
        break;
      default:
        month = new Date(this.monthFilter).getMonth() + 1;
        year = new Date(this.monthFilter).getFullYear();
        filterValue = year + '-' + month;
        break;
    }

    this.isStatsLoading = true;
    this.statService.getOperationStatsPerProduct(this.user?.store, this.selectedDateType, filterValue, this.id).subscribe(
      response => {
        this.operations = response;
        if (this.selectedDateType == "Quotidien") {
          this.getQuotidien();
        } else if (this.selectedDateType == "Annuel") {
          this.getAnnuel();
        } else {
          this.getMensuel();
        }
      },
      error => {
        this.isStatsLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Une erreur est survenue ! Merci de réessayer plus tard',
          showConfirmButton: false,
          timer: 1500
        });
      }
    );
  }

  lastDay(y: number, m: number): number {
    return new Date(y, m + 1, 0).getDate();
  }

  openImage(image: string) {
    this.selectedImage = image;
  }

  closeImage() {
    this.selectedImage = null;
  }

  getDiscountedPrice(): number {
    if (!this.product?.discount || this.product.discount <= 0) {
      return this.product?.sellingPrice || 0;
    }
    return this.product.sellingPrice * (1 - this.product.discount / 100);
  }

  loadProductAnalytics() {
    if (!this.id) return;

    this.isAnalyticsLoading = true;
    this.analyticsService.getProductStats(parseInt(this.id)).subscribe(
      (response: any) => {
        this.productStats = response;

        const mk = response?.marketplace || {};
        const ps = response?.privateStore || {};
        const cb = response?.combined || {};

        this.marketplaceStats = {
          viewCount: mk.viewCount || 0,
          orderCount: mk.orderCount || 0,
          cartAddCount: mk.cartAddCount || 0,
          wishlistCount: mk.wishlistCount || 0,
          totalQuantitySold: mk.totalQuantitySold || 0,
          popularityScore: parseFloat(mk.popularityScore) || 0,
          conversionRate: mk.conversionRate || 0
        };

        this.privateStoreStats = {
          viewCount: ps.viewCount || 0,
          orderCount: ps.orderCount || 0,
          cartAddCount: ps.cartAddCount || 0,
          wishlistCount: ps.wishlistCount || 0,
          totalQuantitySold: ps.totalQuantitySold || 0,
          popularityScore: parseFloat(ps.popularityScore) || 0,
          conversionRate: ps.conversionRate || 0
        };

        this.combinedStats = {
          viewCount: cb.viewCount || 0,
          orderCount: cb.orderCount || 0,
          cartAddCount: cb.cartAddCount || 0,
          wishlistCount: cb.wishlistCount || 0,
          totalQuantitySold: cb.totalQuantitySold || 0,
          popularityScore: Math.max(this.marketplaceStats.popularityScore, this.privateStoreStats.popularityScore),
          conversionRate: cb.conversionRate || 0
        };

        this.isAnalyticsLoading = false;
      },
      error => {
        console.error('Error loading product analytics:', error);
        this.isAnalyticsLoading = false;
      }
    );
  }

  getPerformanceLevel(score: number): string {
    if (score >= 50) return 'excellent';
    if (score >= 20) return 'good';
    if (score >= 5) return 'average';
    return 'low';
  }

  getConditionLabel(condition: string): string {
    switch (condition) {
      case 'NEW': return 'Neuf';
      case 'USED': return 'Occasion';
      case 'USED_GOOD_CONDITION': return 'Occasion en bon état';
      default: return 'Non spécifié';
    }
  }

  // ========================================
  // Edit Lock
  // ========================================
  toggleEditLock() {
    // If no password is configured, toggle directly
    if (!this.lockPassword) {
      this.productService.toggleProductLock(this.product.id).subscribe({
        next: (res) => {
          this.product.locked = res.locked;
        }
      });
      return;
    }

    // Prompt for password
    const isLocking = !this.product.locked;
    Swal.fire({
      title: isLocking ? 'Verrouiller la modification' : 'Déverrouiller la modification',
      input: 'password',
      inputPlaceholder: 'Entrez le mot de passe...',
      inputAttributes: {
        autocapitalize: 'off',
        autocorrect: 'off'
      },
      showCancelButton: true,
      confirmButtonText: isLocking ? 'Verrouiller' : 'Déverrouiller',
      cancelButtonText: 'Annuler',
      confirmButtonColor: isLocking ? '#c62828' : '#3f51b5',
      inputValidator: (value) => {
        if (!value) {
          return 'Veuillez entrer le mot de passe';
        }
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        if (result.value === this.lockPassword) {
          this.productService.toggleProductLock(this.product.id).subscribe({
            next: (res) => {
              this.product.locked = res.locked;
              Swal.fire({
                icon: 'success',
                title: res.locked ? 'Verrouillé !' : 'Déverrouillé !',
                text: res.locked ? 'Le bouton de modification est maintenant protégé.' : 'Le bouton de modification est maintenant accessible.',
                showConfirmButton: false,
                timer: 1500
              });
            }
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Mot de passe incorrect',
            text: 'Le mot de passe saisi est incorrect.',
            confirmButtonColor: '#c62828'
          });
        }
      }
    });
  }
}
