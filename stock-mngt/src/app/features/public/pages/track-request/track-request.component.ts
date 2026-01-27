import { Component, OnInit } from '@angular/core';
import {
    faSearch, faPhone, faKey, faClipboardList, faClock, faSpinner,
    faCheckCircle, faTimesCircle, faStore, faCalendar
} from '@fortawesome/free-solid-svg-icons';
import { ServiceRequestService } from 'src/app/core/services/service-request.service';

@Component({
    selector: 'app-track-request',
    templateUrl: './track-request.component.html',
    styleUrls: ['./track-request.component.scss']
})
export class TrackRequestComponent implements OnInit {
    // Icons
    faSearch = faSearch;
    faPhone = faPhone;
    faKey = faKey;
    faClipboardList = faClipboardList;
    faClock = faClock;
    faSpinner = faSpinner;
    faCheckCircle = faCheckCircle;
    faTimesCircle = faTimesCircle;
    faStore = faStore;
    faCalendar = faCalendar;

    // Form values
    phone = '';
    code = '';

    // State
    isSearching = false;
    hasSearched = false;
    requests: any[] = [];
    errorMessage = '';

    // Status config
    statuses = [
        { value: 'PENDING', label: 'En attente', icon: faClock, color: 'pending' },
        { value: 'IN_PROGRESS', label: 'En cours', icon: faSpinner, color: 'in-progress' },
        { value: 'COMPLETED', label: 'Terminé', icon: faCheckCircle, color: 'completed' },
        { value: 'CANCELLED', label: 'Annulé', icon: faTimesCircle, color: 'cancelled' }
    ];

    constructor(private serviceRequestService: ServiceRequestService) { }

    ngOnInit(): void {
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'auto' });
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
        }, 0);
    }

    search() {
        if (!this.phone || !this.code) {
            this.errorMessage = 'Veuillez remplir tous les champs';
            return;
        }

        this.isSearching = true;
        this.errorMessage = '';
        this.hasSearched = false;

        this.serviceRequestService.lookup(this.phone, this.code).subscribe({
            next: (requests) => {
                this.requests = requests;
                this.hasSearched = true;
                this.isSearching = false;
            },
            error: (err) => {
                this.errorMessage = err.error?.message || 'Aucune demande trouvée avec ces informations';
                this.hasSearched = true;
                this.requests = [];
                this.isSearching = false;
            }
        });
    }

    getStatusInfo(status: string) {
        return this.statuses.find(s => s.value === status) || this.statuses[0];
    }

    clearSearch() {
        this.phone = '';
        this.code = '';
        this.requests = [];
        this.hasSearched = false;
        this.errorMessage = '';
    }
}
