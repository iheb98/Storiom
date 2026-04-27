import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
    faCreditCard, faCheck, faSpinner, faClock, faTimes,
    faReceipt, faBuilding, faCopy, faCheckCircle, faExclamationTriangle,
    faArrowLeft, faInfoCircle, faStar, faRocket, faGem, faEnvelope, faPhone,
    faHeadset, faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import { PaymentOrderService, PaymentOrder, PricingInfo, BankInstructions } from 'src/app/core/services/payment-order.service';
import { AuthService } from 'src/app/core/services/auth.service';
import Swal from 'sweetalert2';

interface SubscriptionPlan {
    key: '1M' | '3M' | '6M' | '12M';
    name: string;
    price: number;
    duration: string;
    discount?: string;
    popular?: boolean;
    icon: any;
}

@Component({
    selector: 'app-subscription',
    templateUrl: './subscription.component.html',
    styleUrls: ['./subscription.component.scss']
})
export class SubscriptionComponent implements OnInit {
    // Icons
    faCreditCard = faCreditCard;
    faCheck = faCheck;
    faSpinner = faSpinner;
    faClock = faClock;
    faTimes = faTimes;
    faReceipt = faReceipt;
    faBuilding = faBuilding;
    faCopy = faCopy;
    faCheckCircle = faCheckCircle;
    faExclamationTriangle = faExclamationTriangle;
    faArrowLeft = faArrowLeft;
    faInfoCircle = faInfoCircle;
    faStar = faStar;
    faRocket = faRocket;
    faGem = faGem;
    faEnvelope = faEnvelope;
    faPhone = faPhone;
    faHeadset = faHeadset;
    faChevronRight = faChevronRight;

    // Contact widget state
    contactWidgetExpanded = false;

    // State
    isLoading = true;
    isCreatingOrder = false;
    orders: PaymentOrder[] = [];
    pricing: PricingInfo | null = null;
    selectedPlan: SubscriptionPlan | null = null;
    currentOrder: PaymentOrder | null = null;
    bankInstructions: BankInstructions | null = null;
    copiedField: string | null = null;

    // Current subscription
    currentSubscription: {
        activationDate: string;
        expirationDate: string;
        duration: string;
        plan: string;
        isExpired: boolean;
        daysRemaining: number;
        percentRemaining: number;
        createdAt: string;
        // Queued next plan
        nextPlan: string | null;
        nextDuration: string | null;
        nextActivationDate: string | null;
        nextExpirationDate: string | null;
    } | null = null;

    // View state
    currentView: 'plans' | 'bank-details' | 'orders' = 'plans';
    showStorageSection = false;

    // Tier selection
    selectedTier: 'STOCK' | 'STOCK_WEBSITE' = 'STOCK';
    tierFeatures: { [key: string]: string[] } = {
        STOCK: [
            'Gestion complète des produits',
            'Suivi des commandes',
            'Statistiques & rapports',
            'Gestion des fournisseurs',
            'Gestion des dépenses & crédits',
            'Factures & reçus',
            'Gestion des travailleurs',
            'Gestion des catégories & marques'
        ],
        STOCK_WEBSITE: [
            'Tout du plan Gestion de Stock',
            'Boutique en ligne privée',
            'Domaine personnalisé',
            'Personnalisation du thème',
            'Panier & commandes clients',
            'Inscription des clients',
            'Avis & évaluations clients'
        ]
    };

    // Storage plans
    storagePlans: { [key: number]: { [key: string]: number } } = {};
    storageGBOptions: number[] = [50, 100, 200];
    storageDurationOptions: string[] = ['1M', '3M', '6M', '12M'];
    selectedStorageGB: number = 50;
    selectedStorageDuration: string = '1M';

    // Upgrade state
    upgradePrice: number = 0;
    upgradeInfo: any = null;
    isLoadingUpgrade = false;
    canUpgrade = false;

    // Plans
    plans: SubscriptionPlan[] = [];

    constructor(
        private paymentOrderService: PaymentOrderService,
        private authService: AuthService,
        private router: Router,
        private route: ActivatedRoute
    ) { }

    ngOnInit(): void {
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'auto' });
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
        }, 0);
        // Check if coming from storage purchase
        this.route.queryParams.subscribe(params => {
            if (params['action'] === 'storage') {
                this.showStorageSection = true;
            }
        });
        this.loadData();
    }

    loadData() {
        this.isLoading = true;

        // Load pricing
        this.paymentOrderService.getPricing().subscribe(
            res => {
                this.pricing = res;
                if (res.storagePlans) {
                    this.storagePlans = res.storagePlans;
                }
                this.initPlans();
            },
            error => {
                console.error('Error loading pricing:', error);
                // Initialize with default prices if API fails
                this.pricing = {
                    subscription: {
                        STOCK: { '1M': 40, '3M': 110, '6M': 210, '12M': 400 },
                        STOCK_WEBSITE: { '1M': 60, '3M': 170, '6M': 320, '12M': 600 }
                    },
                    storage: { pricePerUnit: 10, unitSizeGB: 50 },
                    currency: 'TND'
                };
                this.storagePlans = {
                    50: { '1M': 10, '3M': 28, '6M': 52, '12M': 100 },
                    100: { '1M': 18, '3M': 50, '6M': 94, '12M': 180 },
                    200: { '1M': 34, '3M': 95, '6M': 178, '12M': 340 }
                };
                this.initPlans();
            }
        );

        // Load user's orders
        this.paymentOrderService.getMyOrders().subscribe(
            res => {
                this.orders = res.orders || [];
                this.isLoading = false;
            },
            error => {
                console.error('Error loading orders:', error);
                this.orders = [];
                this.isLoading = false;
            }
        );

        // Load current subscription
        this.loadCurrentSubscription();
    }

    loadCurrentSubscription() {
        const userId = this.authService.getConnectedUser()?.id;
        if (!userId) return;

        this.authService.getSubscriptionDetails(userId).subscribe(
            (response: any) => {
                if (response.success && response.subscription) {
                    const sub = response.subscription;
                    const now = new Date();
                    const expDate = new Date(sub.expirationDate);
                    const activDate = new Date(sub.activationDate);

                    // Calculate days remaining
                    const msPerDay = 24 * 60 * 60 * 1000;
                    const daysRemaining = Math.max(0, Math.ceil((expDate.getTime() - now.getTime()) / msPerDay));

                    // Calculate percentage remaining
                    const totalDays = Math.ceil((expDate.getTime() - activDate.getTime()) / msPerDay);
                    const daysUsed = totalDays - daysRemaining;
                    const percentRemaining = Math.max(0, Math.min(100, Math.round((daysRemaining / totalDays) * 100)));

                    this.currentSubscription = {
                        ...sub,
                        daysRemaining,
                        percentRemaining
                    };
                }
            },
            error => console.error('Error loading subscription:', error)
        );
    }

    initPlans() {
        if (!this.pricing) return;

        const tierPrices = this.pricing.subscription[this.selectedTier];
        if (!tierPrices) return;

        // Calculate discounts based on monthly rate
        const monthlyPrice = tierPrices['1M'];

        this.plans = [
            {
                key: '1M',
                name: '1 Mois',
                price: tierPrices['1M'],
                duration: '1 mois',
                icon: faStar
            },
            {
                key: '3M',
                name: '3 Mois',
                price: tierPrices['3M'],
                duration: '3 mois',
                discount: Math.round((1 - tierPrices['3M'] / (monthlyPrice * 3)) * 100) + '%',
                icon: faRocket
            },
            {
                key: '6M',
                name: '6 Mois',
                price: tierPrices['6M'],
                duration: '6 mois',
                discount: Math.round((1 - tierPrices['6M'] / (monthlyPrice * 6)) * 100) + '%',
                popular: true,
                icon: faGem
            },
            {
                key: '12M',
                name: '12 Mois',
                price: tierPrices['12M'],
                duration: '12 mois',
                discount: Math.round((1 - tierPrices['12M'] / (monthlyPrice * 12)) * 100) + '%',
                icon: faCreditCard
            }
        ];
    }

    selectTier(tier: 'STOCK' | 'STOCK_WEBSITE') {
        this.selectedTier = tier;
        this.initPlans();

        // If user has active STOCK and selects STOCK_WEBSITE, load upgrade price
        if (tier === 'STOCK_WEBSITE' && this.currentSubscription && !this.currentSubscription.isExpired && this.currentSubscription.plan === 'STOCK') {
            this.isLoadingUpgrade = true;
            this.paymentOrderService.getUpgradePrice().subscribe(
                (res: any) => {
                    if (res.success && !res.alreadyUpgraded && !res.isExpired) {
                        this.canUpgrade = true;
                        this.upgradePrice = res.upgradePrice;
                        this.upgradeInfo = res;
                    } else {
                        this.canUpgrade = false;
                    }
                    this.isLoadingUpgrade = false;
                },
                () => {
                    this.canUpgrade = false;
                    this.isLoadingUpgrade = false;
                }
            );
        } else {
            this.canUpgrade = false;
        }
    }

    selectPlan(plan: SubscriptionPlan) {
        // Check if a next plan is already queued
        if (this.currentSubscription?.nextPlan) {
            Swal.fire({
                icon: 'warning',
                title: 'Plan en attente',
                text: 'Vous avez déjà un plan en file d\'attente. Veuillez attendre son activation avant d\'en ajouter un autre.',
                confirmButtonColor: '#3f51b5'
            });
            return;
        }

        // Check if this will be queued (different tier + active plan)
        const willBeQueued = this.currentSubscription
            && !this.currentSubscription.isExpired
            && this.currentSubscription.plan !== this.selectedTier;

        let warningHtml = '';
        if (willBeQueued) {
            const currentPlanLabel = this.currentSubscription!.plan === 'STOCK_WEBSITE' ? 'Stock + Website' : 'Stock';
            const expDate = new Date(this.currentSubscription!.expirationDate).toLocaleDateString('fr-FR');
            warningHtml = `
                <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 10px; padding: 12px; margin-top: 12px; text-align: left; font-size: 0.9rem;">
                    <strong style="color: #856404;">⚠️ Ce plan sera mis en file d'attente</strong>
                    <p style="margin: 6px 0 0; color: #856404;">
                        Votre plan actuel <strong>${currentPlanLabel}</strong> est actif jusqu'au <strong>${expDate}</strong>. 
                        Le nouveau plan ne sera activé qu'après cette date.
                    </p>
                </div>
            `;
        }

        Swal.fire({
            title: 'Confirmer votre choix',
            html: `
                <div style="text-align: center; padding: 10px 0;">
                    <div style="font-size: 2.5rem; font-weight: 800; color: #2c3e50; margin-bottom: 8px;">
                        ${plan.price} <span style="font-size: 1rem; color: #6c757d;">TND</span>
                    </div>
                    <div style="font-size: 1.1rem; color: #6c757d; margin-bottom: 16px;">
                        Abonnement ${plan.duration}
                    </div>
                    ${plan.discount ? `<div style="display: inline-block; background: rgba(76, 175, 80, 0.1); color: #4caf50; padding: 6px 16px; border-radius: 20px; font-weight: 600;">Économisez ${plan.discount}</div>` : ''}
                    ${warningHtml}
                </div>
            `,
            icon: willBeQueued ? 'warning' : 'question',
            showCancelButton: true,
            confirmButtonText: willBeQueued ? 'Confirmer (file d\'attente)' : 'Confirmer',
            cancelButtonText: 'Annuler',
            confirmButtonColor: '#3f51b5',
            cancelButtonColor: '#6c757d',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                this.selectedPlan = plan;
                this.createOrder();
            }
        });
    }

    createUpgradeOrder() {
        Swal.fire({
            title: 'Confirmer la mise à niveau',
            html: `
                <div style="text-align: center; padding: 10px 0;">
                    <div style="font-size: 2.5rem; font-weight: 800; color: #2c3e50; margin-bottom: 8px;">
                        ${this.upgradePrice} <span style="font-size: 1rem; color: #6c757d;">TND</span>
                    </div>
                    <div style="font-size: 1rem; color: #6c757d; margin-bottom: 8px;">
                        Mise à niveau vers <strong>Stock + Boutique</strong>
                    </div>
                    <div style="font-size: 0.9rem; color: #999; margin-bottom: 16px;">
                        Pour vos ${this.upgradeInfo?.remainingDays} jours restants
                    </div>
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Confirmer la mise à niveau',
            cancelButtonText: 'Annuler',
            confirmButtonColor: '#3f51b5',
            cancelButtonColor: '#6c757d',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                this.isCreatingOrder = true;
                this.paymentOrderService.createUpgradeOrder().subscribe(
                    (res: any) => {
                        this.isCreatingOrder = false;
                        this.currentOrder = res.order;
                        this.bankInstructions = res.bankInstructions;
                        this.currentView = 'bank-details';
                    },
                    (error: any) => {
                        this.isCreatingOrder = false;
                        Swal.fire('Erreur', error.error?.message || 'Une erreur est survenue', 'error');
                    }
                );
            }
        });
    }

    createOrder() {
        if (!this.selectedPlan) return;

        this.isCreatingOrder = true;

        this.paymentOrderService.createOrder({
            paymentType: 'SUBSCRIPTION',
            subscriptionPlan: this.selectedPlan.key,
            subscriptionTier: this.selectedTier
        }).subscribe(
            res => {
                this.isCreatingOrder = false;
                this.currentOrder = res.order;
                this.bankInstructions = res.bankInstructions;
                this.currentView = 'bank-details';
                this.loadData(); // Refresh orders list
            },
            error => {
                this.isCreatingOrder = false;
                const errorMessage = error.error?.message || 'Impossible de créer la commande. Veuillez réessayer.';
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur',
                    text: errorMessage,
                    confirmButtonColor: '#3f51b5'
                });
            }
        );
    }

    cancelOrder(orderId: number) {
        Swal.fire({
            title: 'Annuler la commande ?',
            text: 'Êtes-vous sûr de vouloir annuler cette commande ?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Oui, annuler',
            cancelButtonText: 'Non',
            confirmButtonColor: '#f44336'
        }).then((result) => {
            if (result.isConfirmed) {
                this.paymentOrderService.cancelMyOrder(orderId).subscribe(
                    res => {
                        Swal.fire({
                            icon: 'success',
                            title: 'Commande annulée',
                            text: 'Vous pouvez maintenant créer une nouvelle commande.',
                            confirmButtonColor: '#3f51b5'
                        });
                        this.loadData();
                    },
                    error => {
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

    selectStoragePlan() {
        this.isCreatingOrder = true;

        this.paymentOrderService.createOrder({
            paymentType: 'STORAGE_EXTENSION',
            storageGB: this.selectedStorageGB,
            storageDuration: this.selectedStorageDuration as '1M' | '3M' | '6M' | '12M'
        }).subscribe(
            res => {
                this.isCreatingOrder = false;
                this.currentOrder = res.order;
                this.bankInstructions = res.bankInstructions;
                this.currentView = 'bank-details';
                this.showStorageSection = false;
                this.loadData();
            },
            error => {
                this.isCreatingOrder = false;
                const errorMessage = error.error?.message || 'Impossible de créer la commande. Veuillez réessayer.';
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur',
                    text: errorMessage,
                    confirmButtonColor: '#3f51b5'
                });
            }
        );
    }

    getStoragePrice(): number {
        if (this.storagePlans && this.storagePlans[this.selectedStorageGB]) {
            return this.storagePlans[this.selectedStorageGB][this.selectedStorageDuration] || 0;
        }
        return 0;
    }

    getDurationLabel(duration: string): string {
        const labels: { [key: string]: string } = {
            '1M': '1 mois', '3M': '3 mois', '6M': '6 mois', '12M': '12 mois'
        };
        return labels[duration] || duration;
    }

    confirmPayment() {
        if (!this.currentOrder) return;

        Swal.fire({
            title: 'Confirmer le paiement',
            html: `
        <p>Avez-vous bien effectué le virement bancaire de <strong>${this.currentOrder.amount} TND</strong> ?</p>
        <p class="text-muted">En confirmant, nous serons notifiés et vérifierons la réception du paiement.</p>
      `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Oui, j\'ai payé',
            cancelButtonText: 'Pas encore',
            confirmButtonColor: '#4caf50'
        }).then((result) => {
            if (result.isConfirmed) {
                this.paymentOrderService.confirmPayment(this.currentOrder!.id).subscribe(
                    res => {
                        Swal.fire({
                            icon: 'success',
                            title: 'Confirmation envoyée !',
                            text: 'Nous avons été notifiés. Votre abonnement sera activé après vérification (24-48h).',
                            confirmButtonColor: '#3f51b5'
                        });
                        this.loadData();
                        this.currentView = 'orders';
                    },
                    error => {
                        Swal.fire({
                            icon: 'error',
                            title: 'Erreur',
                            text: 'Impossible d\'envoyer la confirmation.',
                            confirmButtonColor: '#3f51b5'
                        });
                    }
                );
            }
        });
    }

    copyToClipboard(text: string, field: string) {
        navigator.clipboard.writeText(text);
        this.copiedField = field;
        setTimeout(() => this.copiedField = null, 2000);
    }

    getStatusLabel(status: string): string {
        const labels: { [key: string]: string } = {
            'PENDING': 'En attente',
            'USER_CONFIRMED': 'Paiement à vérifier',
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

    viewOrderDetails(order: PaymentOrder) {
        this.paymentOrderService.getOrder(order.id).subscribe(
            res => {
                this.currentOrder = res.order;
                this.bankInstructions = res.bankInstructions;
                this.currentView = 'bank-details';
            }
        );
    }

    backToPlans() {
        this.currentView = 'plans';
        this.currentOrder = null;
        this.selectedPlan = null;
    }

    showOrders() {
        this.currentView = 'orders';
    }

    hasPendingOrders(): boolean {
        return this.orders.length > 0 && this.orders.some(o => o.status === 'PENDING' || o.status === 'USER_CONFIRMED');
    }
}
