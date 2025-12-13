import { Component, OnInit } from '@angular/core';
import { PublicService } from 'src/app/core/services/public.service';
import { LoadingService } from 'src/app/core/services/loading.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-stores-list',
    templateUrl: './stores-list.component.html',
    styleUrls: ['./stores-list.component.scss']
})
export class StoresListComponent implements OnInit {

    stores: any[] = [];
    filteredStores: any[] = [];
    environment = environment;
    searchText = '';

    constructor(
        private publicService: PublicService,
        private loadingService: LoadingService
    ) { }

    ngOnInit(): void {
        this.getAllStores();
    }

    getAllStores() {
        this.loadingService.screenLoading();
        this.publicService.getAllStores().subscribe(res => {
            this.stores = res;
            this.filteredStores = res;
            this.loadingService.screenLoaded();
        }, (err) => {
            console.error(err);
            this.loadingService.screenLoaded();
        });
    }

    filterStores() {
        if (!this.searchText) {
            this.filteredStores = this.stores;
            return;
        }
        const lower = this.searchText.toLowerCase();
        this.filteredStores = this.stores.filter(store =>
            store.name.toLowerCase().includes(lower) ||
            (store.address && store.address.city && store.address.city.toLowerCase().includes(lower))
        );
    }
}
