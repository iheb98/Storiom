import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
    faPlus, faCog, faEdit, faTrash, faSearch, faEllipsisV,
    faClock, faCheck, faTimes, faWrench, faWifi, faMobileAlt, faLaptop
} from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/core/services/auth.service';
import { StoreServiceService } from 'src/app/core/services/store-service.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-services-mngt',
    templateUrl: './services-mngt.component.html',
    styleUrls: ['./services-mngt.component.scss']
})
export class ServicesMngtComponent implements OnInit {
    // Icons
    faPlus = faPlus;
    faCog = faCog;
    faEdit = faEdit;
    faTrash = faTrash;
    faSearch = faSearch;
    faEllipsisV = faEllipsisV;
    faClock = faClock;
    faCheck = faCheck;
    faTimes = faTimes;
    faWrench = faWrench;
    faWifi = faWifi;
    faMobileAlt = faMobileAlt;
    faLaptop = faLaptop;

    // Data
    services: any[] = [];
    filteredServices: any[] = [];
    searchTerm = '';
    user: any;

    // Loading
    isLoading = true;

    // Categories for display
    categoryIcons: any = {
        'repair': faWrench,
        'internet': faWifi,
        'mobile': faMobileAlt,
        'computer': faLaptop,
        'general': faCog
    };

    constructor(
        private router: Router,
        private authService: AuthService,
        private storeServiceService: StoreServiceService
    ) { }

    ngOnInit(): void {
        window.scrollTo(0, 0);
        this.user = this.authService.getConnectedUser();
        this.loadServices();
    }

    loadServices() {
        this.isLoading = true;
        this.storeServiceService.getByStoreId(this.user?.store).subscribe(
            (response) => {
                this.services = response;
                this.filteredServices = response;
                this.isLoading = false;
            },
            (error) => {
                console.error('Error loading services:', error);
                this.isLoading = false;
            }
        );
    }

    filterServices() {
        if (!this.searchTerm.trim()) {
            this.filteredServices = this.services;
            return;
        }
        const term = this.searchTerm.toLowerCase();
        this.filteredServices = this.services.filter(service =>
            service.name?.toLowerCase().includes(term) ||
            service.description?.toLowerCase().includes(term) ||
            service.category?.toLowerCase().includes(term)
        );
    }

    addNew() {
        this.router.navigate(['/services/add']);
    }

    edit(id: number) {
        this.router.navigate(['/services/edit', id]);
    }

    toggleActive(service: any) {
        const newStatus = !service.isActive;
        this.storeServiceService.update(service.id, { isActive: newStatus }).subscribe(
            () => {
                service.isActive = newStatus;
                Swal.fire({
                    icon: 'success',
                    title: newStatus ? 'Service activé !' : 'Service désactivé !',
                    showConfirmButton: false,
                    timer: 1500
                });
            },
            (error) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur lors de la mise à jour',
                    showConfirmButton: false,
                    timer: 1500
                });
            }
        );
    }

    delete(service: any) {
        Swal.fire({
            title: 'Supprimer ce service ?',
            text: `"${service.name}" sera supprimé définitivement.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#c62828',
            cancelButtonColor: '#7f8c8d',
            confirmButtonText: 'Supprimer',
            cancelButtonText: 'Annuler'
        }).then((result) => {
            if (result.isConfirmed) {
                this.storeServiceService.delete(service.id).subscribe(
                    () => {
                        this.services = this.services.filter(s => s.id !== service.id);
                        this.filterServices();
                        Swal.fire({
                            icon: 'success',
                            title: 'Service supprimé !',
                            showConfirmButton: false,
                            timer: 1500
                        });
                    },
                    (error) => {
                        Swal.fire({
                            icon: 'error',
                            title: 'Erreur lors de la suppression',
                            showConfirmButton: false,
                            timer: 1500
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
}
