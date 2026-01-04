import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
    faClipboardList, faClock, faSpinner, faCheckCircle, faTimesCircle,
    faCog, faArrowLeft, faStore
} from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/core/services/auth.service';
import { ServiceRequestService } from 'src/app/core/services/service-request.service';

@Component({
    selector: 'app-my-service-requests',
    templateUrl: './my-service-requests.component.html',
    styleUrls: ['./my-service-requests.component.scss']
})
export class MyServiceRequestsComponent implements OnInit {
    // Icons
    faClipboardList = faClipboardList;
    faClock = faClock;
    faSpinner = faSpinner;
    faCheckCircle = faCheckCircle;
    faTimesCircle = faTimesCircle;
    faCog = faCog;
    faArrowLeft = faArrowLeft;
    faStore = faStore;

    // Data
    requests: any[] = [];
    activeFilter = '';

    // Loading
    isLoading = true;

    // Statuses
    statuses = [
        { value: 'PENDING', label: 'En attente', icon: faClock, color: 'pending' },
        { value: 'IN_PROGRESS', label: 'En cours', icon: faSpinner, color: 'in-progress' },
        { value: 'COMPLETED', label: 'Terminé', icon: faCheckCircle, color: 'completed' },
        { value: 'CANCELLED', label: 'Annulé', icon: faTimesCircle, color: 'cancelled' }
    ];

    constructor(
        private router: Router,
        private authService: AuthService,
        private serviceRequestService: ServiceRequestService
    ) { }

    ngOnInit(): void {
        if (!this.authService.isLoggedIn()) {
            this.router.navigate(['/login']);
            return;
        }
        this.loadRequests();
    }

    loadRequests() {
        this.isLoading = true;
        this.serviceRequestService.getMyRequests().subscribe(
            (requests) => {
                this.requests = requests;
                this.isLoading = false;
            },
            (error) => {
                console.error('Error loading requests:', error);
                this.isLoading = false;
            }
        );
    }

    get filteredRequests() {
        if (!this.activeFilter) return this.requests;
        return this.requests.filter(r => r.status === this.activeFilter);
    }

    filterByStatus(status: string) {
        this.activeFilter = status;
    }

    getStatusCount(status: string): number {
        return this.requests.filter(r => r.status === status).length;
    }

    getStatusInfo(status: string) {
        return this.statuses.find(s => s.value === status) || this.statuses[0];
    }

    goBack() {
        this.router.navigate(['/']);
    }
}
