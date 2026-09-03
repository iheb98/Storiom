import { Component, OnInit } from '@angular/core';
import {
    faUsers, faCheck, faSpinner, faClock, faTimes, faCheckCircle,
    faSearch, faEye, faUser, faCalendar, faStore, faCreditCard,
    faExclamationTriangle, faBan, faTrash, faToggleOn, faToggleOff,
    faPlus, faUserShield, faUserTie, faUserCog
} from '@fortawesome/free-solid-svg-icons';
import { UserAdminService, AdminUser } from 'src/app/core/services/user-admin.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-users-admin',
    templateUrl: './users-admin.component.html',
    styleUrls: ['./users-admin.component.scss']
})
export class UsersAdminComponent implements OnInit {
    // Icons
    faUsers = faUsers;
    faCheck = faCheck;
    faSpinner = faSpinner;
    faClock = faClock;
    faTimes = faTimes;
    faCheckCircle = faCheckCircle;
    faSearch = faSearch;
    faEye = faEye;
    faUser = faUser;
    faCalendar = faCalendar;
    faStore = faStore;
    faCreditCard = faCreditCard;
    faExclamationTriangle = faExclamationTriangle;
    faBan = faBan;
    faTrash = faTrash;
    faToggleOn = faToggleOn;
    faToggleOff = faToggleOff;
    faPlus = faPlus;
    faUserShield = faUserShield;
    faUserTie = faUserTie;
    faUserCog = faUserCog;

    // State
    isLoading = true;
    isProcessing = false;
    users: AdminUser[] = [];
    filteredUsers: AdminUser[] = [];
    selectedUser: AdminUser | null = null;

    // Filters
    activeFilter = '';
    searchQuery = '';

    // Stats
    totalCount = 0;
    activeCount = 0;
    withStoreCount = 0;
    expiredCount = 0;

    constructor(private userAdminService: UserAdminService) { }

    ngOnInit(): void {
        this.loadUsers();
    }

    loadUsers() {
        this.isLoading = true;
        this.userAdminService.getAllUsers().subscribe(
            res => {
                this.users = res.users;
                this.calculateStats();
                this.applyFilters();
                this.isLoading = false;
            },
            error => {
                this.isLoading = false;
                console.error('Error loading users:', error);
            }
        );
    }

    calculateStats() {
        this.totalCount = this.users.length;
        this.activeCount = this.users.filter(u => u.isConfirmed).length;
        this.withStoreCount = this.users.filter(u => !!u.store).length;
        this.expiredCount = this.users.filter(u => this.isSubscriptionExpired(u)).length;
    }

    applyFilters() {
        let filtered = [...this.users];

        if (this.activeFilter === 'active') {
            filtered = filtered.filter(u => u.isConfirmed);
        } else if (this.activeFilter === 'withStore') {
            filtered = filtered.filter(u => !!u.store);
        } else if (this.activeFilter === 'expired') {
            filtered = filtered.filter(u => this.isSubscriptionExpired(u));
        }

        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(u =>
                u.firstName?.toLowerCase().includes(query) ||
                u.lastName?.toLowerCase().includes(query) ||
                u.email?.toLowerCase().includes(query) ||
                u.store?.name?.toLowerCase().includes(query)
            );
        }

        this.filteredUsers = filtered;
    }

    filterBy(filter: string) {
        this.activeFilter = this.activeFilter === filter ? '' : filter;
        this.applyFilters();
    }

    onSearch() {
        this.applyFilters();
    }

    selectUser(user: AdminUser) {
        this.selectedUser = user;
    }

    closeDetails() {
        this.selectedUser = null;
    }

    // ========================================
    // Actions
    // ========================================

    toggleStatus(user: AdminUser) {
        const action = user.isConfirmed ? 'désactiver' : 'activer';
        Swal.fire({
            title: `${user.isConfirmed ? 'Désactiver' : 'Activer'} le compte ?`,
            html: `<p>Voulez-vous ${action} le compte de <strong>${user.firstName} ${user.lastName}</strong> ?</p>`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: user.isConfirmed ? 'Désactiver' : 'Activer',
            cancelButtonText: 'Annuler',
            confirmButtonColor: user.isConfirmed ? '#f44336' : '#4caf50',
        }).then((result) => {
            if (result.isConfirmed) {
                this.isProcessing = true;
                this.userAdminService.toggleUserStatus(user.id).subscribe(
                    res => {
                        this.isProcessing = false;
                        Swal.fire({
                            icon: 'success',
                            title: res.message,
                            confirmButtonColor: '#3f51b5'
                        });
                        this.loadUsers();
                        this.selectedUser = null;
                    },
                    error => {
                        this.isProcessing = false;
                        Swal.fire({
                            icon: 'error',
                            title: 'Erreur',
                            text: 'Impossible de modifier le statut.',
                            confirmButtonColor: '#3f51b5'
                        });
                    }
                );
            }
        });
    }

    extendSubscription(user: AdminUser) {
        Swal.fire({
            title: 'Prolonger l\'abonnement',
            html: `
                <p>Prolonger l'abonnement de <strong>${user.firstName} ${user.lastName}</strong></p>
                <div style="margin-top: 16px;">
                    <label style="display: block; margin-bottom: 8px; text-align: left;">Nombre de jours</label>
                    <input type="number" id="extensionDays" class="swal2-input" placeholder="Ex: 30" min="1" value="30">
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Prolonger',
            cancelButtonText: 'Annuler',
            confirmButtonColor: '#4caf50',
            preConfirm: () => {
                const days = parseInt((document.getElementById('extensionDays') as HTMLInputElement)?.value);
                if (!days || days < 1) {
                    Swal.showValidationMessage('Veuillez entrer un nombre de jours valide');
                    return false;
                }
                return days;
            }
        }).then((result) => {
            if (result.isConfirmed) {
                this.isProcessing = true;
                this.userAdminService.extendSubscription(user.id, result.value).subscribe(
                    res => {
                        this.isProcessing = false;
                        Swal.fire({
                            icon: 'success',
                            title: 'Abonnement prolongé !',
                            text: `Prolongé de ${result.value} jours.`,
                            confirmButtonColor: '#3f51b5'
                        });
                        this.loadUsers();
                        this.selectedUser = null;
                    },
                    error => {
                        this.isProcessing = false;
                        Swal.fire({
                            icon: 'error',
                            title: 'Erreur',
                            text: 'Impossible de prolonger l\'abonnement.',
                            confirmButtonColor: '#3f51b5'
                        });
                    }
                );
            }
        });
    }

    deleteUser(user: AdminUser) {
        Swal.fire({
            title: 'Supprimer l\'utilisateur ?',
            html: `
                <p>Êtes-vous sûr de vouloir supprimer <strong>${user.firstName} ${user.lastName}</strong> ?</p>
                <p style="color: #f44336; font-size: 0.9rem; margin-top: 8px;">⚠️ Cette action est irréversible. Toutes les données associées seront supprimées.</p>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Supprimer',
            cancelButtonText: 'Annuler',
            confirmButtonColor: '#f44336',
        }).then((result) => {
            if (result.isConfirmed) {
                this.isProcessing = true;
                this.userAdminService.deleteUser(user.id).subscribe(
                    res => {
                        this.isProcessing = false;
                        Swal.fire({
                            icon: 'success',
                            title: 'Utilisateur supprimé',
                            confirmButtonColor: '#3f51b5'
                        });
                        this.loadUsers();
                        this.selectedUser = null;
                    },
                    error => {
                        this.isProcessing = false;
                        Swal.fire({
                            icon: 'error',
                            title: 'Erreur',
                            text: error?.error?.message || 'Impossible de supprimer l\'utilisateur.',
                            confirmButtonColor: '#3f51b5'
                        });
                    }
                );
            }
        });
    }

    // ========================================
    // Helpers
    // ========================================

    isSubscriptionExpired(user: AdminUser): boolean {
        if (!user.subscription) return false;
        const { activationDate, expirationDate, duration } = user.subscription;

        let expDate = expirationDate ? new Date(expirationDate) : null;
        if (!expDate && activationDate) {
            const durationMapping: { [key: string]: number } = {
                'TRIAL': 30, '1M': 30, '3M': 90, '6M': 180, '12M': 365
            };
            expDate = new Date(activationDate);
            expDate.setDate(expDate.getDate() + (durationMapping[duration] || 0));
        }

        return expDate ? new Date() > expDate : false;
    }

    getSubscriptionStatus(user: AdminUser): string {
        if (!user.subscription) return 'none';
        if (user.subscription.duration === 'TRIAL') return 'trial';
        return this.isSubscriptionExpired(user) ? 'expired' : 'active';
    }

    getSubscriptionLabel(user: AdminUser): string {
        const status = this.getSubscriptionStatus(user);
        const labels: { [key: string]: string } = {
            'none': 'Aucun',
            'trial': 'Essai',
            'active': 'Actif',
            'expired': 'Expiré'
        };
        return labels[status] || status;
    }

    getSubscriptionStatusClass(user: AdminUser): string {
        const status = this.getSubscriptionStatus(user);
        const classes: { [key: string]: string } = {
            'none': 'sub-none',
            'trial': 'sub-trial',
            'active': 'sub-active',
            'expired': 'sub-expired'
        };
        return classes[status] || '';
    }

    getRoleLabel(role: string): string {
        const labels: { [key: string]: string } = {
            'Admin': 'Admin',
            'Owner': 'Propriétaire',
            'Customer': 'Client',
            'Worker': 'Travailleur',
            'SuperAdmin': 'Super Admin'
        };
        return labels[role] || role;
    }

    getRoleClass(role: string): string {
        const classes: { [key: string]: string } = {
            'Admin': 'role-admin',
            'Owner': 'role-owner',
            'Customer': 'role-customer',
            'Worker': 'role-worker',
            'SuperAdmin': 'role-superadmin'
        };
        return classes[role] || '';
    }

    getPlanLabel(plan: string): string {
        const labels: { [key: string]: string } = {
            'STOCK': 'Gestion de Stock',
            'STOCK_WEBSITE': 'Stock + Boutique'
        };
        return labels[plan] || plan || '—';
    }

    getDurationLabel(duration: string): string {
        const labels: { [key: string]: string } = {
            'TRIAL': 'Essai (30j)',
            '1M': '1 Mois',
            '3M': '3 Mois',
            '6M': '6 Mois',
            '12M': '12 Mois',
            'PERMANENT': 'Permanent'
        };
        return labels[duration] || duration || '—';
    }
}
