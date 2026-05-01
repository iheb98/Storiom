import { Component, OnInit, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { faChartBar } from '@fortawesome/free-regular-svg-icons';
import {
  faPowerOff, faHome, faStore, faUser, faCodeBranch, faHandHoldingUsd,
  faCoins, faShuttleVan, faBox, faReceipt, faImage, faFile, faWindowRestore, faInfoCircle, faShoppingCart, faCog, faTruck, faWrench, faClipboardList,
  faTruckLoading,
  faBookmark,
  faTags,
  faLayerGroup,
  faChartLine,
  faGlobe
} from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../../../core/services/auth.service';
import { StoreService } from '../../../../core/services/store.service';
import { UserSettingsService } from '../../../../core/services/user-settings.service';
import { environment } from 'src/environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { SubscriptionComponent } from '../../../../general/subscription/subscription.component';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent implements OnInit {
  backend_URL = environment.backend;

  // Icons
  storeIcon = faStore;
  homeIcon = faHome;
  powerIcon = faPowerOff;
  userIcon = faUser;
  categoryIcon = faCodeBranch;
  statsIcon = faChartBar;

  // State
  sidebarCollapsed = false;
  mobileMenuOpen = false;
  userMenuOpen = false;
  currentPageTitle = 'Tableau de bord';

  connectedUser: any;
  store: any;
  menu: Array<any> = [];

  subscriptionStatus: string | null = null;
  subscriptionDetails: any = null;
  subscriptionPlan: string = 'STOCK';
  imageLoaded = false;
  avatarLoaded = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    public storeService: StoreService,
    private dialog: MatDialog,
    private userSettingsService: UserSettingsService
  ) {
    this.authService.loggedIn.subscribe(() => {
      this.connectedUser = this.authService.getConnectedUser();
      this.loadSubscriptionFromBackend();

      this.storeService.getStore(this.authService.getConnectedUser()?.store).subscribe(
        store => {
          this.store = store;

        },
        _ => { }
      );
    });

    // Track route changes for page title
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updatePageTitle();
      this.closeMobileMenu();
      this.userMenuOpen = false;
    });
  }

  ngOnInit(): void {
    // Clear redirect flag when tab is closed so it redirects again next time
    window.addEventListener('beforeunload', () => {
      sessionStorage.removeItem('defaultScreenRedirected');
    });

    this.connectedUser = this.authService.getConnectedUser();
    this.setMenu();
    this.updatePageTitle();

    // Load subscription from backend
    this.loadSubscriptionFromBackend();

    this.loadStore();

    // Subscribe to store updates
    this.storeService.storeUpdated$.subscribe(() => {
      this.loadStore();
    });

    this.subscriptionDetails = this.authService.getConnectedUser()?.subscription;
    if (this.subscriptionDetails) {
      this.checkSubscriptionStatus(this.subscriptionDetails);
    }

    // Check screen size for initial sidebar state
    if (window.innerWidth <= 992) {
      this.sidebarCollapsed = true;
    }

    // Load user settings and apply theme
    this.userSettingsService.settings$.subscribe(settings => {
      this.userSettingsService.applyTheme(settings);
    });

    // Redirect to default screen on first load of session (after settings are loaded from API)
    this.userSettingsService.settingsLoaded$.subscribe(isLoaded => {
      if (isLoaded) {
        const hasRedirected = sessionStorage.getItem('defaultScreenRedirected');
        const settings = this.userSettingsService.currentSettings;
        const defaultScreen = settings.navigation?.defaultScreen;

        // Skip redirect if 'none' or no screen selected
        if (!hasRedirected && defaultScreen && defaultScreen !== 'none') {
          sessionStorage.setItem('defaultScreenRedirected', 'true');
          const screenMap = {
            'dashboard': '/admin/dashboard',
            'products': '/admin/products',
            'orders': '/admin/orders',
            'stats': '/admin/dashboard'
          };
          const targetPath = screenMap[defaultScreen] || '/admin/dashboard';
          this.router.navigate([targetPath]);
        }
      }
    });
  }

  loadStore() {
    this.storeService.getStore(this.authService.getConnectedUser()?.store).subscribe(
      store => {
        this.store = store;
      },
      _ => { }
    );
  }

  // ========================================
  // UI Toggle Methods
  // ========================================
  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    document.body.style.overflow = this.mobileMenuOpen ? 'hidden' : '';
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
    document.body.style.overflow = '';
  }

  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-profile') && !target.closest('.user-dropdown')) {
      this.userMenuOpen = false;
    }
  }

  // ========================================
  // Page Title
  // ========================================
  updatePageTitle() {
    const url = this.router.url;
    const menuItem = this.menu.find(item => url.includes(item.link));
    this.currentPageTitle = menuItem?.label || 'Tableau de bord';
  }

  // ========================================
  // Auth & Subscription
  // ========================================
  logout() {
    this.authService.logout().subscribe(_ => {
      this.connectedUser = null;
      this.subscriptionStatus = null;
      this.store = null;
      this.mobileMenuOpen = false;
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('accessToken');
      sessionStorage.removeItem('defaultScreenRedirected');
      this.router.navigate(['login']);
    });
  }

  checkSubscriptionStatus(subscription: any) {
    if (!subscription) {
      this.subscriptionStatus = null;
      return;
    }

    const { activationDate, expirationDate, duration } = subscription;
    let calculatedExpirationDate = expirationDate ? new Date(expirationDate) : new Date(activationDate);

    if (!expirationDate) {
      const durationMapping: { [key: string]: number } = {
        TRIAL: 30, '1M': 30, '3M': 90, '6M': 180, '12M': 365
      };
      calculatedExpirationDate.setDate(
        calculatedExpirationDate.getDate() + (durationMapping[duration] || 0)
      );
    }

    this.subscriptionStatus = new Date() > calculatedExpirationDate ? 'Expired' : 'Active';
    this.subscriptionDetails.expirationDate = calculatedExpirationDate.toISOString();
  }

  loadSubscriptionFromBackend() {
    const userId = this.authService.getConnectedUser()?.id;
    if (!userId) return;

    this.authService.getSubscriptionDetails(userId).subscribe(
      (response: any) => {
        if (response.success && response.subscription) {
          this.subscriptionDetails = response.subscription;
          this.subscriptionStatus = response.subscription.isExpired ? 'Expired' : 'Active';
          this.subscriptionPlan = response.subscription.plan || 'STOCK_WEBSITE';
          this.setMenu(); // Refresh menu based on plan

          // Show expired dialog if subscription expired
          if (response.subscription.isExpired) {
            this.dialog.open(SubscriptionComponent, { width: '400px' });
          }
        }
      },
      error => {
        console.error('Error loading subscription:', error);
        // Fallback to token-based subscription details
        this.subscriptionDetails = this.authService.getConnectedUser()?.subscription;
        if (this.subscriptionDetails) {
          this.checkSubscriptionStatus(this.subscriptionDetails);
        }
      }
    );
  }

  getSubscriptionTooltip(): string {
    if (!this.subscriptionDetails) return 'No subscription details available.';

    const { expirationDate } = this.subscriptionDetails;
    return `Expire le ${new Date(expirationDate).toLocaleDateString('fr-FR')}`;
  }

  // ========================================
  // Menu Setup
  // ========================================
  setMenu() {
    this.menu = [
      { label: 'Ma Boutique', icon: faInfoCircle, link: 'admin/stores/view' },
      { label: 'Domaine & Thème', icon: faGlobe, link: 'admin/domain-settings' },
      { label: 'Statistiques', icon: this.statsIcon, link: 'admin/dashboard' },
      { label: 'Rapport', icon: faFile, link: 'admin/reports/generate' },
      { label: 'Commandes', icon: faShoppingCart, link: 'admin/orders' },
      { label: 'Produits', icon: faBox, link: 'admin/products' },
      { label: 'Analytique', icon: faChartLine, link: 'admin/analytics' },
      { label: 'Catégories', icon: faLayerGroup, link: 'admin/categories' },
      { label: 'Marques', icon: faTags, link: 'admin/brands' },
      { label: 'Fournisseurs', icon: faTruckLoading, link: 'admin/suppliers' },
      { label: 'Livreurs', icon: faTruck, link: 'admin/delivery-workers' },
      { label: 'Services', icon: faWrench, link: 'admin/services' },
      { label: 'Demandes', icon: faClipboardList, link: 'admin/service-requests' },
      { label: 'Factures', icon: faReceipt, link: 'admin/receipts' },
      { label: 'Opérations', icon: faWindowRestore, link: 'admin/operations' },
      { label: 'Travailleurs', icon: this.userIcon, link: 'admin/workers' },
      { label: 'Dépenses', icon: faCoins, link: 'admin/expenses' },
      { label: 'Crédits', icon: faHandHoldingUsd, link: 'admin/credits' },
    ];
  }
}
