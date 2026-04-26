import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/core/services/auth.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { FileService } from 'src/app/core/services/file.service';
import {
  faGlobe, faSave, faCheckCircle, faClock, faSync, faTrash,
  faInfoCircle, faCog, faExclamationTriangle, faPaintBrush,
  faSun, faMoon, faCheck, faSpinner, faExternalLinkAlt,
  faImage, faBullhorn, faTruck, faShieldAlt, faHeadset,
  faRedo, faStar, faHeart, faGift, faBolt, faLeaf, faGem,
  faChevronDown, faChevronUp, faPlus, faTimes, faEye, faEyeSlash,
  faShareAlt, faQuoteRight, faStore, faToggleOn, faToggleOff,
  faCloudUploadAlt, faArrowsAlt, faImages, faTag,
  faLock, faRocket, faCrown, faArrowRight
} from '@fortawesome/free-solid-svg-icons';
import {
  faFacebook, faInstagram, faTiktok
} from '@fortawesome/free-brands-svg-icons';

@Component({
  selector: 'app-domain-settings',
  templateUrl: './domain-settings.component.html',
  styleUrls: ['./domain-settings.component.scss']
})
export class DomainSettingsComponent implements OnInit {
  private apiUrl = environment.apiUrl;
  backend = environment.backend;

  // Icons
  faGlobe = faGlobe;
  faSave = faSave;
  faCheckCircle = faCheckCircle;
  faClock = faClock;
  faSync = faSync;
  faTrash = faTrash;
  faInfoCircle = faInfoCircle;
  faCog = faCog;
  faExclamationTriangle = faExclamationTriangle;
  faPaintBrush = faPaintBrush;
  faSun = faSun;
  faMoon = faMoon;
  faCheck = faCheck;
  faSpinner = faSpinner;
  faExternalLinkAlt = faExternalLinkAlt;
  faImage = faImage;
  faBullhorn = faBullhorn;
  faTruck = faTruck;
  faShieldAlt = faShieldAlt;
  faHeadset = faHeadset;
  faRedo = faRedo;
  faStar = faStar;
  faHeart = faHeart;
  faGift = faGift;
  faBolt = faBolt;
  faLeaf = faLeaf;
  faGem = faGem;
  faChevronDown = faChevronDown;
  faChevronUp = faChevronUp;
  faPlus = faPlus;
  faTimes = faTimes;
  faEye = faEye;
  faEyeSlash = faEyeSlash;
  faShareAlt = faShareAlt;
  faQuoteRight = faQuoteRight;
  faStore = faStore;
  faToggleOn = faToggleOn;
  faToggleOff = faToggleOff;
  faCloudUploadAlt = faCloudUploadAlt;
  faArrowsAlt = faArrowsAlt;
  faImages = faImages;
  faTag = faTag;
  faFacebook = faFacebook;
  faInstagram = faInstagram;
  faTiktok = faTiktok;
  faLock = faLock;
  faRocket = faRocket;
  faCrown = faCrown;
  faArrowRight = faArrowRight;

  // Plan gating
  hasWebsitePlan = false;
  isCheckingPlan = true;

  // Domain
  customDomain = '';
  domainVerified = false;
  isLoading = true;
  isSaving = false;
  isVerifying = false;
  isRemoving = false;
  verificationDetails = '';
  hasDomain = false;

  // Theme
  theme: any = {
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
      images: [] as string[],
      overlayOpacity: 0.5,
      autoScrollSpeed: 5,
      gradientColor1: '',
      gradientColor2: ''
    },
    announcement: {
      enabled: false,
      text: '',
      bgColor: '#4f46e5',
      link: ''
    },
    usps: {
      enabled: true,
      items: [
        { icon: 'truck', title: 'Livraison rapide', subtitle: 'En 24-48h' },
        { icon: 'shield', title: 'Paiement sécurisé', subtitle: '100% sécurisé' },
        { icon: 'refresh', title: 'Retours faciles', subtitle: 'Sous 14 jours' },
        { icon: 'headset', title: 'Support client', subtitle: 'À votre écoute' }
      ]
    },
    about: {
      enabled: false,
      title: 'Notre histoire',
      content: '',
      image: ''
    },
    social: {
      facebook: '',
      instagram: '',
      tiktok: ''
    },
    footer: {
      text: '',
      bgColor: '#0f172a',
      textColor: '#94a3b8',
      showContact: true,
      showSocial: true,
      showQuickLinks: true,
      quickLinks: [] as { label: string; url: string }[]
    },
    header: {
      bgColor: '#ffffff',
      textColor: '#0f172a',
      sticky: true,
      showSearch: true,
      logoPosition: 'left',
      icons: {
        home: 'home',
        products: 'th-large',
        cart: 'shopping-bag'
      }
    },
    productsPage: {
      gridColumns: 4,
      gridColumnsMobile: 2,
      defaultSort: '',
      showFilters: true,
      productsPerPage: 24,
      headerGradient: true
    },
    cartPage: {
      checkoutText: 'Commander',
      showContinueShopping: true,
      showFreeShipping: true
    },
    productCard: {
      showCartButton: true,
      showDiscountBadge: true,
      imageRatio: 'square',
      borderRadius: 14,
      hoverEffect: 'lift'
    },
    sections: {
      hero: true,
      products: true,
      categories: true,
      usps: true,
      about: false,
      info: true,
      footer: true
    },
    browserTab: {
      title: '',
      favicon: ''
    }
  };
  isSavingTheme = false;
  isUploadingHeroImages = false;
  heroImagePreviews: string[] = [];

  // Header templates
  headerTemplates = [
    {
      id: 'classic',
      name: 'Classique',
      desc: 'Fond blanc, texte sombre',
      preview: { bg: '#ffffff', text: '#0f172a', accent: '#4f46e5' },
      config: { bgColor: '#ffffff', textColor: '#0f172a', sticky: true, showSearch: true, logoPosition: 'left' }
    },
    {
      id: 'dark',
      name: 'Sombre',
      desc: 'Fond noir élégant',
      preview: { bg: '#0f172a', text: '#f1f5f9', accent: '#818cf8' },
      config: { bgColor: '#0f172a', textColor: '#f1f5f9', sticky: true, showSearch: true, logoPosition: 'left' }
    },
    {
      id: 'branded',
      name: 'Couleur de marque',
      desc: 'Utilise votre couleur principale',
      preview: { bg: 'primary', text: '#ffffff', accent: '#ffffff' },
      config: { bgColor: '__primary__', textColor: '#ffffff', sticky: true, showSearch: true, logoPosition: 'left' }
    },
    {
      id: 'minimal',
      name: 'Minimaliste',
      desc: 'Épuré, logo centré',
      preview: { bg: '#ffffff', text: '#334155', accent: '#94a3b8' },
      config: { bgColor: '#ffffff', textColor: '#334155', sticky: false, showSearch: false, logoPosition: 'center' }
    },
    {
      id: 'soft',
      name: 'Doux',
      desc: 'Fond crème chaleureux',
      preview: { bg: '#faf7f2', text: '#44403c', accent: '#d97706' },
      config: { bgColor: '#faf7f2', textColor: '#44403c', sticky: true, showSearch: true, logoPosition: 'left' }
    }
  ];

  applyHeaderTemplate(template: any): void {
    const config = { ...template.config };
    if (config.bgColor === '__primary__') {
      config.bgColor = this.theme.primaryColor || '#4f46e5';
    }
    this.theme.header = { ...this.theme.header, ...config, template: template.id };
  }

  // Icon choices for each nav slot
  navIconOptions: { [key: string]: { label: string; icons: { value: string; label: string }[] } } = {
    home: {
      label: 'Accueil',
      icons: [
        { value: 'home', label: 'Maison' },
        { value: 'bank', label: 'Bâtiment' },
        { value: 'star', label: 'Étoile' },
        { value: 'heart', label: 'Cœur' },
        { value: 'bookmark', label: 'Signet' },
        { value: 'compass', label: 'Boussole' }
      ]
    },
    products: {
      label: 'Produits',
      icons: [
        { value: 'th-large', label: 'Grille' },
        { value: 'shopping-bag', label: 'Sac' },
        { value: 'tags', label: 'Tags' },
        { value: 'cubes', label: 'Cubes' },
        { value: 'list', label: 'Liste' },
        { value: 'archive', label: 'Archive' }
      ]
    },
    cart: {
      label: 'Panier',
      icons: [
        { value: 'shopping-bag', label: 'Sac' },
        { value: 'shopping-cart', label: 'Chariot' },
        { value: 'cart-plus', label: 'Chariot +' },
        { value: 'gift', label: 'Cadeau' },
        { value: 'briefcase', label: 'Mallette' },
        { value: 'suitcase', label: 'Valise' }
      ]
    }
  };

  // Sidebar navigation
  activeSection = 'domain';
  sidebarGroups = [
    {
      label: '',
      items: [
        { key: 'domain', label: 'Domaine', icon: 'globe' },
        { key: 'browserTab', label: 'Onglet navigateur', icon: 'tag' }
      ]
    },
    {
      label: 'Apparence',
      items: [
        { key: 'colors', label: 'Couleurs & Thème', icon: 'tint' },
        { key: 'typography', label: 'Typographie', icon: 'font' }
      ]
    },
    {
      label: 'Pages',
      items: [
        { key: 'hero', label: 'Hero / Bannière', icon: 'image' },
        { key: 'products', label: 'Page Produits', icon: 'th-large' },
        { key: 'cart', label: 'Panier', icon: 'shopping-cart' }
      ]
    },
    {
      label: 'Composants',
      items: [
        { key: 'header', label: 'En-tête', icon: 'window-maximize' },
        { key: 'footer', label: 'Pied de page', icon: 'columns' },
        { key: 'productCard', label: 'Carte produit', icon: 'id-card' }
      ]
    },
    {
      label: 'Contenu',
      items: [
        { key: 'announcement', label: "Barre d'annonce", icon: 'bullhorn' },
        { key: 'usps', label: 'Avantages', icon: 'check-circle' },
        { key: 'about', label: 'À propos', icon: 'info-circle' },
        { key: 'social', label: 'Réseaux sociaux', icon: 'share-alt' }
      ]
    },
    {
      label: '',
      items: [
        { key: 'visibility', label: 'Visibilité', icon: 'eye' }
      ]
    }
  ];

  // Config
  fonts = ['Inter', 'Roboto', 'Outfit', 'Poppins', 'Montserrat', 'Open Sans', 'Lato', 'Raleway'];
  uspIcons = [
    { value: 'truck', label: '🚚 Livraison' },
    { value: 'shield', label: '🛡️ Sécurité' },
    { value: 'refresh', label: '🔄 Retours' },
    { value: 'headset', label: '🎧 Support' },
    { value: 'star', label: '⭐ Qualité' },
    { value: 'heart', label: '❤️ Satisfaction' },
    { value: 'gift', label: '🎁 Cadeau' },
    { value: 'bolt', label: '⚡ Rapidité' },
    { value: 'leaf', label: '🍃 Écologique' },
    { value: 'gem', label: '💎 Premium' },
    { value: 'check', label: '✅ Garanti' }
  ];
  heroStyles = [
    { value: 'fullImage', label: 'Image plein écran' },
    { value: 'gradient', label: 'Dégradé de couleurs' },
    { value: 'split', label: 'Image + Texte côte à côte' }
  ];
  availableIcons = [
    { value: 'truck', label: 'Livraison' },
    { value: 'shield', label: 'Sécurité' },
    { value: 'refresh', label: 'Retours' },
    { value: 'headset', label: 'Support' },
    { value: 'star', label: 'Étoile' },
    { value: 'heart', label: 'Cœur' },
    { value: 'gift', label: 'Cadeau' },
    { value: 'bolt', label: 'Éclair' },
    { value: 'leaf', label: 'Nature' },
    { value: 'gem', label: 'Qualité' },
    { value: 'check', label: 'Validé' }
  ];

  // Store images for hero picker
  storeImages: string[] = [];

  storeId: number;
  store: any = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private toastService: ToastService,
    private fileService: FileService
  ) {}

  ngOnInit(): void {
    this.storeId = this.authService.getConnectedUser()?.store;
    // Check subscription plan first
    const userId = this.authService.getConnectedUser()?.id;
    if (userId) {
      this.authService.getSubscriptionDetails(userId).subscribe(
        (response: any) => {
          if (response.success && response.subscription) {
            this.hasWebsitePlan = response.subscription.plan === 'STOCK_WEBSITE';
          }
          this.isCheckingPlan = false;
        },
        () => {
          this.isCheckingPlan = false;
        }
      );
    } else {
      this.isCheckingPlan = false;
    }
    if (this.storeId) {
      this.loadStoreSettings();
    }
  }

  setActiveSection(section: string): void {
    this.activeSection = section;
  }

  loadStoreSettings(): void {
    this.isLoading = true;
    this.http.get<any>(`${this.apiUrl}/stores/${this.storeId}`).subscribe(
      store => {
        this.customDomain = store.customDomain || '';
        this.domainVerified = store.domainVerified || false;
        this.hasDomain = !!store.customDomain;
        this.store = store;

        // Deep merge theme with defaults
        if (store.theme) {
          this.theme = this.deepMerge(this.theme, store.theme);
        }

        // Extract store images for hero picker
        if (store.images) {
          const imgs = typeof store.images === 'string' ? JSON.parse(store.images) : store.images;
          this.storeImages = imgs.map((img: any) => typeof img === 'string' ? img : img.url || img);
        }

        this.isLoading = false;
      },
      err => {
        console.error(err);
        this.isLoading = false;
      }
    );
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

  getIconForValue(iconValue: string): any {
    const iconMap: any = {
      truck: this.faTruck,
      shield: this.faShieldAlt,
      refresh: this.faRedo,
      headset: this.faHeadset,
      star: this.faStar,
      heart: this.faHeart,
      gift: this.faGift,
      bolt: this.faBolt,
      leaf: this.faLeaf,
      gem: this.faGem,
      check: this.faCheck
    };
    return iconMap[iconValue] || this.faStar;
  }

  addUspItem(): void {
    if (this.theme.usps.items.length < 6) {
      this.theme.usps.items.push({ icon: 'star', title: '', subtitle: '' });
    }
  }

  removeUspItem(index: number): void {
    this.theme.usps.items.splice(index, 1);
  }

  selectHeroImage(img: string): void {
    this.theme.hero.backgroundImage = img;
  }

  // ── Hero Image Carousel Upload ──
  onHeroImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files);
    this.uploadHeroImages(files);
    input.value = ''; // Reset so same files can be re-selected
  }

  onHeroDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onHeroDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer?.files) {
      const files = Array.from(event.dataTransfer.files).filter(f => f.type.startsWith('image/'));
      if (files.length > 0) this.uploadHeroImages(files);
    }
  }

  uploadHeroImages(files: File[]): void {
    if (!this.theme.hero.images) this.theme.hero.images = [];

    const maxImages = 10;
    const remaining = maxImages - this.theme.hero.images.length;
    if (remaining <= 0) {
      this.toastService.showError('Maximum 10 images autorisées');
      return;
    }

    const filesToUpload = files.slice(0, remaining);
    this.isUploadingHeroImages = true;
    let completed = 0;

    filesToUpload.forEach(file => {
      const userId = this.authService.getConnectedUser()?.id || 'hero';
      const fileName = `hero-${userId}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}${file.name.substring(file.name.lastIndexOf('.'))}`;
      const formData = new FormData();
      formData.set('file', file, fileName);

      this.fileService.uploadFile(formData).subscribe(
        res => {
          const uploadedKey = res.fileUrl.split('/').pop();
          this.theme.hero.images.push(uploadedKey);
          completed++;
          if (completed === filesToUpload.length) {
            this.isUploadingHeroImages = false;
            this.toastService.showSuccess(`${completed} image(s) ajoutée(s)`);
          }
        },
        err => {
          completed++;
          if (completed === filesToUpload.length) {
            this.isUploadingHeroImages = false;
          }
          this.toastService.showError('Erreur lors de l\'upload');
        }
      );
    });
  }

  removeHeroImage(index: number): void {
    this.theme.hero.images.splice(index, 1);
  }

  moveHeroImage(fromIndex: number, direction: number): void {
    const toIndex = fromIndex + direction;
    if (toIndex < 0 || toIndex >= this.theme.hero.images.length) return;
    const images = this.theme.hero.images;
    [images[fromIndex], images[toIndex]] = [images[toIndex], images[fromIndex]];
  }

  // ── Footer Quick Links ──
  addQuickLink(): void {
    if (!this.theme.footer.quickLinks) this.theme.footer.quickLinks = [];
    if (this.theme.footer.quickLinks.length >= 6) {
      this.toastService.showError('Maximum 6 liens rapides');
      return;
    }
    this.theme.footer.quickLinks.push({ label: '', url: '' });
  }

  removeQuickLink(index: number): void {
    this.theme.footer.quickLinks.splice(index, 1);
  }

  // ── About Image Upload ──
  uploadAboutImage(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    const userId = this.authService.getConnectedUser()?.id || 'about';
    const fileName = `about-${userId}-${Date.now()}${file.name.substring(file.name.lastIndexOf('.'))}`;
    const formData = new FormData();
    formData.set('file', file, fileName);
    this.fileService.uploadFile(formData).subscribe(
      res => {
        this.theme.about.image = res.fileUrl.split('/').pop();
        this.toastService.showSuccess('Image ajoutée');
      },
      () => this.toastService.showError('Erreur lors de l\'upload')
    );
    input.value = '';
  }

  // ── Domain Methods ──
  saveDomain(): void {
    if (!this.customDomain.trim()) {
      this.toastService.showError('Veuillez entrer un domaine');
      return;
    }
    this.isSaving = true;
    this.http.put<any>(`${this.apiUrl}/stores/${this.storeId}/domain`, { domain: this.customDomain }).subscribe(
      res => {
        this.isSaving = false;
        this.hasDomain = true;
        this.domainVerified = false;
        this.customDomain = res.domain;
        this.toastService.showSuccess(res.message);
      },
      err => {
        this.isSaving = false;
        this.toastService.showError(err.error?.message || 'Erreur lors de la sauvegarde');
      }
    );
  }

  verifyDomain(): void {
    this.isVerifying = true;
    this.verificationDetails = '';
    this.http.post<any>(`${this.apiUrl}/stores/${this.storeId}/domain/verify`, {}).subscribe(
      res => {
        this.isVerifying = false;
        this.domainVerified = res.verified;
        this.verificationDetails = res.details;
        if (res.verified) {
          this.toastService.showSuccess('Domaine vérifié avec succès !');
        } else {
          this.toastService.showError('La vérification a échoué.');
        }
      },
      err => {
        this.isVerifying = false;
        this.toastService.showError('Erreur lors de la vérification');
      }
    );
  }

  removeDomain(): void {
    if (!confirm('Supprimer le domaine personnalisé ?')) return;
    this.isRemoving = true;
    this.http.delete<any>(`${this.apiUrl}/stores/${this.storeId}/domain`).subscribe(
      res => {
        this.isRemoving = false;
        this.customDomain = '';
        this.domainVerified = false;
        this.hasDomain = false;
        this.verificationDetails = '';
        this.toastService.showSuccess(res.message);
      },
      err => {
        this.isRemoving = false;
        this.toastService.showError('Erreur lors de la suppression');
      }
    );
  }

  saveTheme(): void {
    this.isSavingTheme = true;
    this.http.put<any>(`${this.apiUrl}/stores/${this.storeId}/theme`, { theme: this.theme }).subscribe(
      res => {
        this.isSavingTheme = false;
        // Sync local state with what the backend actually persisted
        if (res.theme) {
          this.theme = this.deepMerge(this.theme, res.theme);
        }
        this.toastService.showSuccess('Thème mis à jour');
      },
      err => {
        this.isSavingTheme = false;
        this.toastService.showError('Erreur lors de la sauvegarde du thème');
      }
    );
  }
  // ── Favicon Upload ──
  isUploadingFavicon = false;

  uploadFavicon(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    const userId = this.authService.getConnectedUser()?.id || 'favicon';
    const fileName = `favicon-${userId}-${Date.now()}${file.name.substring(file.name.lastIndexOf('.'))}`;
    const formData = new FormData();
    formData.set('file', file, fileName);

    this.isUploadingFavicon = true;
    this.fileService.uploadFile(formData).subscribe(
      res => {
        this.isUploadingFavicon = false;
        if (!this.theme.browserTab) this.theme.browserTab = { title: '', favicon: '' };
        this.theme.browserTab.favicon = res.fileUrl.split('/').pop();
        this.toastService.showSuccess('Favicon ajouté');
      },
      () => {
        this.isUploadingFavicon = false;
        this.toastService.showError('Erreur lors de l\'upload du favicon');
      }
    );
    input.value = '';
  }

  removeFavicon(): void {
    if (this.theme.browserTab) {
      this.theme.browserTab.favicon = '';
    }
  }
}
