import { Component, OnInit } from '@angular/core';
import { faSearch, faWrench, faStore, faClock, faTag, faSpinner, faClipboardList, faArrowRight, faMapMarkerAlt, faTimes } from '@fortawesome/free-solid-svg-icons';
import { StoreServiceService } from 'src/app/core/services/store-service.service';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { getAllGovernorates, getCitiesForGovernorate } from 'src/app/shared/data/tunisia-locations';

@Component({
    selector: 'app-all-services',
    templateUrl: './all-services.component.html',
    styleUrls: ['./all-services.component.scss']
})
export class AllServicesComponent implements OnInit {
    // Icons
    faSearch = faSearch;
    faWrench = faWrench;
    faStore = faStore;
    faClock = faClock;
    faTag = faTag;
    faSpinner = faSpinner;
    faClipboardList = faClipboardList;
    faArrowRight = faArrowRight;
    faMapMarkerAlt = faMapMarkerAlt;
    faTimes = faTimes;

    // Data
    services: any[] = [];
    filteredServices: any[] = [];
    searchText = '';
    isLoading = true;
    backend_URL = environment.backend;

    // Location filters
    governorates: string[] = [];
    cities: string[] = [];
    selectedGovernorate: string | null = null;
    selectedCity: string | null = null;

    // Category translations to French
    categoryTranslations: { [key: string]: string } = {
        'REPAIR': 'Réparation',
        'MAINTENANCE': 'Entretien',
        'INSTALLATION': 'Installation',
        'CLEANING': 'Nettoyage',
        'CONSULTING': 'Consultation',
        'DELIVERY': 'Livraison',
        'TRANSPORT': 'Transport',
        'BEAUTY': 'Beauté',
        'HEALTH': 'Santé',
        'EDUCATION': 'Éducation',
        'OTHER': 'Autre'
    };

    constructor(
        private storeServiceService: StoreServiceService,
        private router: Router
    ) { }

    ngOnInit(): void {
        window.scrollTo(0, 0);
        this.governorates = getAllGovernorates();
        this.loadServices();
    }

    loadServices() {
        this.isLoading = true;
        this.storeServiceService.getAllPublic(this.searchText || undefined).subscribe(
            (services) => {
                this.services = services;
                this.applyFilters();
                this.isLoading = false;
            },
            (error) => {
                console.error('Error loading services:', error);
                this.isLoading = false;
            }
        );
    }

    applyFilters() {
        let filtered = [...this.services];

        // Filter by governorate
        if (this.selectedGovernorate) {
            filtered = filtered.filter(s =>
                s.store?.address?.state === this.selectedGovernorate
            );
        }

        // Filter by city
        if (this.selectedCity) {
            filtered = filtered.filter(s =>
                s.store?.address?.city === this.selectedCity
            );
        }

        this.filteredServices = filtered;
    }

    onGovernorateChange() {
        if (this.selectedGovernorate) {
            this.cities = getCitiesForGovernorate(this.selectedGovernorate);
        } else {
            this.cities = [];
        }
        this.selectedCity = null;
        this.applyFilters();
    }

    onCityChange() {
        this.applyFilters();
    }

    clearLocationFilter() {
        this.selectedGovernorate = null;
        this.selectedCity = null;
        this.cities = [];
        this.applyFilters();
    }

    hasLocationFilter(): boolean {
        return !!(this.selectedGovernorate || this.selectedCity);
    }

    onSearch() {
        this.loadServices();
    }

    clearSearch() {
        this.searchText = '';
        this.loadServices();
    }

    goToStore(storeId: number) {
        this.router.navigate(['/stores', storeId]);
    }

    getServiceImage(service: any): string {
        if (service.image) {
            return this.backend_URL + '/' + service.image;
        }
        return 'assets/service-placeholder.png';
    }

    getStoreImage(store: any): string {
        if (store?.logo) {
            return this.backend_URL + '/' + store.logo;
        }
        return 'assets/default_store.png';
    }

    translateCategory(category: string): string {
        if (!category) return '';
        return this.categoryTranslations[category.toUpperCase()] || category;
    }
}
