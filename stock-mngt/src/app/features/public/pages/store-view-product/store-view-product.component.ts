import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
import { ProductService } from 'src/app/core/services/product.service';
import { PublicService } from 'src/app/core/services/public.service';
import { WishlistService } from 'src/app/core/services/wishlist.service';
import { AnalyticsService } from 'src/app/core/services/analytics.service';
import { DomainService } from 'src/app/core/services/domain.service';
import { StoreAuthService } from 'src/app/core/services/store-auth.service';

import { AuthService } from 'src/app/core/services/auth.service';
import { CartService } from 'src/app/core/services/cart.service';
import { ToastService } from 'src/app/core/services/toast.service';
import {
  faChevronRight, faChevronLeft, faSearchPlus, faStar, faStarHalfAlt,
  faCheck, faTimes, faMinus, faPlus, faShoppingCart, faTruck, faShieldAlt,
  faStore, faInfoCircle, faComments, faArrowLeft, faMapMarkerAlt, faHeart
} from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarEmpty, faHeart as faHeartEmpty } from '@fortawesome/free-regular-svg-icons';

@Component({
  selector: 'app-store-view-product',
  templateUrl: './store-view-product.component.html',
  styleUrls: ['./store-view-product.component.scss']
})
export class StoreViewProductComponent implements OnInit {

  environment = environment;
  product: any;
  id: string | null = null;
  selectedImage: string | null = null;
  selectedImageIndex: number = 0;
  isDefaultImage: boolean = false;
  userReview: any;
  quantity: number = 1;
  lightboxOpen: boolean = false;
  isInWishlist = false;
  isLoading = true;
  productNotFound = false;
  basePath = '';
  isPrivateStore = false;

  // Store customer reviews
  storeReviews: any[] = [];
  isCustomerLoggedIn = false;
  reviewRating = 0;
  reviewComment = '';
  hoveredStar = 0;
  isSubmittingReview = false;
  myStoreReview: any = null;

  // Recommendations
  recommendations: any[] = [];
  isLoadingRecommendations = false;

  // Theme
  showFreeShipping = false;

  // Icons
  faChevronRight = faChevronRight;
  faChevronLeft = faChevronLeft;
  faSearchPlus = faSearchPlus;
  faStar = faStar;
  faStarHalfAlt = faStarHalfAlt;
  faStarEmpty = faStarEmpty;
  faCheck = faCheck;
  faTimes = faTimes;
  faMinus = faMinus;
  faPlus = faPlus;
  faShoppingCart = faShoppingCart;
  faTruck = faTruck;
  faShieldAlt = faShieldAlt;
  faStore = faStore;
  faInfoCircle = faInfoCircle;
  faComments = faComments;
  faArrowLeft = faArrowLeft;
  faMapMarker = faMapMarkerAlt;
  faHeart = faHeart;
  faHeartEmpty = faHeartEmpty;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private publicService: PublicService,
    private wishlistService: WishlistService,
    private analyticsService: AnalyticsService,
    private cartService: CartService,
    private authService: AuthService,
    private toastService: ToastService,
    private domainService: DomainService,
    private storeAuth: StoreAuthService,
    private titleService: Title,
    private metaService: Meta,
    private location: Location,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'auto' });
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    }, 0);

    // Determine basePath from route
    const storeId = this.route.parent?.snapshot.paramMap.get('storeId') || null;
    if (storeId) {
      this.basePath = `/preview-store/${storeId}`;
      this.isPrivateStore = true;
    } else if (this.domainService.isCustomDomain) {
      this.basePath = '/store-home';
      this.isPrivateStore = true;
    }

    this.route.paramMap.subscribe(params => {
      this.id = params.get('id');
      if (this.id) this.loadProduct(this.id);
    });
  }

  loadProduct(id: string) {
    this.isLoading = true;
    this.productNotFound = false;
    this.publicService.getPublicProduct(id, { storeContext: 'true' }).subscribe(res => {
      if (res === null || res === undefined || (typeof res === 'object' && !res.id)) {
        this.productNotFound = true;
        this.isLoading = false;
        this.cdr.detectChanges();
        return;
      }
      this.product = res;
      this.calculateAverageRating();

      // Check wishlist status
      if (this.authService.isLoggedIn()) {
        this.wishlistService.checkInWishlist(this.product.id).subscribe(
          result => this.isInWishlist = result.inWishlist
        );
      }

      const currentUser = this.authService.getConnectedUser();
      if (currentUser && this.product.reviews) {
        this.userReview = this.product.reviews.find((r: any) => r.userId === currentUser.id);
      }

      if (this.product.images) {
        if (typeof this.product.images === 'string') {
          this.product.images = JSON.parse(this.product.images);
        }
        if (this.product.images.length > 0) {
          const idx = this.product.mainImageIndex || 0;
          const imageIdx = this.product.images.length > idx ? idx : 0;
          this.selectedImage = environment.backend + '/' + this.product.images[imageIdx];
          this.selectedImageIndex = imageIdx;
          this.isDefaultImage = false;
        } else {
          this.selectedImage = 'assets/default_product.png';
          this.isDefaultImage = true;
        }
      } else {
        this.selectedImage = 'assets/default_product.png';
        this.isDefaultImage = true;
      }
      this.isLoading = false;

      // SEO meta tags
      this.updateProductSeoTags();

      // Load store-specific reviews
      this.isCustomerLoggedIn = this.storeAuth.isLoggedIn();
      this.loadStoreReviews(parseInt(id));

      // Load recommendations
      this.loadRecommendations(parseInt(id));

      // Load theme config for cart settings
      const storeId = this.product?.store?.id
        || this.route.parent?.snapshot.paramMap.get('storeId')
        || this.domainService.storeId;
      if (storeId) {
        this.publicService.getStoreById(storeId).subscribe((store: any) => {
          this.showFreeShipping = store.theme?.cartPage?.showFreeShipping !== false;
        });
      }
    }, () => {
      this.productNotFound = true;
      this.isLoading = false;
    });
  }

  loadRecommendations(productId: number) {
    this.isLoadingRecommendations = true;
    const storeId = this.product?.store?.id
      || this.route.parent?.snapshot.paramMap.get('storeId')
      || this.domainService.storeId;
    this.publicService.getProductRecommendations(productId, 4, storeId).subscribe({
      next: (products) => {
        this.recommendations = products;
        this.isLoadingRecommendations = false;
      },
      error: () => {
        this.recommendations = [];
        this.isLoadingRecommendations = false;
      }
    });
  }

  getRecommendationImage(product: any): string {
    if (!product) return 'assets/default_product.png';
    if (product.mainImage) return this.environment.backend + '/' + product.mainImage;

    const idx = product?.mainImageIndex || 0;
    let thumbnails = product?.thumbnails;
    let images = product?.images;

    if (typeof thumbnails === 'string') {
      try { thumbnails = JSON.parse(thumbnails); } catch { thumbnails = []; }
    }
    if (typeof images === 'string') {
      try { images = JSON.parse(images); } catch { images = []; }
    }

    if (Array.isArray(thumbnails) && thumbnails.length > 0 && thumbnails[0]) {
      const imgIdx = thumbnails.length > idx ? idx : 0;
      return this.environment.backend + '/' + thumbnails[imgIdx];
    }
    if (Array.isArray(images) && images.length > 0 && images[0]) {
      const imgIdx = images.length > idx ? idx : 0;
      return this.environment.backend + '/' + images[imgIdx];
    }
    return 'assets/default_product.png';
  }

  getRecAverageRating(rec: any): number {
    if (!rec.reviews || rec.reviews.length === 0) return 0;
    const total = rec.reviews.reduce((acc: number, r: any) => acc + Number(r.rating), 0);
    return total / rec.reviews.length;
  }

  isDefaultRecImage(product: any): boolean {
    if (!product) return true;
    if (product.mainImage) return false;
    let thumbnails = product?.thumbnails;
    let images = product?.images;
    if (typeof thumbnails === 'string') { try { thumbnails = JSON.parse(thumbnails); } catch { thumbnails = []; } }
    if (typeof images === 'string') { try { images = JSON.parse(images); } catch { images = []; } }
    return !(Array.isArray(thumbnails) && thumbnails.length > 0 && thumbnails[0]) &&
           !(Array.isArray(images) && images.length > 0 && images[0]);
  }

  viewRecommendation(productId: number) {
    this.router.navigate([this.basePath, 'product', productId]);
  }

  addRecommendationToCart(rec: any, event: Event) {
    event.stopPropagation();
    this.cartService.addToCart(rec, 1);
    this.toastService.showSuccess(`${rec.name} ajouté au panier`);
  }

  calculateAverageRating() {
    if (this.product && this.product.reviews && this.product.reviews.length > 0) {
      const total = this.product.reviews.reduce((acc: number, review: any) => acc + Number(review.rating), 0);
      this.product.averageRating = total / this.product.reviews.length;
    } else {
      this.product.averageRating = 0;
    }
  }

  onReviewSubmitted(review: any) {
    if (!this.product.reviews) this.product.reviews = [];
    const existingIndex = this.product.reviews.findIndex((r: any) => r.id === review.id);
    if (existingIndex !== -1) {
      this.product.reviews[existingIndex] = review;
    } else {
      this.product.reviews.unshift(review);
    }
    const currentUser = this.authService.getConnectedUser();
    if (currentUser && review.userId === currentUser.id) this.userReview = review;
    this.calculateAverageRating();
  }

  // ═══ Store Customer Reviews ═══
  loadStoreReviews(productId: number): void {
    this.storeAuth.getProductReviews(productId).subscribe({
      next: (res) => {
        if (res.success) {
          this.storeReviews = res.reviews;
          // In store context, use store reviews for rating
          this.product.averageRating = this.getStoreAverageRating();
          this.product.storeReviewCount = this.storeReviews.length;
          // Check if current customer already reviewed
          if (this.isCustomerLoggedIn) {
            const customer = this.storeAuth.getCustomer();
            if (customer) {
              this.myStoreReview = this.storeReviews.find(r => r.storeCustomer?.id === customer.id);
              if (this.myStoreReview) {
                this.reviewRating = this.myStoreReview.rating;
                this.reviewComment = this.myStoreReview.comment || '';
              }
            }
          }
        }
      },
      error: () => { this.storeReviews = []; }
    });
  }

  getStoreAverageRating(): number {
    if (!this.storeReviews || this.storeReviews.length === 0) return 0;
    const total = this.storeReviews.reduce((acc, r) => acc + Number(r.rating), 0);
    return total / this.storeReviews.length;
  }

  setReviewRating(star: number): void {
    this.reviewRating = star;
  }

  submitStoreReview(): void {
    if (this.reviewRating < 1) {
      this.toastService.showError('Veuillez donner une note.');
      return;
    }
    this.isSubmittingReview = true;
    this.storeAuth.submitReview({
      rating: this.reviewRating,
      comment: this.reviewComment,
      productId: this.product.id
    }).subscribe({
      next: (res) => {
        this.isSubmittingReview = false;
        if (res.success) {
          this.toastService.showSuccess('Merci pour votre avis !');
          this.loadStoreReviews(this.product.id);
          this.myStoreReview = res.review;
        }
      },
      error: () => {
        this.isSubmittingReview = false;
        this.toastService.showError('Erreur lors de l\'envoi de votre avis.');
      }
    });
  }

  getStoreReviewStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < rating ? 1 : 0);
  }

  selectImage(index: number) {
    this.selectedImageIndex = index;
    this.selectedImage = environment.backend + '/' + this.product.images[index];
  }

  openImage(image: string) { this.lightboxOpen = true; }
  closeLightbox() { this.lightboxOpen = false; }

  prevImage(event: Event) {
    event.stopPropagation();
    if (this.selectedImageIndex > 0) this.selectImage(this.selectedImageIndex - 1);
    else this.selectImage(this.product.images.length - 1);
  }

  nextImage(event: Event) {
    event.stopPropagation();
    if (this.selectedImageIndex < this.product.images.length - 1) this.selectImage(this.selectedImageIndex + 1);
    else this.selectImage(0);
  }

  increaseQuantity() { this.quantity++; }
  decreaseQuantity() { if (this.quantity > 1) this.quantity--; }

  getDiscountedPrice(): number {
    if (this.product?.discount && this.product?.sellingPrice) {
      return this.product.sellingPrice * (1 - this.product.discount / 100);
    }
    return this.product?.sellingPrice || 0;
  }

  addToCart(product: any) {
    this.trackEvent('cart_add');
    this.cartService.addToCart(product, this.quantity);
    this.toastService.showSuccess('Produit ajouté au panier');
  }

  private trackEvent(interactionType: 'view' | 'cart_add') {
    if (this.product?.id) {
      const userId = this.authService.getConnectedUser()?.id;
      this.analyticsService.trackEvent({
        productId: this.product.id,
        interactionType,
        userId,
        storeId: this.product.storeId || this.product.store?.id,
        categoryId: this.product.categoryId || this.product.category?.id,
        source: this.isPrivateStore ? 'private_store' : 'marketplace'
      }).subscribe({ error: (err) => console.log('Analytics tracking failed:', err) });
    }
  }

  goBack() { this.location.back(); }

  browseProducts() {
    this.router.navigate([this.basePath, 'products']);
  }

  toggleWishlist() {
    if (!this.authService.isLoggedIn()) {
      this.toastService.showWarning('Connectez-vous pour ajouter aux favoris');
      this.router.navigate(['/login']);
      return;
    }
    if (this.isInWishlist) {
      this.wishlistService.removeFromWishlist(this.product.id).subscribe({
        next: () => { this.isInWishlist = false; this.toastService.showSuccess('Retiré des favoris'); },
        error: () => this.toastService.showError('Échec de la suppression')
      });
    } else {
      this.wishlistService.addToWishlist(this.product.id).subscribe({
        next: () => { this.isInWishlist = true; this.toastService.showSuccess('Ajouté aux favoris'); },
        error: () => this.toastService.showError('Échec de l\'ajout')
      });
    }
  }

  private updateProductSeoTags(): void {
    if (!this.product) return;
    const productName = this.product.name || 'Produit';
    const storeName = this.product.store?.name || '';
    const title = storeName ? `${productName} - ${storeName}` : productName;
    const description = this.product.description
      ? this.product.description.replace(/<[^>]*>/g, '').substring(0, 160)
      : `${productName} disponible sur ${storeName || 'Storiom'}`;
    const imageUrl = this.selectedImage && !this.isDefaultImage ? this.selectedImage : '';

    this.titleService.setTitle(title);
    this.metaService.updateTag({ name: 'description', content: description });
    this.metaService.updateTag({ property: 'og:title', content: title });
    this.metaService.updateTag({ property: 'og:description', content: description });
    this.metaService.updateTag({ property: 'og:type', content: 'product' });
    if (imageUrl) {
      this.metaService.updateTag({ property: 'og:image', content: imageUrl });
    }
    // Product price for rich snippets
    if (this.product.sellPrice) {
      this.metaService.updateTag({ property: 'product:price:amount', content: this.product.sellPrice.toString() });
      this.metaService.updateTag({ property: 'product:price:currency', content: 'TND' });
    }
  }
}
