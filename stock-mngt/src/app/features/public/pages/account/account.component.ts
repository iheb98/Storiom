import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';

import { Router } from '@angular/router';

@Component({
    selector: 'app-account',
    templateUrl: './account.component.html',
    styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {

    activeTab: 'profile' | 'orders' = 'profile';
    user: any;
    isLoading = true;

    constructor(
        private authService: AuthService,

        private router: Router
    ) { }

    ngOnInit(): void {
        this.loadUserProfile();
    }

    loadUserProfile() {
        const connectedUser = this.authService.getConnectedUser();
        if (connectedUser && connectedUser.id) {

            this.authService.getUser(connectedUser.id).subscribe({
                next: (res) => {
                    this.user = res;

                    this.isLoading = false;
                },
                error: (err) => {
                    console.error(err);

                    this.isLoading = false;
                }
            });
        } else {
            this.router.navigate(['/login']);
        }
    }

    switchTab(tab: 'profile' | 'orders') {
        this.activeTab = tab;
    }

    logout() {
        this.authService.logout().subscribe(() => {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            this.router.navigate(['/']);
        });
    }
}
