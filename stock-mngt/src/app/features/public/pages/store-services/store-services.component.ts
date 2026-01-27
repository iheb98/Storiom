import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
    faCog, faWrench, faWifi, faMobileAlt, faLaptop, faClock, faArrowLeft,
    faStore, faShoppingCart
} from '@fortawesome/free-solid-svg-icons';
import { StoreServiceService } from 'src/app/core/services/store-service.service';
import { ServiceRequestService } from 'src/app/core/services/service-request.service';
import { StoreService } from 'src/app/core/services/store.service';
import { AuthService } from 'src/app/core/services/auth.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-store-services',
    templateUrl: './store-services.component.html',
    styleUrls: ['./store-services.component.scss']
})
export class StoreServicesComponent implements OnInit {
    // Icons
    faCog = faCog;
    faWrench = faWrench;
    faWifi = faWifi;
    faMobileAlt = faMobileAlt;
    faLaptop = faLaptop;
    faClock = faClock;
    faArrowLeft = faArrowLeft;
    faStore = faStore;
    faShoppingCart = faShoppingCart;

    // Data
    services: any[] = [];
    store: any;
    storeId: number = 0;
    isLoggedIn = false;

    // Loading
    isLoading = true;
    isRequesting = false;

    // Categories
    categoryIcons: any = {
        'repair': faWrench,
        'internet': faWifi,
        'mobile': faMobileAlt,
        'computer': faLaptop,
        'general': faCog
    };

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private storeServiceService: StoreServiceService,
        private serviceRequestService: ServiceRequestService,
        private storeService: StoreService,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'auto' });
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
        }, 0);
        this.isLoggedIn = this.authService.isLoggedIn();
        this.storeId = Number(this.route.snapshot.paramMap.get('storeId'));
        this.loadStore();
        this.loadServices();
    }

    loadStore() {
        this.storeService.getStore(this.storeId).subscribe(
            (store) => {
                this.store = store;
            }
        );
    }

    loadServices() {
        this.isLoading = true;
        this.storeServiceService.getActiveByStoreId(this.storeId).subscribe(
            (services) => {
                this.services = services;
                this.isLoading = false;
            },
            (error) => {
                console.error('Error loading services:', error);
                this.isLoading = false;
            }
        );
    }

    requestService(service: any) {
        if (!this.isLoggedIn) {
            Swal.fire({
                html: `
                    <div style="text-align: center; padding: 10px;">
                        <div style="width: 70px; height: 70px; background: linear-gradient(135deg, #6366f1, #4f46e5); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; color: white;">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                                <circle cx="9" cy="7" r="4"/>
                                <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                            </svg>
                        </div>
                        <h2 style="font-size: 1.4rem; font-weight: 700; color: #0f172a; margin: 0 0 10px;">Connexion requise</h2>
                        <p style="color: #64748b; font-size: 0.95rem; margin: 0;">Veuillez vous connecter pour demander ce service.</p>
                    </div>
                `,
                showCancelButton: true,
                confirmButtonText: '🔐 Se connecter',
                cancelButtonText: 'Annuler',
                confirmButtonColor: '#6366f1',
                cancelButtonColor: '#e2e8f0'
            }).then((result) => {
                if (result.isConfirmed) {
                    this.router.navigate(['/login']);
                }
            });
            return;
        }

        const priceDisplay = service.isPriceVariable
            ? `<span style="font-size: 0.8rem; color: #f59e0b;">À partir de</span> ${service.price} DT`
            : `${service.price} DT`;

        Swal.fire({
            html: `
                <div class="request-popup">
                    <!-- Header -->
                    <div class="popup-header">
                        <div class="service-icon">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="3"/>
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                            </svg>
                        </div>
                        <h2>Demander ce service</h2>
                        <p>Confirmez votre demande de prestation</p>
                    </div>
                    
                    <!-- Service Info Card -->
                    <div class="service-card">
                        <div class="service-name">${service.name}</div>
                        <div class="service-price">${priceDisplay}</div>
                        ${service.estimatedDuration ? `<div class="service-duration">⏱️ ${service.estimatedDuration} heures</div>` : ''}
                    </div>
                    
                    <!-- Note Input -->
                    <div class="note-section">
                        <label>
                            <span class="label-icon">📝</span>
                            Note ou détails supplémentaires
                        </label>
                        <textarea id="customerNote" placeholder="Décrivez votre besoin, précisez des détails..."></textarea>
                    </div>
                </div>
                
                <style>
                    .request-popup {
                        text-align: left;
                        margin: -20px -20px 0;
                    }
                    .popup-header {
                        background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
                        padding: 30px 25px;
                        text-align: center;
                        position: relative;
                        overflow: hidden;
                    }
                    .popup-header::before {
                        content: '';
                        position: absolute;
                        width: 150px;
                        height: 150px;
                        background: rgba(255,255,255,0.1);
                        border-radius: 50%;
                        top: -60px;
                        right: -30px;
                    }
                    .popup-header::after {
                        content: '';
                        position: absolute;
                        width: 80px;
                        height: 80px;
                        background: rgba(255,255,255,0.08);
                        border-radius: 50%;
                        bottom: -20px;
                        left: 20px;
                    }
                    .service-icon {
                        width: 60px;
                        height: 60px;
                        background: rgba(255,255,255,0.2);
                        backdrop-filter: blur(10px);
                        border-radius: 16px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin: 0 auto 15px;
                        color: white;
                        position: relative;
                        z-index: 1;
                    }
                    .popup-header h2 {
                        color: white;
                        font-size: 1.4rem;
                        font-weight: 700;
                        margin: 0 0 5px;
                        position: relative;
                        z-index: 1;
                    }
                    .popup-header p {
                        color: rgba(255,255,255,0.8);
                        font-size: 0.9rem;
                        margin: 0;
                        position: relative;
                        z-index: 1;
                    }
                    .service-card {
                        background: linear-gradient(135deg, #f8fafc, #f1f5f9);
                        border: 2px solid #e2e8f0;
                        border-radius: 16px;
                        padding: 20px;
                        margin: 25px 25px 20px;
                        text-align: center;
                    }
                    .service-name {
                        font-size: 1.2rem;
                        font-weight: 700;
                        color: #1e293b;
                        margin-bottom: 8px;
                    }
                    .service-price {
                        font-size: 1.8rem;
                        font-weight: 800;
                        background: linear-gradient(135deg, #6366f1, #4f46e5);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                    }
                    .service-duration {
                        margin-top: 10px;
                        font-size: 0.9rem;
                        color: #64748b;
                    }
                    .note-section {
                        padding: 0 25px 25px;
                    }
                    .note-section label {
                        display: flex;
                        align-items: center;
                        gap: 6px;
                        font-size: 0.85rem;
                        font-weight: 600;
                        color: #334155;
                        margin-bottom: 10px;
                    }
                    .label-icon {
                        font-size: 1rem;
                    }
                    .note-section textarea {
                        width: 100%;
                        padding: 14px 16px;
                        border: 2px solid #e2e8f0;
                        border-radius: 12px;
                        font-size: 0.95rem;
                        color: #1e293b;
                        background: #f8fafc;
                        resize: vertical;
                        min-height: 80px;
                        font-family: inherit;
                        transition: all 0.2s;
                        box-sizing: border-box;
                    }
                    .note-section textarea:focus {
                        outline: none;
                        border-color: #6366f1;
                        background: white;
                        box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
                    }
                    .note-section textarea::placeholder {
                        color: #94a3b8;
                    }
                    @media (max-width: 480px) {
                        .popup-header {
                            padding: 25px 20px;
                        }
                        .service-card {
                            margin: 20px 15px 15px;
                            padding: 16px;
                        }
                        .note-section {
                            padding: 0 15px 20px;
                        }
                        .service-name {
                            font-size: 1.1rem;
                        }
                        .service-price {
                            font-size: 1.5rem;
                        }
                    }
                </style>
            `,
            showCancelButton: true,
            confirmButtonText: '✨ Confirmer la demande',
            cancelButtonText: 'Annuler',
            confirmButtonColor: '#6366f1',
            cancelButtonColor: '#e2e8f0',
            width: 480,
            padding: 0,
            preConfirm: () => {
                const noteEl = document.getElementById('customerNote') as HTMLTextAreaElement;
                return noteEl?.value || '';
            }
        }).then((result) => {
            if (result.isConfirmed) {
                this.isRequesting = true;
                this.serviceRequestService.create({
                    storeServiceId: service.id,
                    customerNote: result.value
                }).subscribe(
                    (response: any) => {
                        this.isRequesting = false;
                        Swal.fire({
                            html: `
                                <div style="text-align: center; padding: 10px;">
                                    <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; color: white; box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);">
                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                            <polyline points="20 6 9 17 4 12"/>
                                        </svg>
                                    </div>
                                    <h2 style="font-size: 1.4rem; font-weight: 700; color: #0f172a; margin: 0 0 8px;">Demande envoyée ! 🎉</h2>
                                    <p style="color: #64748b; font-size: 0.95rem; margin: 0 0 20px;">Votre demande a été transmise avec succès.</p>
                                    
                                    <div style="background: linear-gradient(135deg, #f8fafc, #f1f5f9); border: 2px solid #e2e8f0; border-radius: 16px; padding: 18px; margin-bottom: 15px;">
                                        <p style="margin: 0 0 8px; font-size: 0.8rem; font-weight: 600; color: #64748b;">🔑 Code de suivi</p>
                                        <code style="font-size: 1.6rem; font-weight: 800; letter-spacing: 3px; background: linear-gradient(135deg, #6366f1, #4f46e5); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-family: monospace;">${response.trackingCode}</code>
                                    </div>
                                    
                                    <p style="font-size: 0.8rem; color: #94a3b8; margin: 0;">💡 Conservez ce code pour suivre votre demande</p>
                                </div>
                            `,
                            showConfirmButton: true,
                            confirmButtonText: 'Compris !',
                            confirmButtonColor: '#6366f1'
                        });
                    },
                    (error) => {
                        this.isRequesting = false;
                        Swal.fire({
                            icon: 'error',
                            title: 'Erreur',
                            text: error.error?.message || 'Une erreur est survenue',
                            confirmButtonColor: '#6366f1'
                        });
                    }
                );
            }
        });
    }

    getCategoryIcon(category: string) {
        return this.categoryIcons[category] || this.faCog;
    }

    getCategoryLabel(category: string): string {
        const labels: any = {
            'repair': 'Réparation',
            'internet': 'Internet',
            'mobile': 'Mobile',
            'computer': 'Informatique',
            'general': 'Général'
        };
        return labels[category] || 'Général';
    }

    goBack() {
        this.router.navigate(['/store', this.storeId]);
    }
}
