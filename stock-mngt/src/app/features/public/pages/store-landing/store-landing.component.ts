import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DomainService, DomainStore } from 'src/app/core/services/domain.service';
import { PublicService } from 'src/app/core/services/public.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { CartService } from 'src/app/core/services/cart.service';
import { ProductService } from 'src/app/core/services/product.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-store-landing',
  templateUrl: './store-landing.component.html',
  styleUrls: ['./store-landing.component.scss']
})
export class StoreLandingComponent implements OnInit, OnDestroy {
  store: DomainStore;
  featuredProducts: any[] = [];
  categories: any[] = [];
  isLoading = true;
  isPreviewMode = false;
  environment = environment;
  currentYear = new Date().getFullYear();
  basePath = '';
  private currentStoreId: number | string = null;

  // Hero carousel
  currentHeroSlide = 0;
  heroSlideCount = 0;
  private heroInterval: any;

  // Extended theme config with defaults
  themeConfig: any = {
    primaryColor: '#4f46e5',
    accentColor: '#f59e0b',
    mode: 'light',
    fontFamily: 'Inter',
    hero: {
      style: 'fullImage',
      title: '',
      subtitle: '',
      ctaText: 'Découvrir nos produits',
      backgroundImage: '',
      images: [],
      overlayOpacity: 0.5,
      autoScrollSpeed: 5,
      gradientColor1: '',
      gradientColor2: ''
    },
    announcement: { enabled: false, text: '', bgColor: '#4f46e5', link: '' },
    usps: {
      enabled: true,
      items: [
        { icon: 'truck', title: 'Livraison rapide', subtitle: 'En 24-48h' },
        { icon: 'shield', title: 'Paiement sécurisé', subtitle: '100% sécurisé' },
        { icon: 'refresh', title: 'Retours faciles', subtitle: 'Sous 14 jours' },
        { icon: 'headset', title: 'Support client', subtitle: 'À votre écoute' }
      ]
    },
    about: { enabled: false, title: 'Notre histoire', content: '', image: '' },
    social: { facebook: '', instagram: '', tiktok: '' },
    footer: {
      text: '',
      bgColor: '#0f172a',
      textColor: '#94a3b8',
      showContact: true,
      showSocial: true,
      showQuickLinks: true,
      quickLinks: []
    },
    sections: { hero: true, products: true, categories: true, usps: true, about: false, info: true }
  };

  // FA4 icon mapping for USPs
  iconMap: any = {
    truck: 'fa-truck',
    shield: 'fa-shield',
    refresh: 'fa-refresh',
    headset: 'fa-headphones',
    star: 'fa-star',
    heart: 'fa-heart',
    gift: 'fa-gift',
    bolt: 'fa-bolt',
    leaf: 'fa-leaf',
    gem: 'fa-diamond',
    check: 'fa-check'
  };

  constructor(
    private domainService: DomainService,
    private publicService: PublicService,
    private authService: AuthService,
    private cartService: CartService,
    private productService: ProductService,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const storeId = this.route.snapshot.paramMap.get('storeId')
      || this.route.parent?.snapshot.paramMap.get('storeId');

    if (storeId) {
      this.isPreviewMode = true;
      this.basePath = `/preview-store/${storeId}`;
      this.currentStoreId = storeId;
      this.loadStorePreview(+storeId);
    } else if (this.domainService.currentStore) {
      this.basePath = '/store-home';
      this.currentStoreId = this.domainService.storeId;
      this.store = this.domainService.currentStore;
      this.applyTheme(this.store.theme);
      this.loadFeaturedProducts();
      this.loadCategories();
    }
  }

  ngOnDestroy(): void {
    this.stopHeroCarousel();
    if (this.isPreviewMode) {
      const root = document.documentElement;
      root.style.removeProperty('--store-primary');
      root.style.removeProperty('--store-accent');
      root.style.removeProperty('--store-font');
    }
  }

  applyTheme(theme: any): void {
    if (theme) {
      this.themeConfig = this.deepMerge(this.themeConfig, theme);
    }
    // Apply CSS variables
    const root = document.documentElement;
    root.style.setProperty('--store-primary', this.themeConfig.primaryColor || '#4f46e5');
    root.style.setProperty('--store-accent', this.themeConfig.accentColor || '#f59e0b');
    root.style.setProperty('--store-font', this.themeConfig.fontFamily || 'Inter');

    // Start hero carousel if multiple images
    this.initHeroCarousel();
  }

  deepMerge(target: any, source: any): any {
    const result = { ...target };
    for (const key of Object.keys(source)) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    return result;
  }

  loadStorePreview(storeId: number): void {
    this.isLoading = true;
    this.publicService.getStoreById(storeId).subscribe(
      storeData => {
        this.store = {
          id: storeData.id,
          name: storeData.name,
          description: storeData.description,
          logo: storeData.logo,
          images: storeData.images ? (typeof storeData.images === 'string' ? JSON.parse(storeData.images) : storeData.images) : [],
          phone: storeData.phone,
          email: storeData.email,
          site: storeData.site,
          theme: storeData.theme,
          address: storeData.address,
          isSupportingDeliveries: storeData.isSupportingDeliveries
        };
        this.applyTheme(this.store.theme);
        this.loadFeaturedProducts();
        this.loadCategories();
      },
      () => {
        this.isLoading = false;
        this.toastService.showError('Magasin introuvable');
      }
    );
  }

  getUspIcon(iconKey: string): string {
    return this.iconMap[iconKey] || 'fa-star';
  }

  getHeroBackground(): any {
    const hero = this.themeConfig.hero;
    if (hero.style === 'gradient') {
      const c1 = hero.gradientColor1 || this.themeConfig.primaryColor;
      const c2 = hero.gradientColor2 || this.themeConfig.accentColor;
      return { background: `linear-gradient(135deg, ${c1}, ${c2})` };
    }
    if (hero.backgroundImage) {
      return { 'background-image': `url(${this.environment.backend}/${hero.backgroundImage})` };
    }
    // Default dark bg
    return { background: 'linear-gradient(135deg, #1e293b, #0f172a)' };
  }

  getHeroImages(): string[] {
    const images = this.themeConfig.hero?.images || [];
    return images.length > 0 ? images : (this.themeConfig.hero?.backgroundImage ? [this.themeConfig.hero.backgroundImage] : []);
  }

  hasHeroCarousel(): boolean {
    return this.getHeroImages().length > 1;
  }

  initHeroCarousel(): void {
    this.stopHeroCarousel();
    const images = this.getHeroImages();
    this.heroSlideCount = images.length;
    this.currentHeroSlide = 0;
    if (images.length > 1) {
      const speed = (this.themeConfig.hero?.autoScrollSpeed || 5) * 1000;
      this.heroInterval = setInterval(() => {
        this.currentHeroSlide = (this.currentHeroSlide + 1) % this.heroSlideCount;
      }, speed);
    }
  }

  stopHeroCarousel(): void {
    if (this.heroInterval) {
      clearInterval(this.heroInterval);
      this.heroInterval = null;
    }
  }

  getHeroOverlay(): any {
    return { opacity: this.themeConfig.hero.overlayOpacity || 0.5 };
  }

  getHeroTitle(): string {
    return this.themeConfig.hero.title || this.store?.name || '';
  }

  getHeroSubtitle(): string {
    return this.themeConfig.hero.subtitle || this.store?.description || '';
  }

  getHeroCta(): string {
    return this.themeConfig.hero.ctaText || 'Découvrir nos produits';
  }

  hasSocial(): boolean {
    const s = this.themeConfig.social;
    return !!(s?.facebook || s?.instagram || s?.tiktok);
  }

  loadFeaturedProducts(): void {
    this.isLoading = true;
    this.publicService.getPublicProducts({
      page: 0,
      size: 8,
      query: `storeId = '${this.store.id}'`,
      sort: 'priceDesc',
      storeContext: 'true'
    }).subscribe(products => {
      this.featuredProducts = products;
      this.isLoading = false;
    }, () => {
      this.isLoading = false;
    });
  }

  loadCategories(): void {
    this.publicService.getCategoryTree(this.currentStoreId).subscribe(cats => {
      this.categories = cats.slice(0, 8);
    });
  }

  browseProducts(): void {
    this.router.navigate([this.basePath, 'products']);
  }

  viewProduct(product: any): void {
    this.router.navigate([this.basePath, 'product', product.id]);
  }

  addToCart(product: any, event: Event): void {
    event.stopPropagation();
    this.cartService.addToCart(product, 1);
  }

  browseCategory(categoryId: number): void {
    this.router.navigate([this.basePath, 'products'], { queryParams: { category: categoryId } });
  }

  getProductImage(product: any): string {
    if (product.images) {
      const images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
      if (images.length > 0) {
        const img = images[0].url || images[0];
        return environment.backend + '/' + img;
      }
    }
    return 'assets/placeholder-product.png';
  }

  formatAddress(...parts: string[]): string {
    return parts.filter(p => !!p).join(', ');
  }
}
