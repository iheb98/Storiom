import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { LoadingService } from 'src/app/core/services/loading.service';
import { OrderService } from 'src/app/core/services/order.service';
import { StoreService } from 'src/app/core/services/store.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import {
    faBox, faBoxOpen, faCheckCircle, faClock, faTimesCircle, faTruck,
    faCalendar, faChevronDown, faChevronUp, faUser, faEnvelope, faPhone,
    faShoppingBag, faCog, faList, faFilter, faTimes
} from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-orders-mngt',
    templateUrl: './orders-mngt.component.html',
    styleUrls: ['./orders-mngt.component.scss']
})
export class OrdersMngtComponent implements OnInit {

    orders: any[] = [];
    filteredOrders: any[] = [];
    store: any;
    activeFilter: string = '';
    expandedOrderId: number | null = null;

    backend_URL = environment.backend;

    // Icons
    faBox = faBox;
    faBoxOpen = faBoxOpen;
    faClock = faClock;
    faCheckCircle = faCheckCircle;
    faTruck = faTruck;
    faTimesCircle = faTimesCircle;
    faCalendar = faCalendar;
    faChevronDown = faChevronDown;
    faChevronUp = faChevronUp;
    faUser = faUser;
    faEnvelope = faEnvelope;
    faPhone = faPhone;
    faShoppingBag = faShoppingBag;
    faCog = faCog;
    faList = faList;
    faFilter = faFilter;
    faTimes = faTimes;

    constructor(
        private orderService: OrderService,
        private authService: AuthService,
        private storeService: StoreService,
        private loadingService: LoadingService
    ) { }

    ngOnInit(): void {
        this.loadingService.screenLoading();
        const user = this.authService.getConnectedUser();

        if (user?.store) {
            this.storeService.getStore(user.store).subscribe(store => {
                this.store = store;
                this.loadOrders();
            });
        } else {
            this.loadingService.screenLoaded();
        }
    }

    loadOrders() {
        this.orderService.getStoreOrders(this.store.id).subscribe(
            (res) => {
                this.orders = res;
                this.applyFilter();
                this.loadingService.screenLoaded();
            },
            (err) => {
                console.error(err);
                this.loadingService.screenLoaded();
            }
        );
    }

    // Filtering
    filterByStatus(status: string) {
        this.activeFilter = status;
        this.applyFilter();
    }

    applyFilter() {
        if (this.activeFilter) {
            this.filteredOrders = this.orders.filter(o => o.status === this.activeFilter);
        } else {
            this.filteredOrders = [...this.orders];
        }
    }

    getStatusCount(status: string): number {
        return this.orders.filter(o => o.status === status).length;
    }

    // Expand/Collapse
    toggleExpand(orderId: number) {
        this.expandedOrderId = this.expandedOrderId === orderId ? null : orderId;
    }

    // Status Management
    updateStatus(order: any, status: string) {
        const statusLabel = this.getStatusLabel(status);

        Swal.fire({
            title: 'Changer le statut',
            text: `Voulez-vous marquer cette commande comme "${statusLabel}" ?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Oui, confirmer',
            cancelButtonText: 'Annuler',
            confirmButtonColor: this.getStatusHexColor(status)
        }).then((result) => {
            if (result.isConfirmed) {
                this.loadingService.screenLoading();
                this.orderService.updateOrderStatus(order.id, status).subscribe(
                    (res) => {
                        if (res.success) {
                            order.status = res.order.status;
                            this.applyFilter();
                            Swal.fire({
                                icon: 'success',
                                title: 'Statut mis à jour !',
                                text: `La commande est maintenant "${statusLabel}"`,
                                showConfirmButton: false,
                                timer: 1500
                            });
                        }
                        this.loadingService.screenLoaded();
                    },
                    (err) => {
                        console.error(err);
                        Swal.fire({
                            icon: 'error',
                            title: 'Erreur',
                            text: 'Impossible de mettre à jour le statut'
                        });
                        this.loadingService.screenLoaded();
                    }
                );
            }
        });
    }

    getStatusLabel(status: string): string {
        switch (status) {
            case 'PENDING': return 'En attente';
            case 'CONFIRMED': return 'Confirmée';
            case 'SHIPPED': return 'Expédiée';
            case 'DELIVERED': return 'Livrée';
            case 'CANCELLED': return 'Annulée';
            default: return status;
        }
    }

    getStatusIcon(status: string) {
        switch (status) {
            case 'PENDING': return this.faClock;
            case 'CONFIRMED': return this.faCheckCircle;
            case 'SHIPPED': return this.faTruck;
            case 'DELIVERED': return this.faBox;
            case 'CANCELLED': return this.faTimesCircle;
            default: return this.faClock;
        }
    }

    getStatusHexColor(status: string): string {
        switch (status) {
            case 'PENDING': return '#f57c00';
            case 'CONFIRMED': return '#0288d1';
            case 'SHIPPED': return '#7c3aed';
            case 'DELIVERED': return '#2e7d32';
            case 'CANCELLED': return '#c62828';
            default: return '#3f51b5';
        }
    }

    // Helper to get product image (handles string vs array)
    getProductImage(product: any): string {
        if (!product?.images) return 'assets/default_product.png';

        let images = product.images;

        // Parse if it's a string
        if (typeof images === 'string') {
            try {
                images = JSON.parse(images);
            } catch {
                return 'assets/default_product.png';
            }
        }

        // Return first image or default
        if (Array.isArray(images) && images.length > 0) {
            return this.backend_URL + '/' + images[0];
        }

        return 'assets/default_product.png';
    }
}
