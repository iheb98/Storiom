import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { OrderService } from 'src/app/core/services/order.service';
import { StoreService } from 'src/app/core/services/store.service';
import { DeliveryWorkerService } from 'src/app/core/services/delivery-worker.service';
import { ReceiptService } from 'src/app/core/services/receipt.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import {
    faBox, faBoxOpen, faCheckCircle, faClock, faTimesCircle, faTruck,
    faCalendar, faChevronDown, faChevronUp, faUser, faEnvelope, faPhone,
    faShoppingBag, faCog, faList, faFilter, faTimes, faShoppingCart
} from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-orders-mngt',
    templateUrl: './orders-mngt.component.html',
    styleUrls: ['./orders-mngt.component.scss']
})
export class OrdersMngtComponent implements OnInit {

    // Data
    orders: any[] = [];
    filteredOrders: any[] = [];
    store: any;
    deliveryWorkers: any[] = [];

    // UI State
    activeFilter: string = '';
    expandedOrderId: number | null = null;

    // Loading States
    isLoading = true;
    isActionLoading = false;

    // Stock Validation Modal
    showStockModal = false;
    insufficientItems: any[] = [];
    pendingOrder: any = null;

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
    faShoppingCart = faShoppingCart;

    constructor(
        private orderService: OrderService,
        private authService: AuthService,
        private storeService: StoreService,
        private deliveryWorkerService: DeliveryWorkerService,
        private receiptService: ReceiptService
    ) { }

    ngOnInit(): void {
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'auto' });
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
        }, 0);
        this.isLoading = true;
        const user = this.authService.getConnectedUser();

        if (user?.store) {
            this.storeService.getStore(user.store).subscribe(
                store => {
                    this.store = store;
                    this.loadOrders();
                    this.loadDeliveryWorkers();
                },
                error => {
                    this.isLoading = false;
                    Swal.fire({
                        icon: 'error',
                        title: 'Erreur lors du chargement de la boutique',
                        showConfirmButton: false,
                        timer: 2000
                    });
                }
            );
        } else {
            this.isLoading = false;
        }
    }

    loadOrders() {
        this.orderService.getStoreOrders(this.store.id).subscribe(
            (res) => {
                this.orders = res;
                this.applyFilter();
                this.isLoading = false;
            },
            (err) => {
                console.error(err);
                this.isLoading = false;
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur lors du chargement des commandes',
                    showConfirmButton: false,
                    timer: 2000
                });
            }
        );
    }

    loadDeliveryWorkers() {
        this.deliveryWorkerService.getByStoreId(this.store.id).subscribe(
            (res) => {
                this.deliveryWorkers = res;
            },
            (err) => {
                console.error('Error loading delivery workers:', err);
            }
        );
    }

    updateDeliveryWorker(order: any, workerId: string) {
        const deliveryWorkerId = workerId ? parseInt(workerId) : null;

        this.isActionLoading = true;
        this.orderService.updateDeliveryWorker(order.id, deliveryWorkerId).subscribe(
            (res) => {
                this.isActionLoading = false;
                if (res.success) {
                    order.deliveryWorkerId = res.order.deliveryWorkerId;
                    order.deliveryWorker = res.order.deliveryWorker;
                    Swal.fire({
                        icon: 'success',
                        title: 'Livreur mis à jour !',
                        showConfirmButton: false,
                        timer: 1500
                    });
                }
            },
            (err) => {
                this.isActionLoading = false;
                console.error(err);
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur',
                    text: 'Impossible de mettre à jour le livreur'
                });
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
        // Special handling for CONFIRMED - check stock first
        if (status === 'CONFIRMED') {
            this.checkStockAndConfirm(order);
            return;
        }

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
                // Special handling for cancellation - show warning about quantity revert
                if (status === 'CANCELLED' && (order.status === 'CONFIRMED' || order.status === 'SHIPPED')) {
                    Swal.fire({
                        title: 'Annuler la commande ?',
                        html: `<p>Cette commande a déjà été <strong>${this.getStatusLabel(order.status).toLowerCase()}</strong>.</p>
                               <p>L'annulation va <strong>rétablir les quantités en stock</strong> pour tous les produits de cette commande.</p>`,
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'Oui, annuler la commande',
                        cancelButtonText: 'Non, garder',
                        confirmButtonColor: '#c62828'
                    }).then((cancelResult) => {
                        if (cancelResult.isConfirmed) {
                            this.performCancellation(order);
                        }
                    });
                } else {
                    this.performStatusUpdate(order, status);
                }
            }
        });
    }

    // Perform cancellation and update local quantities
    performCancellation(order: any) {
        this.isActionLoading = true;

        this.orderService.updateOrderStatus(order.id, 'CANCELLED').subscribe(
            (res) => {
                this.isActionLoading = false;
                if (res.success) {
                    // Update local product quantities (add back sold quantities)
                    for (const item of order.items) {
                        if (item.product) {
                            item.product.quantity = (item.product.quantity || 0) + item.quantity;
                        }
                    }
                    order.status = 'CANCELLED';
                    this.applyFilter();
                    Swal.fire({
                        icon: 'success',
                        title: 'Commande annulée !',
                        text: 'Les quantités en stock ont été rétablies.',
                        showConfirmButton: false,
                        timer: 2000
                    });
                }
            },
            (err) => {
                this.isActionLoading = false;
                console.error(err);
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur',
                    text: 'Impossible d\'annuler la commande'
                });
            }
        );
    }

    // Check stock availability before confirming
    checkStockAndConfirm(order: any) {
        const insufficientStock: any[] = [];

        for (const item of order.items) {
            const product = item.product;
            const requested = item.quantity;
            const available = product?.quantity || 0;

            if (requested > available) {
                insufficientStock.push({
                    product: product,
                    requested: requested,
                    available: available,
                    shortage: requested - available,
                    price: item.price
                });
            }
        }

        if (insufficientStock.length > 0) {
            // Show modal with insufficient items
            this.insufficientItems = insufficientStock;
            this.pendingOrder = order;
            this.showStockModal = true;
        } else {
            // All stock is available - proceed directly
            this.confirmOrderWithOperations(order);
        }
    }

    // Confirm order and create operations
    confirmOrderWithOperations(order: any, forceConfirm: boolean = false) {
        this.showStockModal = false;
        this.isActionLoading = true;

        // Create sell operations for each item
        const operationPromises = order.items.map((item: any) => {
            return this.receiptService.sellProduct({
                id: item.product.id,
                amount: item.quantity,
                price: item.price,
                date: new Date().toISOString(),
                impactStock: true
            }).toPromise();
        });

        Promise.all(operationPromises)
            .then(() => {
                // Update order status
                return this.orderService.updateOrderStatus(order.id, 'CONFIRMED').toPromise();
            })
            .then((res: any) => {
                this.isActionLoading = false;
                if (res.success) {
                    order.status = res.order.status;
                    // Update local product quantities
                    for (const item of order.items) {
                        if (item.product) {
                            item.product.quantity = Math.max(0, (item.product.quantity || 0) - item.quantity);
                        }
                    }
                    this.applyFilter();
                    Swal.fire({
                        icon: 'success',
                        title: 'Commande confirmée !',
                        text: forceConfirm
                            ? 'Commande confirmée malgré le stock insuffisant. Les opérations ont été créées.'
                            : 'La commande a été confirmée et les opérations de vente ont été créées.',
                        showConfirmButton: false,
                        timer: 2000
                    });
                }
            })
            .catch((err) => {
                this.isActionLoading = false;
                console.error(err);
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur',
                    text: 'Une erreur est survenue lors de la confirmation'
                });
            });

        this.insufficientItems = [];
        this.pendingOrder = null;
    }

    // Cancel stock modal
    cancelStockModal() {
        this.showStockModal = false;
        this.insufficientItems = [];
        this.pendingOrder = null;
    }

    // Proceed despite insufficient stock
    proceedAnyway() {
        if (this.pendingOrder) {
            this.confirmOrderWithOperations(this.pendingOrder, true);
        }
    }

    // Standard status update without operations
    performStatusUpdate(order: any, status: string) {
        const statusLabel = this.getStatusLabel(status);
        this.isActionLoading = true;

        this.orderService.updateOrderStatus(order.id, status).subscribe(
            (res) => {
                this.isActionLoading = false;
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
            },
            (err) => {
                this.isActionLoading = false;
                console.error(err);
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur',
                    text: 'Impossible de mettre à jour le statut'
                });
            }
        );
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

    // Check if status change is allowed (chronological order)
    // Order flow: PENDING → CONFIRMED → SHIPPED → DELIVERED
    // CANCELLED can be set from any status (except DELIVERED), but once cancelled, cannot change
    canChangeToStatus(currentStatus: string, targetStatus: string): boolean {
        const statusOrder = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

        // If already at target status, disable
        if (currentStatus === targetStatus) return false;

        // If cancelled or delivered, no more changes allowed
        if (currentStatus === 'CANCELLED' || currentStatus === 'DELIVERED') return false;

        // Can always cancel (except if delivered)
        if (targetStatus === 'CANCELLED') return true;

        // For normal flow, only allow forward movement
        const currentIndex = statusOrder.indexOf(currentStatus);
        const targetIndex = statusOrder.indexOf(targetStatus);

        // Only allow next status in sequence
        return targetIndex === currentIndex + 1;
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

        // Return image at mainImageIndex or default
        const idx = product?.mainImageIndex || 0;
        if (Array.isArray(images) && images.length > 0) {
            const imageIdx = images.length > idx ? idx : 0;
            return this.backend_URL + '/' + images[imageIdx];
        }

        return 'assets/default_product.png';
    }

    // Calculate original price from discounted price
    getOriginalPrice(item: any): number {
        const discount = item.product?.discount || 0;
        if (discount > 0 && discount < 100) {
            // item.price is the discounted price, calculate original
            return item.price / (1 - discount / 100);
        }
        return item.price;
    }
}
