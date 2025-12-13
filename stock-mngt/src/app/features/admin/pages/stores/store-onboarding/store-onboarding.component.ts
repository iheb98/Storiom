import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
    selector: 'app-store-onboarding',
    templateUrl: './store-onboarding.component.html',
    styleUrls: ['./store-onboarding.component.scss']
})
export class StoreOnboardingComponent implements OnInit {

    termsAccepted = false;

    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit(): void {
        console.log(this.authService.getConnectedUser())
        // Check if the user already has a store
        const user = this.authService.getConnectedUser();
        if (user?.store) {
            // User already has a store, redirect to store view
            this.router.navigate(['/admin/stores/view']);
        }
    }

    createStore() {
        if (this.termsAccepted) {
            this.router.navigate(['/admin/stores/add']);
        }
    }
}
