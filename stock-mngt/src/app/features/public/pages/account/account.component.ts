import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { Router } from '@angular/router';
import {
    faUser, faShoppingBag, faSignOutAlt, faCog, faChevronRight,
    faEnvelope, faPhone, faMapMarkerAlt, faCalendarAlt, faEdit,
    faClipboardList, faClock, faSpinner, faCheckCircle, faTimesCircle, faStore, faHeart, faTrash,
    faTruck, faBoxOpen, faEye
} from '@fortawesome/free-solid-svg-icons';
import { ServiceRequestService } from 'src/app/core/services/service-request.service';
import { WishlistService } from 'src/app/core/services/wishlist.service';
import { OrderService } from 'src/app/core/services/order.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-account',
    templateUrl: './account.component.html',
    styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {

    activeTab: 'profile' | 'orders' | 'services' | 'wishlist' = 'profile';
    user: any;
    isLoading = true;
    environment = environment;

    // Service Requests
    serviceRequests: any[] = [];
    isLoadingRequests = false;

    // Wishlist
    wishlistProducts: any[] = [];
    isLoadingWishlist = false;

    // Orders
    orders: any[] = [];
    isLoadingOrders = false;

    // Icons
    faUser = faUser;
    faShoppingBag = faShoppingBag;
    faSignOutAlt = faSignOutAlt;
    faCog = faCog;
    faChevronRight = faChevronRight;
    faEnvelope = faEnvelope;
    faPhone = faPhone;
    faMapMarkerAlt = faMapMarkerAlt;
    faCalendarAlt = faCalendarAlt;
    faEdit = faEdit;
    faClipboardList = faClipboardList;
    faClock = faClock;
    faSpinner = faSpinner;
    faCheckCircle = faCheckCircle;
    faTimesCircle = faTimesCircle;
    faStore = faStore;
    faHeart = faHeart;
    faTrash = faTrash;
    faTruck = faTruck;
    faBoxOpen = faBoxOpen;
    faEye = faEye;

    // Status config
    statuses = [
        { value: 'PENDING', label: 'En attente', icon: faClock, color: 'pending' },
        { value: 'IN_PROGRESS', label: 'En cours', icon: faSpinner, color: 'in-progress' },
        { value: 'COMPLETED', label: 'Terminé', icon: faCheckCircle, color: 'completed' },
        { value: 'CANCELLED', label: 'Annulé', icon: faTimesCircle, color: 'cancelled' }
    ];

    constructor(
        private authService: AuthService,
        private router: Router,
        private serviceRequestService: ServiceRequestService,
        private wishlistService: WishlistService,
        private orderService: OrderService
    ) { }

    ngOnInit(): void {
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'auto' });
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
        }, 0);
        this.loadUserProfile();
    }

    loadUserProfile() {
        const connectedUser = this.authService.getConnectedUser();
        if (connectedUser && connectedUser.id) {
            this.isLoading = true;
            this.authService.getUser(connectedUser.id).subscribe({
                next: (res) => {
                    this.user = res;
                    this.isLoading = false;
                },
                error: (err) => {
                    console.error(err);
                    this.isLoading = false;
                }
            });
        } else {
            this.router.navigate(['/login']);
        }
    }

    loadServiceRequests() {
        if (this.serviceRequests.length > 0) return; // Already loaded
        this.isLoadingRequests = true;
        this.serviceRequestService.getMyRequests().subscribe({
            next: (requests) => {
                this.serviceRequests = requests;
                this.isLoadingRequests = false;
            },
            error: (err) => {
                console.error(err);
                this.isLoadingRequests = false;
            }
        });
    }

    switchTab(tab: 'profile' | 'orders' | 'services' | 'wishlist') {
        this.activeTab = tab;
        if (tab === 'services') {
            this.loadServiceRequests();
        } else if (tab === 'wishlist') {
            this.loadWishlist();
        } else if (tab === 'orders') {
            this.loadOrders();
        }
    }

    getStatusInfo(status: string) {
        return this.statuses.find(s => s.value === status) || this.statuses[0];
    }

    logout() {
        this.authService.logout().subscribe(() => {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            this.router.navigate(['/']);
        });
    }

    getInitials(): string {
        if (!this.user) return '';
        const first = this.user.firstName?.charAt(0) || '';
        const last = this.user.lastName?.charAt(0) || '';
        return (first + last).toUpperCase();
    }

    getFullAddress(): string {
        if (!this.user?.address) return 'Non renseignée';
        const { street, city, state, postalCode, country } = this.user.address;
        const parts = [street, city, state, postalCode, country].filter(Boolean);
        return parts.length > 0 ? parts.join(', ') : 'Non renseignée';
    }

    getJoinDate(): string {
        if (!this.user?.createdAt) return '';
        return new Date(this.user.createdAt).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long'
        });
    }

    // Orders methods
    loadOrders() {
        if (this.orders.length > 0) return; // Already loaded
        this.isLoadingOrders = true;
        this.orderService.getMyOrders().subscribe({
            next: (orders) => {
                this.orders = orders;
                this.isLoadingOrders = false;
            },
            error: (err) => {
                console.error(err);
                this.isLoadingOrders = false;
            }
        });
    }

    getOrderStatusInfo(status: string) {
        const orderStatuses: any = {
            'pending': { label: 'En attente', color: 'pending' },
            'confirmed': { label: 'Confirmée', color: 'confirmed' },
            'processing': { label: 'En préparation', color: 'processing' },
            'shipped': { label: 'Expédiée', color: 'shipped' },
            'delivered': { label: 'Livrée', color: 'delivered' },
            'cancelled': { label: 'Annulée', color: 'cancelled' }
        };
        return orderStatuses[status] || { label: status, color: 'pending' };
    }

    getOrderItemImage(item: any): string {
        const product = item?.product;
        if (!product) return 'assets/default_product.png';

        // Check mainImage first
        if (product.mainImage) {
            return this.environment.backend + '/' + product.mainImage;
        }

        const idx = product?.mainImageIndex || 0;
        let thumbnails = product?.thumbnails;
        let images = product?.images;

        // Parse if string
        if (typeof thumbnails === 'string') {
            try { thumbnails = JSON.parse(thumbnails); } catch { thumbnails = []; }
        }
        if (typeof images === 'string') {
            try { images = JSON.parse(images); } catch { images = []; }
        }

        // Ensure they are arrays with content
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

    isDefaultOrderImage(item: any): boolean {
        const product = item?.product;
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

    // Wishlist methods
    loadWishlist() {
        this.isLoadingWishlist = true;
        this.wishlistService.getWishlist().subscribe({
            next: (products) => {
                this.wishlistProducts = products;
                this.isLoadingWishlist = false;
            },
            error: (err) => {
                console.error(err);
                this.isLoadingWishlist = false;
            }
        });
    }

    removeFromWishlist(productId: number) {
        this.wishlistService.removeFromWishlist(productId).subscribe({
            next: () => {
                this.wishlistProducts = this.wishlistProducts.filter(item => item.product?.id !== productId);
            },
            error: (err) => {
                console.error(err);
            }
        });
    }

    getProductImage(product: any): string {
        const idx = product?.mainImageIndex || 0;

        // Parse thumbnails if it's a string
        let thumbnails = product?.thumbnails;
        if (typeof thumbnails === 'string') {
            try {
                thumbnails = JSON.parse(thumbnails);
            } catch {
                thumbnails = [];
            }
        }

        // Parse images if it's a string
        let images = product?.images;
        if (typeof images === 'string') {
            try {
                images = JSON.parse(images);
            } catch {
                images = [];
            }
        }

        // Use mainImageIndex or fallback
        if (Array.isArray(thumbnails) && thumbnails.length > idx) {
            return this.environment.backend + '/' + thumbnails[idx];
        }
        if (Array.isArray(thumbnails) && thumbnails.length > 0) {
            return this.environment.backend + '/' + thumbnails[0];
        }
        if (Array.isArray(images) && images.length > idx) {
            return this.environment.backend + '/' + images[idx];
        }
        if (Array.isArray(images) && images.length > 0) {
            return this.environment.backend + '/' + images[0];
        }

        return 'assets/default_product.png';
    }

    viewProduct(productId: number) {
        this.router.navigate(['/publicProduct', productId]);
    }
}

