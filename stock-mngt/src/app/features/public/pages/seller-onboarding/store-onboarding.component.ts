import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
    selector: 'app-seller-onboarding',
    templateUrl: './store-onboarding.component.html',
    styleUrls: ['./store-onboarding.component.scss']
})
export class SellerOnboardingComponent implements OnInit {

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

