import { Component, OnInit } from '@angular/core';
import {
    faReceipt, faCheck, faSpinner, faClock, faTimes, faCheckCircle,
    faSearch, faFilter, faEye, faUser, faCalendar, faCreditCard,
    faExclamationTriangle, faBan, faDatabase
} from '@fortawesome/free-solid-svg-icons';
import { PaymentOrderService, PaymentOrder } from 'src/app/core/services/payment-order.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-payment-orders-admin',
    templateUrl: './payment-orders-admin.component.html',
    styleUrls: ['./payment-orders-admin.component.scss']
})
export class PaymentOrdersAdminComponent implements OnInit {
    // Icons
    faReceipt = faReceipt;
    faCheck = faCheck;
    faSpinner = faSpinner;
    faClock = faClock;
    faTimes = faTimes;
    faCheckCircle = faCheckCircle;
    faSearch = faSearch;
    faFilter = faFilter;
    faEye = faEye;
    faUser = faUser;
    faCalendar = faCalendar;
    faCreditCard = faCreditCard;
    faExclamationTriangle = faExclamationTriangle;
    faBan = faBan;
    faDatabase = faDatabase;

    // State
    isLoading = true;
    isProcessing = false;
    orders: PaymentOrder[] = [];
    filteredOrders: PaymentOrder[] = [];
    selectedOrder: PaymentOrder | null = null;

    // Filters
    statusFilter = '';
    searchQuery = '';

    // Stats
    pendingCount = 0;
    confirmedCount = 0;
    paidCount = 0;

    constructor(private paymentOrderService: PaymentOrderService) { }

    ngOnInit(): void {
        this.loadOrders();
    }

    loadOrders() {
        this.isLoading = true;
        this.paymentOrderService.getAllOrders().subscribe(
            res => {
                this.orders = res.orders;
                this.calculateStats();
                this.applyFilters();
                this.isLoading = false;
            },
            error => {
                this.isLoading = false;
                console.error('Error loading orders:', error);
            }
        );
    }

    calculateStats() {
        this.pendingCount = this.orders.filter(o => o.status === 'PENDING').length;
        this.confirmedCount = this.orders.filter(o => o.status === 'USER_CONFIRMED').length;
        this.paidCount = this.orders.filter(o => o.status === 'PAID').length;
    }

    applyFilters() {
        let filtered = [...this.orders];

        if (this.statusFilter) {
            filtered = filtered.filter(o => o.status === this.statusFilter);
        }

        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(o =>
                o.orderNumber.toLowerCase().includes(query) ||
                o.user?.firstName?.toLowerCase().includes(query) ||
                o.user?.lastName?.toLowerCase().includes(query) ||
                o.user?.email?.toLowerCase().includes(query)
            );
        }

        this.filteredOrders = filtered;
    }

    filterByStatus(status: string) {
        this.statusFilter = this.statusFilter === status ? '' : status;
        this.applyFilters();
    }

    onSearch() {
        this.applyFilters();
    }

    selectOrder(order: PaymentOrder) {
        this.selectedOrder = order;
    }

    closeDetails() {
        this.selectedOrder = null;
    }

    validateOrder(order: PaymentOrder) {
        Swal.fire({
            title: 'Valider le paiement',
            html: `
        <p>Confirmer la réception du paiement de <strong>${order.amount} TND</strong> ?</p>
        <div style="margin-top: 16px;">
          <label style="display: block; margin-bottom: 8px; text-align: left;">Référence bancaire (optionnel)</label>
          <input type="text" id="bankRef" class="swal2-input" placeholder="Ex: VIR-12345">
        </div>
        <div style="margin-top: 8px;">
          <label style="display: block; margin-bottom: 8px; text-align: left;">Notes (optionnel)</label>
          <textarea id="notes" class="swal2-textarea" placeholder="Notes internes..."></textarea>
        </div>
      `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Valider le paiement',
            cancelButtonText: 'Annuler',
            confirmButtonColor: '#4caf50',
            preConfirm: () => {
                return {
                    bankReference: (document.getElementById('bankRef') as HTMLInputElement)?.value,
                    notes: (document.getElementById('notes') as HTMLTextAreaElement)?.value
                };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                this.isProcessing = true;
                this.paymentOrderService.validateOrder(
                    order.id,
                    result.value.bankReference,
                    result.value.notes
                ).subscribe(
                    res => {
                        this.isProcessing = false;
                        Swal.fire({
                            icon: 'success',
                            title: 'Paiement validé !',
                            text: order.paymentType === 'SUBSCRIPTION'
                                ? 'L\'abonnement a été renouvelé.'
                                : 'Le stockage a été ajouté.',
                            confirmButtonColor: '#3f51b5'
                        });
                        this.loadOrders();
                        this.selectedOrder = null;
                    },
                    error => {
                        this.isProcessing = false;
                        Swal.fire({
                            icon: 'error',
                            title: 'Erreur',
                            text: 'Impossible de valider le paiement.',
                            confirmButtonColor: '#3f51b5'
                        });
                    }
                );
            }
        });
    }

    cancelOrder(order: PaymentOrder) {
        Swal.fire({
            title: 'Annuler la commande ?',
            html: `
        <p>Êtes-vous sûr de vouloir annuler la commande <strong>#${order.orderNumber}</strong> ?</p>
        <div style="margin-top: 16px;">
          <label style="display: block; margin-bottom: 8px; text-align: left;">Raison de l'annulation</label>
          <textarea id="cancelNotes" class="swal2-textarea" placeholder="Raison..."></textarea>
        </div>
      `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Annuler la commande',
            cancelButtonText: 'Retour',
            confirmButtonColor: '#f44336',
            preConfirm: () => {
                return (document.getElementById('cancelNotes') as HTMLTextAreaElement)?.value;
            }
        }).then((result) => {
            if (result.isConfirmed) {
                this.isProcessing = true;
                this.paymentOrderService.cancelOrder(order.id, result.value).subscribe(
                    res => {
                        this.isProcessing = false;
                        Swal.fire({
                            icon: 'success',
                            title: 'Commande annulée',
                            confirmButtonColor: '#3f51b5'
                        });
                        this.loadOrders();
                        this.selectedOrder = null;
                    },
                    error => {
                        this.isProcessing = false;
                        Swal.fire({
                            icon: 'error',
                            title: 'Erreur',
                            text: 'Impossible d\'annuler la commande.',
                            confirmButtonColor: '#3f51b5'
                        });
                    }
                );
            }
        });
    }

    getStatusLabel(status: string): string {
        const labels: { [key: string]: string } = {
            'PENDING': 'En attente',
            'USER_CONFIRMED': 'À vérifier',
            'PAID': 'Payé',
            'CANCELLED': 'Annulé'
        };
        return labels[status] || status;
    }

    getStatusClass(status: string): string {
        const classes: { [key: string]: string } = {
            'PENDING': 'status-pending',
            'USER_CONFIRMED': 'status-confirming',
            'PAID': 'status-paid',
            'CANCELLED': 'status-cancelled'
        };
        return classes[status] || '';
    }

    getPlanLabel(plan: string): string {
        const labels: { [key: string]: string } = {
            '1M': '1 Mois',
            '3M': '3 Mois',
            '6M': '6 Mois',
            '12M': '12 Mois'
        };
        return labels[plan] || plan;
    }
}
