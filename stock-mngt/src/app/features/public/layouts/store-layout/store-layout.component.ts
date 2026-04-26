import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { DomainService } from 'src/app/core/services/domain.service';
import { PublicService } from 'src/app/core/services/public.service';
import { StoreAuthService } from 'src/app/core/services/store-auth.service';
import { environment } from 'src/environments/environment.prod';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-store-layout',
  templateUrl: './store-layout.component.html',
  styleUrls: ['./store-layout.component.scss']
})
export class StoreLayoutComponent implements OnInit, OnDestroy {
  store: any = {};
  themeConfig: any = {};
  environment = environment;
  currentYear = new Date().getFullYear();

  isPreviewMode = false;
  storeId: string | null = null;
  basePath = '';

  // Header state
  mobileMenuOpen = false;
  searchQuery = '';
  searchFocused = false;
  cartCount = 0;
  isScrolled = false;
  isCustomerLoggedIn = false;

  private scrollHandler: any;
  private cartCheckInterval: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private domainService: DomainService,
    private publicService: PublicService,
    private storeAuth: StoreAuthService,
    private titleService: Title
  ) {}

  private routeSub: any;

  ngOnInit(): void {
    // Detect preview mode vs custom domain mode
    this.storeId = this.route.snapshot.paramMap.get('storeId');
    this.isPreviewMode = !!this.storeId;

    if (this.isPreviewMode) {
      this.basePath = `/preview-store/${this.storeId}`;
      // Set title to a thin space so browser doesn't show the URL
      this.titleService.setTitle('\u200B');
      this.loadStore(this.storeId);
    } else if (this.domainService.isCustomDomain && this.domainService.currentStore) {
      this.basePath = '/store-home';
      const ds = this.domainService.currentStore;
      this.store = { id: ds.id, name: ds.name, logo: ds.logo };

      // Title/favicon already set by DomainService APP_INITIALIZER,
      // but apply theme immediately from cached data before the API call
      if (ds.theme) {
        const defaultTheme = {
          primaryColor: '#4f46e5', accentColor: '#f59e0b', fontFamily: 'Inter',
          footer: { text: '', bgColor: '#0f172a', textColor: '#94a3b8', showContact: true, showSocial: true, showQuickLinks: true, quickLinks: [] },
          header: { bgColor: '#ffffff', textColor: '#0f172a', sticky: true, showSearch: true, logoPosition: 'left' },
          productsPage: { gridColumns: 4, defaultSort: '', showFilters: true, productsPerPage: 24, headerGradient: true },
          cartPage: { checkoutText: 'Commander', showContinueShopping: true, showFreeShipping: true },
          productCard: { showCartButton: true, showDiscountBadge: true, imageRatio: 'square', borderRadius: 14, hoverEffect: 'lift' },
          social: { facebook: '', instagram: '', tiktok: '' },
          sections: { footer: true }
        };
        this.themeConfig = this.deepMerge(defaultTheme, ds.theme as any || {});
        this.applyTheme();
      }

      this.loadStore(ds.id.toString());
    }

    // Re-apply theme on every navigation (handles route reuse)
    this.routeSub = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => {
      if (this.themeConfig?.primaryColor) {
        this.applyTheme();
      }
    });

    // Track cart count from localStorage
    this.updateCartCount();
    this.cartCheckInterval = setInterval(() => { this.updateCartCount(); this.isCustomerLoggedIn = this.storeAuth.isLoggedIn(); }, 2000);
    this.isCustomerLoggedIn = this.storeAuth.isLoggedIn();

    // Scroll detection for sticky header
    this.scrollHandler = () => {
      this.isScrolled = window.scrollY > 10;
    };
    window.addEventListener('scroll', this.scrollHandler, { passive: true });
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.scrollHandler);
    if (this.cartCheckInterval) clearInterval(this.cartCheckInterval);
    if (this.routeSub) this.routeSub.unsubscribe();
    document.body.style.overflow = '';
  }

  updateCartCount(): void {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      this.cartCount = cart.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
    } catch { this.cartCount = 0; }
  }

  loadStore(storeId: string): void {
    this.publicService.getStoreById(storeId).subscribe((store: any) => {
      this.store = store;
      const defaultTheme = {
        primaryColor: '#4f46e5',
        accentColor: '#f59e0b',
        fontFamily: 'Inter',
        footer: { text: '', bgColor: '#0f172a', textColor: '#94a3b8', showContact: true, showSocial: true, showQuickLinks: true, quickLinks: [] },
        header: { bgColor: '#ffffff', textColor: '#0f172a', sticky: true, showSearch: true, logoPosition: 'left' },
        productsPage: { gridColumns: 4, defaultSort: '', showFilters: true, productsPerPage: 24, headerGradient: true },
        cartPage: { checkoutText: 'Commander', showContinueShopping: true, showFreeShipping: true },
        productCard: { showCartButton: true, showDiscountBadge: true, imageRatio: 'square', borderRadius: 14, hoverEffect: 'lift' },
        social: { facebook: '', instagram: '', tiktok: '' },
        sections: { footer: true }
      };
      this.themeConfig = this.deepMerge(defaultTheme, store.theme || {});
      this.applyTheme();
    });
  }

  applyTheme(): void {
    const root = document.documentElement;
    root.style.setProperty('--store-primary', this.themeConfig.primaryColor || '#4f46e5');
    root.style.setProperty('--store-accent', this.themeConfig.accentColor || '#f59e0b');
    root.style.setProperty('--store-font', this.themeConfig.fontFamily || 'Inter');

    // Set tab title
    const tabTitle = this.themeConfig.browserTab?.title || this.store?.name || 'Boutique';
    this.titleService.setTitle(tabTitle);

    // Set favicon
    const favicon = this.themeConfig.browserTab?.favicon;
    if (favicon) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = environment.backend + '/' + favicon;
    }
  }

  deepMerge(target: any, source: any): any {
    const output = { ...target };
    for (const key of Object.keys(source)) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        output[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        output[key] = source[key];
      }
    }
    return output;
  }

  hasSocial(): boolean {
    return !!(this.themeConfig.social?.facebook || this.themeConfig.social?.instagram || this.themeConfig.social?.tiktok);
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate([this.basePath, 'products'], {
        queryParams: { searchable: this.searchQuery.trim() }
      });
    }
    this.mobileMenuOpen = false;
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    document.body.style.overflow = this.mobileMenuOpen ? 'hidden' : '';
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
    document.body.style.overflow = '';
  }

  logoutCustomer(): void {
    this.storeAuth.logout();
    this.isCustomerLoggedIn = false;
    this.router.navigate([this.basePath]);
  }
}
