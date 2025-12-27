import { Component, OnInit } from '@angular/core';
import { PublicService } from 'src/app/core/services/public.service';

import { environment } from 'src/environments/environment';
import { TUNISIA_LOCATIONS, getAllGovernorates, getCitiesForGovernorate, getAllCities } from 'src/app/shared/data/tunisia-locations';
import {
    faCity, faChevronDown, faTag, faGlobe, faTruck, faMapMarkerAlt,
    faFilter, faTimes, faStore, faSearch, faSlidersH, faMap
} from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-stores-list',
    templateUrl: './stores-list.component.html',
    styleUrls: ['./stores-list.component.scss']
})
export class StoresListComponent implements OnInit {

    // Icons
    faCity = faCity;
    faChevronDown = faChevronDown;
    faTag = faTag;
    faGlobe = faGlobe;
    faTruck = faTruck;
    faMapMarkerAlt = faMapMarkerAlt;
    faFilter = faFilter;
    faTimes = faTimes;
    faStore = faStore;
    faSearch = faSearch;
    faSlidersH = faSlidersH;
    faMap = faMap;

    stores: any[] = [];
    filteredStores: any[] = [];
    environment = environment;

    // Filter values
    searchText = '';
    selectedGovernorate = '';
    selectedCity = '';
    selectedType: string = '';
    hasWebsiteOnly: boolean = false;
    supportsDeliveryOnly: boolean = false;

    // Autocomplete search texts
    governorateSearchText = '';
    citySearchText = '';

    // Filter options
    availableGovernorates: string[] = [];
    availableCities: string[] = [];
    availableTypes: string[] = [];

    // Autocomplete filtered lists
    filteredGovernorates: string[] = [];
    filteredCities: string[] = [];

    // Autocomplete UI state
    showGovernorateSuggestions = false;
    showCitySuggestions = false;

    // UI state
    showFilters = false;
    activeFiltersCount = 0;
    isLoading = true;

    constructor(
        private publicService: PublicService,

    ) { }

    ngOnInit(): void {
        window.scrollTo(0, 0);
        // Initialize with all Tunisia governorates and cities
        this.availableGovernorates = getAllGovernorates();
        this.filteredGovernorates = [...this.availableGovernorates];
        this.availableCities = getAllCities();
        this.filteredCities = [...this.availableCities];
        this.getAllStores();
    }

    getAllStores() {
        this.isLoading = true;
        this.publicService.getAllStores().subscribe(res => {
            this.stores = res;
            this.filteredStores = res;
            this.extractAvailableTypes();
            this.isLoading = false;
        }, (err) => {
            console.error(err);
            this.isLoading = false;
        });
    }

    extractAvailableTypes() {
        const types = new Set<string>();
        this.stores.forEach(store => {
            if (store.type) types.add(store.type);
        });
        this.availableTypes = Array.from(types).sort();
    }

    // ========================================
    // Helper: Normalize text (remove accents)
    // ========================================
    normalizeText(text: string): string {
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
    }

    // ========================================
    // Governorate Autocomplete
    // ========================================
    onGovernorateSearch() {
        const searchTerm = this.normalizeText(this.governorateSearchText.trim());
        if (!searchTerm) {
            this.filteredGovernorates = [...this.availableGovernorates];
            this.selectedGovernorate = '';
            this.availableCities = getAllCities();
            this.filteredCities = [...this.availableCities];
            this.filterStores();
        } else {
            this.filteredGovernorates = this.availableGovernorates.filter(gov =>
                this.normalizeText(gov).includes(searchTerm)
            );
        }
        this.showGovernorateSuggestions = true;
    }

    selectGovernorate(gov: string) {
        this.selectedGovernorate = gov;
        this.governorateSearchText = gov;
        this.showGovernorateSuggestions = false;

        // Update cities for selected governorate
        this.availableCities = getCitiesForGovernorate(gov);
        this.filteredCities = [...this.availableCities];

        // Reset city selection
        this.selectedCity = '';
        this.citySearchText = '';

        this.filterStores();
    }

    toggleGovernorateSuggestions() {
        this.showGovernorateSuggestions = !this.showGovernorateSuggestions;
        if (this.showGovernorateSuggestions) {
            this.filteredGovernorates = [...this.availableGovernorates];
        }
    }

    hideGovernorateSuggestionsDelayed() {
        setTimeout(() => {
            this.showGovernorateSuggestions = false;
        }, 200);
    }

    // ========================================
    // City Autocomplete
    // ========================================
    onCitySearch() {
        const searchTerm = this.normalizeText(this.citySearchText.trim());
        if (!searchTerm) {
            this.filteredCities = [...this.availableCities];
            this.selectedCity = '';
            this.filterStores();
        } else {
            this.filteredCities = this.availableCities.filter(city =>
                this.normalizeText(city).includes(searchTerm)
            );
        }
        this.showCitySuggestions = true;
    }

    selectCity(city: string) {
        this.selectedCity = city;
        this.citySearchText = city;
        this.showCitySuggestions = false;
        this.filterStores();
    }

    toggleCitySuggestions() {
        this.showCitySuggestions = !this.showCitySuggestions;
        if (this.showCitySuggestions) {
            this.filteredCities = [...this.availableCities];
        }
    }

    hideCitySuggestionsDelayed() {
        setTimeout(() => {
            this.showCitySuggestions = false;
        }, 200);
    }

    // ========================================
    // Main Filter Logic
    // ========================================
    filterStores() {
        this.filteredStores = this.stores.filter(store => {
            // Name filter
            if (this.searchText) {
                const lower = this.searchText.toLowerCase();
                const nameMatch = store.name?.toLowerCase().includes(lower);
                const cityMatch = store.address?.city?.toLowerCase().includes(lower);
                const stateMatch = store.address?.state?.toLowerCase().includes(lower);
                if (!nameMatch && !cityMatch && !stateMatch) return false;
            }

            // Governorate/State filter
            if (this.selectedGovernorate && store.address?.state !== this.selectedGovernorate) {
                return false;
            }

            // City filter
            if (this.selectedCity && store.address?.city !== this.selectedCity) {
                return false;
            }

            // Type filter
            if (this.selectedType && store.type !== this.selectedType) {
                return false;
            }

            // Has website filter
            if (this.hasWebsiteOnly && !store.site) {
                return false;
            }

            // Supports delivery filter
            if (this.supportsDeliveryOnly && !store.isSupportingDeliveries) {
                return false;
            }

            return true;
        });

        this.updateActiveFiltersCount();
    }

    updateActiveFiltersCount() {
        let count = 0;
        if (this.searchText) count++;
        if (this.selectedGovernorate) count++;
        if (this.selectedCity) count++;
        if (this.selectedType) count++;
        if (this.hasWebsiteOnly) count++;
        if (this.supportsDeliveryOnly) count++;
        this.activeFiltersCount = count;
    }

    clearFilters() {
        this.searchText = '';
        this.selectedGovernorate = '';
        this.selectedCity = '';
        this.selectedType = '';
        this.hasWebsiteOnly = false;
        this.supportsDeliveryOnly = false;
        this.governorateSearchText = '';
        this.citySearchText = '';
        this.availableCities = getAllCities();
        this.filteredCities = [...this.availableCities];
        this.filteredGovernorates = [...this.availableGovernorates];
        this.filterStores();
    }

    toggleFilters() {
        this.showFilters = !this.showFilters;
    }
}
