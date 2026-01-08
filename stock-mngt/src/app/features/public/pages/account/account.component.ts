import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { Router } from '@angular/router';
import {
    faUser, faShoppingBag, faSignOutAlt, faCog, faChevronRight,
    faEnvelope, faPhone, faMapMarkerAlt, faCalendarAlt, faEdit,
    faClipboardList, faClock, faSpinner, faCheckCircle, faTimesCircle, faStore
} from '@fortawesome/free-solid-svg-icons';
import { ServiceRequestService } from 'src/app/core/services/service-request.service';

@Component({
    selector: 'app-account',
    templateUrl: './account.component.html',
    styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {

    activeTab: 'profile' | 'orders' | 'services' = 'profile';
    user: any;
    isLoading = true;

    // Service Requests
    serviceRequests: any[] = [];
    isLoadingRequests = false;

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
        private serviceRequestService: ServiceRequestService
    ) { }

    ngOnInit(): void {
        window.scrollTo(0, 0);
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

    switchTab(tab: 'profile' | 'orders' | 'services') {
        this.activeTab = tab;
        if (tab === 'services') {
            this.loadServiceRequests();
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
}

