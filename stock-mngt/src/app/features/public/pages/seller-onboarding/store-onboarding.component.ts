import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import {
    faStore, faArrowRight, faBoxOpen, faBolt, faChartLine,
    faBoxes, faShoppingCart, faChartBar, faTags, faFileInvoice, faRocket
} from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-seller-onboarding',
    templateUrl: './store-onboarding.component.html',
    styleUrls: ['./store-onboarding.component.scss']
})
export class SellerOnboardingComponent implements OnInit {

    // Icons
    faStore = faStore;
    faArrowRight = faArrowRight;
    faBoxOpen = faBoxOpen;
    faBolt = faBolt;
    faChartLine = faChartLine;
    faBoxes = faBoxes;
    faShoppingCart = faShoppingCart;
    faChartBar = faChartBar;
    faTags = faTags;
    faFileInvoice = faFileInvoice;
    faRocket = faRocket;

    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit(): void {
        // Check if the user already has a store
        const user = this.authService.getConnectedUser();
        if (user?.store) {
            // User already has a store, redirect to store view
            this.router.navigate(['/admin/stores/view']);
        }
    }

    createStore() {
        this.router.navigate(['/create-store']);
    }
}
