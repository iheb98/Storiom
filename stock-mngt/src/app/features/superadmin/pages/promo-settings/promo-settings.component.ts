import { Component, OnInit } from '@angular/core';
import {
    faGift, faCheck, faSpinner, faTimes, faToggleOn, faToggleOff,
    faPercent, faUsers, faSave, faUndo, faInfoCircle, faChartBar
} from '@fortawesome/free-solid-svg-icons';
import { PromotionAdminService, PromotionConfig } from 'src/app/core/services/promotion-admin.service';
import Swal from 'sweetalert2';

// Pricing reference (keep in sync with backend)
const SUBSCRIPTION_PRICES: { [tier: string]: { [plan: string]: number } } = {
    STOCK: { '1M': 40, '3M': 110, '6M': 210, '12M': 400 },
    STOCK_WEBSITE: { '1M': 60, '3M': 170, '6M': 320, '12M': 600 }
};

@Component({
    selector: 'app-promo-settings',
    templateUrl: './promo-settings.component.html',
    styleUrls: ['./promo-settings.component.scss']
})
export class PromoSettingsComponent implements OnInit {
    // Icons
    faGift = faGift;
    faCheck = faCheck;
    faSpinner = faSpinner;
    faTimes = faTimes;
    faToggleOn = faToggleOn;
    faToggleOff = faToggleOff;
    faPercent = faPercent;
    faUsers = faUsers;
    faSave = faSave;
    faUndo = faUndo;
    faInfoCircle = faInfoCircle;
    faChartBar = faChartBar;

    // State
    isLoading = true;
    isSaving = false;
    config: PromotionConfig | null = null;

    // Form
    isActive = false;
    discountPercent = 50;
    maxUsers = 50;
    description = '';

    // Price preview
    tiers = ['STOCK', 'STOCK_WEBSITE'];
    plans = ['1M', '3M', '6M', '12M'];
    prices = SUBSCRIPTION_PRICES;

    constructor(private promoService: PromotionAdminService) { }

    ngOnInit(): void {
        this.loadConfig();
    }

    loadConfig() {
        this.isLoading = true;
        this.promoService.getConfig().subscribe(
            res => {
                this.config = res.config;
                this.isActive = res.config.isActive;
                this.discountPercent = res.config.discountPercent;
                this.maxUsers = res.config.maxUsers;
                this.description = res.config.description || '';
                this.isLoading = false;
            },
            error => {
                this.isLoading = false;
                console.error('Error loading promo config:', error);
            }
        );
    }

    toggleActive() {
        this.isActive = !this.isActive;
    }

    saveConfig() {
        if (this.discountPercent < 1 || this.discountPercent > 90) {
            Swal.fire({ icon: 'error', title: 'Erreur', text: 'Le pourcentage doit être entre 1 et 90', confirmButtonColor: '#3f51b5' });
            return;
        }
        if (this.maxUsers < 1) {
            Swal.fire({ icon: 'error', title: 'Erreur', text: 'Le nombre maximum doit être au moins 1', confirmButtonColor: '#3f51b5' });
            return;
        }

        this.isSaving = true;
        this.promoService.updateConfig({
            isActive: this.isActive,
            discountPercent: this.discountPercent,
            maxUsers: this.maxUsers,
            description: this.description
        }).subscribe(
            res => {
                this.isSaving = false;
                this.config = res.config;
                Swal.fire({
                    icon: 'success',
                    title: 'Configuration sauvegardée !',
                    text: res.message,
                    confirmButtonColor: '#3f51b5'
                });
            },
            error => {
                this.isSaving = false;
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur',
                    text: 'Impossible de sauvegarder la configuration.',
                    confirmButtonColor: '#3f51b5'
                });
            }
        );
    }

    resetCount() {
        Swal.fire({
            title: 'Réinitialiser le compteur ?',
            text: 'Le nombre d\'utilisateurs ayant bénéficié de la promotion sera remis à 0.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Réinitialiser',
            cancelButtonText: 'Annuler',
            confirmButtonColor: '#f44336'
        }).then(result => {
            if (result.isConfirmed) {
                this.promoService.resetCount().subscribe(
                    res => {
                        this.config = res.config;
                        Swal.fire({
                            icon: 'success',
                            title: 'Compteur réinitialisé',
                            confirmButtonColor: '#3f51b5'
                        });
                    },
                    error => {
                        Swal.fire({
                            icon: 'error',
                            title: 'Erreur',
                            text: 'Impossible de réinitialiser le compteur.',
                            confirmButtonColor: '#3f51b5'
                        });
                    }
                );
            }
        });
    }

    // Helpers
    getDiscountedPrice(tier: string, plan: string): number {
        const original = this.prices[tier]?.[plan] || 0;
        return Math.ceil(original * (1 - this.discountPercent / 100));
    }

    getProgressPercent(): number {
        if (!this.config || this.maxUsers === 0) return 0;
        return Math.min(100, Math.round((this.config.usedCount / this.maxUsers) * 100));
    }

    getTierLabel(tier: string): string {
        return tier === 'STOCK_WEBSITE' ? 'Stock + Boutique' : 'Gestion de Stock';
    }

    getPlanLabel(plan: string): string {
        const labels: { [key: string]: string } = { '1M': '1 Mois', '3M': '3 Mois', '6M': '6 Mois', '12M': '12 Mois' };
        return labels[plan] || plan;
    }
}
