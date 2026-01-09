import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { environment } from 'src/environments/environment';
import { ProductService } from 'src/app/core/services/product.service';
import { PublicService } from 'src/app/core/services/public.service';
import { WishlistService } from 'src/app/core/services/wishlist.service';
import { AnalyticsService } from 'src/app/core/services/analytics.service';

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
  selector: 'app-public-view-product',
  templateUrl: './public-view-product.component.html',
  styleUrls: ['./public-view-product.component.scss']
})
export class PublicViewProductComponent implements OnInit {

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

  // Recommendations
  recommendations: any[] = [];
  isLoadingRecommendations = false;

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
    private location: Location,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // Scroll to top when navigating to this page
    window.scrollTo(0, 0);

    this.route.paramMap.subscribe(params => {
      this.id = params.get('id');
      if (this.id) this.loadProduct(this.id);
    });
  }

  loadProduct(id: string) {
    this.isLoading = true;
    this.productNotFound = false;
    this.publicService.getPublicProduct(id).subscribe(res => {
      console.log('Product response:', res); // Debug log
      // Check if product is null, undefined, or empty object
      if (res === null || res === undefined || (typeof res === 'object' && !res.id)) {
        console.log('Product not found - setting productNotFound=true, isLoading=false');
        this.productNotFound = true;
        this.isLoading = false;
        this.cdr.detectChanges(); // Force Angular to update the view
        console.log('After setting: isLoading=', this.isLoading, 'productNotFound=', this.productNotFound);
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
          // Use mainImageIndex or default to 0
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

      // Load recommendations
      this.loadRecommendations(parseInt(id));
    }, () => {
      this.productNotFound = true;
      this.isLoading = false;
    });
  }

  loadRecommendations(productId: number) {
    this.isLoadingRecommendations = true;
    this.publicService.getProductRecommendations(productId, 4).subscribe({
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

    if (product.mainImage) {
      return this.environment.backend + '/' + product.mainImage;
    }

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

    if (typeof thumbnails === 'string') {
      try { thumbnails = JSON.parse(thumbnails); } catch { thumbnails = []; }
    }
    if (typeof images === 'string') {
      try { images = JSON.parse(images); } catch { images = []; }
    }

    const hasThumbnails = Array.isArray(thumbnails) && thumbnails.length > 0 && thumbnails[0];
    const hasImages = Array.isArray(images) && images.length > 0 && images[0];

    return !hasThumbnails && !hasImages;
  }

  viewRecommendation(productId: number) {
    this.router.navigate(['/publicProduct', productId]);
  }

  addRecommendationToCart(rec: any, event: Event) {
    event.stopPropagation(); // Prevent card click navigation
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
    if (!this.product.reviews) {
      this.product.reviews = [];
    }

    const existingIndex = this.product.reviews.findIndex((r: any) => r.id === review.id);
    if (existingIndex !== -1) {
      this.product.reviews[existingIndex] = review;
    } else {
      this.product.reviews.unshift(review);
    }

    const currentUser = this.authService.getConnectedUser();
    if (currentUser && review.userId === currentUser.id) {
      this.userReview = review;
    }

    this.calculateAverageRating();
  }

  // Image Gallery
  selectImage(index: number) {
    this.selectedImageIndex = index;
    this.selectedImage = environment.backend + '/' + this.product.images[index];
  }

  openImage(image: string) {
    this.lightboxOpen = true;
  }

  closeLightbox() {
    this.lightboxOpen = false;
  }

  prevImage(event: Event) {
    event.stopPropagation();
    if (this.selectedImageIndex > 0) {
      this.selectImage(this.selectedImageIndex - 1);
    } else {
      this.selectImage(this.product.images.length - 1);
    }
  }

  nextImage(event: Event) {
    event.stopPropagation();
    if (this.selectedImageIndex < this.product.images.length - 1) {
      this.selectImage(this.selectedImageIndex + 1);
    } else {
      this.selectImage(0);
    }
  }

  // Quantity
  increaseQuantity() {
    //if (this.quantity < this.product?.quantity) {
    this.quantity++;
    //}
  }

  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  // Price
  getDiscountedPrice(): number {
    if (this.product?.discount && this.product?.sellingPrice) {
      return this.product.sellingPrice * (1 - this.product.discount / 100);
    }
    return this.product?.sellingPrice || 0;
  }

  // Cart
  addToCart(product: any) {
    // Track cart_add event
    this.trackEvent('cart_add');

    if (this.authService.isLoggedIn()) {
      this.productService.addToCart(product.id, this.quantity).subscribe({
        next: () => {
          this.toastService.showSuccess('Produit ajouté au panier');
        },
        error: () => {
          this.toastService.showError('Échec de l\'ajout au panier');
        }
      });
    } else {
      this.cartService.addToCart(product, this.quantity);
      this.toastService.showSuccess('Produit ajouté au panier');
    }
  }

  // Track analytics events
  private trackEvent(interactionType: 'view' | 'cart_add') {
    if (this.product?.id) {
      const userId = this.authService.getConnectedUser()?.id;
      this.analyticsService.trackEvent({
        productId: this.product.id,
        interactionType,
        userId,
        storeId: this.product.storeId || this.product.store?.id,
        categoryId: this.product.categoryId || this.product.category?.id
      }).subscribe({
        error: (err) => console.log('Analytics tracking failed:', err)
      });
    }
  }

  goBack() {
    this.location.back();
  }

  toggleWishlist() {
    if (!this.authService.isLoggedIn()) {
      this.toastService.showWarning('Connectez-vous pour ajouter aux favoris');
      this.router.navigate(['/login']);
      return;
    }

    if (this.isInWishlist) {
      this.wishlistService.removeFromWishlist(this.product.id).subscribe({
        next: () => {
          this.isInWishlist = false;
          this.toastService.showSuccess('Retiré des favoris');
        },
        error: () => this.toastService.showError('Échec de la suppression')
      });
    } else {
      this.wishlistService.addToWishlist(this.product.id).subscribe({
        next: () => {
          this.isInWishlist = true;
          this.toastService.showSuccess('Ajouté aux favoris');
        },
        error: () => this.toastService.showError('Échec de l\'ajout')
      });
    }
  }
}
