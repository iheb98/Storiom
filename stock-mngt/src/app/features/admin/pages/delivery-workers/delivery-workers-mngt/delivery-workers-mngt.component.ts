import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
    faPlus, faTruck, faEdit, faTrash, faPhone, faEnvelope,
    faMapMarkerAlt, faSearch, faEllipsisV
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { AuthService } from 'src/app/core/services/auth.service';
import { DeliveryWorkerService } from 'src/app/core/services/delivery-worker.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-delivery-workers-mngt',
    templateUrl: './delivery-workers-mngt.component.html',
    styleUrls: ['./delivery-workers-mngt.component.scss']
})
export class DeliveryWorkersMngtComponent implements OnInit {
    // Icons
    faPlus = faPlus;
    faTruck = faTruck;
    faEdit = faEdit;
    faTrash = faTrash;
    faPhone = faPhone;
    faEnvelope = faEnvelope;
    faMapMarkerAlt = faMapMarkerAlt;
    faWhatsapp = faWhatsapp;
    faSearch = faSearch;
    faEllipsisV = faEllipsisV;

    // Data
    deliveryWorkers: any[] = [];
    filteredWorkers: any[] = [];
    searchTerm = '';
    user: any;

    // Loading
    isLoading = true;

    constructor(
        private router: Router,
        private authService: AuthService,
        private deliveryWorkerService: DeliveryWorkerService
    ) { }

    ngOnInit(): void {
        this.user = this.authService.getConnectedUser();
        this.loadDeliveryWorkers();
    }

    loadDeliveryWorkers() {
        this.isLoading = true;
        this.deliveryWorkerService.getByStoreId(this.user?.store).subscribe(
            (response) => {
                this.deliveryWorkers = response;
                this.filteredWorkers = response;
                this.isLoading = false;
            },
            (error) => {
                console.error('Error loading delivery workers:', error);
                this.isLoading = false;
            }
        );
    }

    filterWorkers() {
        if (!this.searchTerm.trim()) {
            this.filteredWorkers = this.deliveryWorkers;
            return;
        }
        const term = this.searchTerm.toLowerCase();
        this.filteredWorkers = this.deliveryWorkers.filter(worker =>
            worker.firstName?.toLowerCase().includes(term) ||
            worker.lastName?.toLowerCase().includes(term) ||
            worker.phone?.includes(term) ||
            worker.email?.toLowerCase().includes(term)
        );
    }

    addNew() {
        this.router.navigate(['/delivery-workers/add']);
    }

    edit(id: number) {
        this.router.navigate(['/delivery-workers/edit', id]);
    }

    delete(worker: any) {
        Swal.fire({
            title: 'Supprimer ce livreur ?',
            text: `${worker.firstName} ${worker.lastName} sera supprimé définitivement.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#c62828',
            cancelButtonColor: '#7f8c8d',
            confirmButtonText: 'Supprimer',
            cancelButtonText: 'Annuler'
        }).then((result) => {
            if (result.isConfirmed) {
                this.deliveryWorkerService.delete(worker.id).subscribe(
                    () => {
                        this.deliveryWorkers = this.deliveryWorkers.filter(w => w.id !== worker.id);
                        this.filterWorkers();
                        Swal.fire({
                            icon: 'success',
                            title: 'Livreur supprimé !',
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

    getInitials(firstName: string, lastName: string): string {
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
    }

    getStatesCount(states: string[]): number {
        return states?.length || 0;
    }
}
