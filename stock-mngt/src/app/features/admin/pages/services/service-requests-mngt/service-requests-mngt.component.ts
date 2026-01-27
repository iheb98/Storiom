import { Component, OnInit } from '@angular/core';
import {
    faClipboardList, faClock, faSpinner, faCheckCircle, faTimesCircle,
    faUser, faPhone, faEnvelope, faCalendar, faEdit, faCog, faPlus,
    faUserSlash, faKey, faCopy, faStore, faTimes, faWrench
} from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/core/services/auth.service';
import { ServiceRequestService } from 'src/app/core/services/service-request.service';
import { StoreServiceService } from 'src/app/core/services/store-service.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-service-requests-mngt',
    templateUrl: './service-requests-mngt.component.html',
    styleUrls: ['./service-requests-mngt.component.scss']
})
export class ServiceRequestsMngtComponent implements OnInit {
    // Icons
    faClipboardList = faClipboardList;
    faClock = faClock;
    faSpinner = faSpinner;
    faCheckCircle = faCheckCircle;
    faTimesCircle = faTimesCircle;
    faUser = faUser;
    faPhone = faPhone;
    faEnvelope = faEnvelope;
    faCalendar = faCalendar;
    faEdit = faEdit;
    faCog = faCog;
    faPlus = faPlus;
    faUserSlash = faUserSlash;
    faKey = faKey;
    faCopy = faCopy;
    faStore = faStore;
    faTimes = faTimes;
    faWrench = faWrench;

    // Data
    requests: any[] = [];
    filteredRequests: any[] = [];
    activeFilter = 'ACTIVE'; // Default to show pending and in-progress
    user: any;
    services: any[] = [];

    // Loading
    isLoading = true;
    isUpdating = false;

    // Modal State
    showGuestModal = false;
    isSubmitting = false;
    guestForm = {
        serviceId: '',
        guestName: '',
        guestPhone: '',
        guestEmail: '',
        customerNote: ''
    };
    formErrors = {
        serviceId: '',
        guestPhone: ''
    };
    createdRequest: any = null;
    showSuccessState = false;

    // Statuses
    statuses = [
        { value: 'PENDING', label: 'En attente', icon: faClock, color: 'pending' },
        { value: 'IN_PROGRESS', label: 'En cours', icon: faSpinner, color: 'in-progress' },
        { value: 'COMPLETED', label: 'Terminé', icon: faCheckCircle, color: 'completed' },
        { value: 'CANCELLED', label: 'Annulé', icon: faTimesCircle, color: 'cancelled' }
    ];

    constructor(
        private authService: AuthService,
        private serviceRequestService: ServiceRequestService,
        private storeServiceService: StoreServiceService
    ) { }

    ngOnInit(): void {
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'auto' });
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
        }, 0);
        this.user = this.authService.getConnectedUser();
        this.loadRequests();
        this.loadServices();
    }

    loadRequests() {
        this.isLoading = true;
        this.serviceRequestService.getByStoreId(this.user?.store).subscribe(
            (response) => {
                this.requests = response;
                this.applyFilter();
                this.isLoading = false;
            },
            (error) => {
                console.error('Error loading requests:', error);
                this.isLoading = false;
            }
        );
    }

    loadServices() {
        this.storeServiceService.getByStoreId(this.user?.store).subscribe(
            (services) => {
                this.services = services.filter((s: any) => s.isActive);
            }
        );
    }

    filterByStatus(status: string) {
        this.activeFilter = status;
        this.applyFilter();
    }

    applyFilter() {
        if (this.activeFilter === 'ACTIVE') {
            // Show only PENDING and IN_PROGRESS
            this.filteredRequests = this.requests.filter(r =>
                r.status === 'PENDING' || r.status === 'IN_PROGRESS'
            );
        } else if (this.activeFilter) {
            this.filteredRequests = this.requests.filter(r => r.status === this.activeFilter);
        } else {
            this.filteredRequests = [...this.requests];
        }
    }

    getStatusCount(status: string): number {
        return this.requests.filter(r => r.status === status).length;
    }

    getStatusInfo(status: string) {
        return this.statuses.find(s => s.value === status) || this.statuses[0];
    }

    // Create guest request - Open Modal
    createGuestRequest() {
        this.resetForm();
        this.showGuestModal = true;
        this.showSuccessState = false;
        this.createdRequest = null;
    }

    closeGuestModal() {
        this.showGuestModal = false;
        this.resetForm();
    }

    resetForm() {
        this.guestForm = {
            serviceId: '',
            guestName: '',
            guestPhone: '',
            guestEmail: '',
            customerNote: ''
        };
        this.formErrors = {
            serviceId: '',
            guestPhone: ''
        };
        this.isSubmitting = false;
    }

    validateForm(): boolean {
        let isValid = true;
        this.formErrors = { serviceId: '', guestPhone: '' };

        if (!this.guestForm.serviceId) {
            this.formErrors.serviceId = 'Veuillez sélectionner un service';
            isValid = false;
        }

        if (!this.guestForm.guestPhone) {
            this.formErrors.guestPhone = 'Le numéro de téléphone est requis';
            isValid = false;
        }

        return isValid;
    }

    submitGuestRequest() {
        if (!this.validateForm()) return;

        this.isSubmitting = true;

        this.serviceRequestService.createGuest({
            storeServiceId: parseInt(this.guestForm.serviceId),
            storeId: this.user?.store,
            guestName: this.guestForm.guestName,
            guestPhone: this.guestForm.guestPhone,
            guestEmail: this.guestForm.guestEmail,
            customerNote: this.guestForm.customerNote
        }).subscribe(
            (response) => {
                this.isSubmitting = false;
                this.createdRequest = response;
                this.showSuccessState = true;
                this.loadRequests();
            },
            (error) => {
                this.isSubmitting = false;
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur',
                    text: error.error?.message || 'Une erreur est survenue',
                    confirmButtonColor: '#6366f1'
                });
            }
        );
    }

    copyTrackingCode() {
        if (this.createdRequest?.trackingCode) {
            navigator.clipboard.writeText(this.createdRequest.trackingCode);
        }
    }

    getSelectedService() {
        return this.services.find(s => s.id == this.guestForm.serviceId);
    }

    showTrackingCode(request: any) {
        Swal.fire({
            html: `
                <div class="tracking-popup">
                    <div class="popup-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
                        </svg>
                    </div>
                    <h2>Code de suivi</h2>
                    <p class="client-name">
                        <span class="client-icon">👤</span>
                        ${request.guestName || request.guestPhone}
                    </p>
                    
                    <div class="code-display">
                        <div class="code-value">${request.trackingCode}</div>
                    </div>
                    
                    <button id="copyCodeBtn2" class="copy-btn-large">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                        </svg>
                        Copier le code
                    </button>
                </div>
                
                <style>
                    .tracking-popup {
                        text-align: center;
                        padding: 10px 0;
                    }
                    .popup-icon {
                        width: 70px;
                        height: 70px;
                        background: linear-gradient(135deg, #6366f1, #4f46e5);
                        border-radius: 20px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin: 0 auto 20px;
                        color: white;
                        box-shadow: 0 10px 30px rgba(99, 102, 241, 0.3);
                    }
                    .tracking-popup h2 {
                        font-size: 1.4rem;
                        font-weight: 700;
                        color: #0f172a;
                        margin: 0 0 10px;
                    }
                    .client-name {
                        display: inline-flex;
                        align-items: center;
                        gap: 6px;
                        background: #f1f5f9;
                        padding: 8px 16px;
                        border-radius: 20px;
                        font-size: 0.9rem;
                        color: #64748b;
                        margin: 0 0 25px;
                    }
                    .client-icon {
                        font-size: 1rem;
                    }
                    .code-display {
                        background: linear-gradient(135deg, #f8fafc, #f1f5f9);
                        border: 2px solid #e2e8f0;
                        border-radius: 16px;
                        padding: 25px;
                        margin-bottom: 20px;
                    }
                    .code-value {
                        font-size: 2.5rem;
                        font-weight: 800;
                        letter-spacing: 5px;
                        background: linear-gradient(135deg, #6366f1, #4f46e5);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
                    }
                    .copy-btn-large {
                        display: inline-flex;
                        align-items: center;
                        gap: 10px;
                        padding: 14px 32px;
                        background: linear-gradient(135deg, #6366f1, #4f46e5);
                        border: none;
                        border-radius: 12px;
                        color: white;
                        font-size: 1rem;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.2s;
                        box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
                    }
                    .copy-btn-large:hover {
                        transform: translateY(-3px);
                        box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
                    }
                </style>
            `,
            showConfirmButton: false,
            showCloseButton: true,
            width: 400,
            didOpen: () => {
                const copyBtn = document.getElementById('copyCodeBtn2');
                copyBtn?.addEventListener('click', () => {
                    navigator.clipboard.writeText(request.trackingCode);
                    if (copyBtn) {
                        copyBtn.innerHTML = `
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="20 6 9 17 4 12"/>
                            </svg>
                            Copié !
                        `;
                        copyBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                    }
                });
            }
        });
    }


    updateStatus(request: any, newStatus: string) {
        const statusInfo = this.getStatusInfo(newStatus);

        // If changing to COMPLETED, ask for the final price
        if (newStatus === 'COMPLETED') {
            const defaultPrice = request.service?.price || request.price || '';

            Swal.fire({
                html: `
                    <div class="complete-popup">
                        <div class="popup-header">
                            <div class="success-icon">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                    <polyline points="20 6 9 17 4 12"/>
                                </svg>
                            </div>
                            <h2>Terminer la demande</h2>
                            <p>Entrez le prix final du service</p>
                        </div>
                        
                        <div class="popup-body">
                            <div class="service-info">
                                <span class="service-name">${request.service?.name || 'Service'}</span>
                                ${request.service?.isPriceVariable ? '<span class="variable-badge">Prix variable</span>' : ''}
                            </div>
                            
                            <div class="price-input-group">
                                <label>
                                    <span class="label-icon">💰</span>
                                    Prix final <span class="required">*</span>
                                </label>
                                <div class="input-wrapper">
                                    <input type="number" id="finalPrice" value="${defaultPrice}" placeholder="0.00" step="0.01" min="0">
                                    <span class="currency">DT</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <style>
                        .complete-popup {
                            text-align: left;
                            margin: -20px -20px 0;
                        }
                        .popup-header {
                            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                            padding: 30px 25px;
                            text-align: center;
                            position: relative;
                            overflow: hidden;
                        }
                        .popup-header::before {
                            content: '';
                            position: absolute;
                            width: 120px;
                            height: 120px;
                            background: rgba(255,255,255,0.1);
                            border-radius: 50%;
                            top: -50px;
                            right: -20px;
                        }
                        .success-icon {
                            width: 60px;
                            height: 60px;
                            background: rgba(255,255,255,0.2);
                            backdrop-filter: blur(10px);
                            border-radius: 50%;
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
                            margin: 0 0 6px;
                            position: relative;
                            z-index: 1;
                        }
                        .popup-header p {
                            color: rgba(255,255,255,0.85);
                            font-size: 0.9rem;
                            margin: 0;
                            position: relative;
                            z-index: 1;
                        }
                        .popup-body {
                            padding: 25px;
                        }
                        .service-info {
                            display: flex;
                            align-items: center;
                            gap: 10px;
                            padding: 15px;
                            background: #f8fafc;
                            border-radius: 12px;
                            margin-bottom: 20px;
                        }
                        .service-name {
                            font-weight: 600;
                            color: #1e293b;
                            font-size: 1rem;
                        }
                        .variable-badge {
                            font-size: 0.75rem;
                            padding: 4px 10px;
                            background: linear-gradient(135deg, #f59e0b, #d97706);
                            color: white;
                            border-radius: 20px;
                            font-weight: 600;
                        }
                        .price-input-group {
                            margin-bottom: 0;
                        }
                        .price-input-group label {
                            display: flex;
                            align-items: center;
                            gap: 6px;
                            font-size: 0.9rem;
                            font-weight: 600;
                            color: #334155;
                            margin-bottom: 10px;
                        }
                        .label-icon {
                            font-size: 1.1rem;
                        }
                        .required {
                            color: #ef4444;
                        }
                        .input-wrapper {
                            position: relative;
                            display: flex;
                            align-items: center;
                        }
                        .input-wrapper input {
                            width: 100%;
                            padding: 16px 60px 16px 20px;
                            border: 2px solid #e2e8f0;
                            border-radius: 12px;
                            font-size: 1.5rem;
                            font-weight: 700;
                            color: #1e293b;
                            background: #f8fafc;
                            transition: all 0.2s;
                        }
                        .input-wrapper input:focus {
                            outline: none;
                            border-color: #10b981;
                            background: white;
                            box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
                        }
                        .input-wrapper input::placeholder {
                            color: #94a3b8;
                        }
                        .currency {
                            position: absolute;
                            right: 20px;
                            font-size: 1.1rem;
                            font-weight: 700;
                            color: #10b981;
                        }
                    </style>
                `,
                showCancelButton: true,
                confirmButtonText: '✅ Terminer',
                cancelButtonText: 'Annuler',
                confirmButtonColor: '#10b981',
                cancelButtonColor: '#e2e8f0',
                width: 420,
                padding: 0,
                preConfirm: () => {
                    const priceInput = document.getElementById('finalPrice') as HTMLInputElement;
                    const price = parseFloat(priceInput.value);

                    if (isNaN(price) || price < 0) {
                        Swal.showValidationMessage('⚠️ Veuillez entrer un prix valide');
                        return false;
                    }

                    return { price };
                }
            }).then((result) => {
                if (result.isConfirmed && result.value) {
                    this.isUpdating = true;
                    this.serviceRequestService.updateStatus(request.id, newStatus, result.value.price).subscribe(
                        (res) => {
                            request.status = newStatus;
                            request.price = result.value.price;
                            request.completedAt = new Date();
                            this.applyFilter();
                            this.isUpdating = false;
                            Swal.fire({
                                icon: 'success',
                                title: 'Demande terminée !',
                                text: `Prix final: ${result.value.price} DT`,
                                showConfirmButton: false,
                                timer: 2000
                            });
                        },
                        (error) => {
                            this.isUpdating = false;
                            Swal.fire({
                                icon: 'error',
                                title: 'Erreur lors de la mise à jour',
                                showConfirmButton: false,
                                timer: 1500
                            });
                        }
                    );
                }
            });
        } else {
            // For other statuses, use the simple confirmation
            Swal.fire({
                title: 'Changer le statut ?',
                text: `Marquer cette demande comme "${statusInfo.label}" ?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Confirmer',
                cancelButtonText: 'Annuler',
                confirmButtonColor: this.getStatusColor(newStatus)
            }).then((result) => {
                if (result.isConfirmed) {
                    this.isUpdating = true;
                    this.serviceRequestService.updateStatus(request.id, newStatus).subscribe(
                        (res) => {
                            request.status = newStatus;
                            if (newStatus === 'IN_PROGRESS') request.startedAt = new Date();
                            this.applyFilter();
                            this.isUpdating = false;
                            Swal.fire({
                                icon: 'success',
                                title: 'Statut mis à jour !',
                                showConfirmButton: false,
                                timer: 1500
                            });
                        },
                        (error) => {
                            this.isUpdating = false;
                            Swal.fire({
                                icon: 'error',
                                title: 'Erreur lors de la mise à jour',
                                showConfirmButton: false,
                                timer: 1500
                            });
                        }
                    );
                }
            });
        }
    }

    getStatusColor(status: string): string {
        switch (status) {
            case 'PENDING': return '#f57c00';
            case 'IN_PROGRESS': return '#0288d1';
            case 'COMPLETED': return '#2e7d32';
            case 'CANCELLED': return '#c62828';
            default: return '#3f51b5';
        }
    }

    addNote(request: any) {
        Swal.fire({
            title: 'Ajouter une note',
            input: 'textarea',
            inputValue: request.adminNote || '',
            inputPlaceholder: 'Note pour cette demande...',
            showCancelButton: true,
            confirmButtonText: 'Enregistrer',
            cancelButtonText: 'Annuler'
        }).then((result) => {
            if (result.isConfirmed) {
                this.serviceRequestService.update(request.id, { adminNote: result.value }).subscribe(
                    () => {
                        request.adminNote = result.value;
                        Swal.fire({
                            icon: 'success',
                            title: 'Note enregistrée !',
                            showConfirmButton: false,
                            timer: 1500
                        });
                    }
                );
            }
        });
    }

    // Check if request is a guest request
    isGuestRequest(request: any): boolean {
        return !request.user && request.guestPhone;
    }
}

