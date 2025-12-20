import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { ProductService } from 'src/app/core/services/product.service';
import { PublicService } from 'src/app/core/services/public.service';

import { AuthService } from 'src/app/core/services/auth.service';
import { CartService } from 'src/app/core/services/cart.service';
import { ToastService } from 'src/app/core/services/toast.service';
import {
  faChevronRight, faChevronLeft, faSearchPlus, faStar, faStarHalfAlt,
  faCheck, faTimes, faMinus, faPlus, faShoppingCart, faTruck, faShieldAlt,
  faStore, faInfoCircle, faComments
} from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarEmpty } from '@fortawesome/free-regular-svg-icons';

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
  userReview: any;
  quantity: number = 1;
  lightboxOpen: boolean = false;

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

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private publicService: PublicService,

    private cartService: CartService,
    private authService: AuthService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.id = params.get('id');
      if (this.id) this.loadProduct(this.id);
    });
  }

  loadProduct(id: string) {
    //
    this.publicService.getPublicProduct(id).subscribe(res => {
      //
      this.product = res;
      this.calculateAverageRating();

      const currentUser = this.authService.getConnectedUser();
      if (currentUser && this.product.reviews) {
        this.userReview = this.product.reviews.find((r: any) => r.userId === currentUser.id);
      }

      if (this.product.images) {
        if (typeof this.product.images === 'string') {
          this.product.images = JSON.parse(this.product.images);
        }
        if (this.product.images.length > 0) {
          this.selectedImage = environment.backend + '/' + this.product.images[0];
          this.selectedImageIndex = 0;
        } else {
          this.selectedImage = 'assets/default_product.png';
        }
      } else {
        this.selectedImage = 'assets/default_product.png';
      }
    }, () => {
      //
    });
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
  getOriginalPrice(): number {
    if (this.product?.discount && this.product?.sellingPrice) {
      return this.product.sellingPrice / (1 - this.product.discount / 100);
    }
    return this.product?.sellingPrice || 0;
  }

  // Cart
  addToCart(product: any) {
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
}
