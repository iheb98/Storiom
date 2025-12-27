import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { Router } from '@angular/router';
import {
    faUser, faShoppingBag, faSignOutAlt, faCog, faChevronRight,
    faEnvelope, faPhone, faMapMarkerAlt, faCalendarAlt, faEdit
} from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-account',
    templateUrl: './account.component.html',
    styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {

    activeTab: 'profile' | 'orders' = 'profile';
    user: any;
    isLoading = true;

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

    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit(): void {
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

    switchTab(tab: 'profile' | 'orders') {
        this.activeTab = tab;
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
