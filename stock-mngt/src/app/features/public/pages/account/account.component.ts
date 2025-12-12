import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { LoadingService } from 'src/app/core/services/loading.service';
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
        private loadingService: LoadingService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.loadUserProfile();
    }

    loadUserProfile() {
        const connectedUser = this.authService.getConnectedUser();
        if (connectedUser && connectedUser.id) {
            this.loadingService.screenLoading();
            this.authService.getUser(connectedUser.id).subscribe({
                next: (res) => {
                    this.user = res;
                    this.loadingService.screenLoaded();
                    this.isLoading = false;
                },
                error: (err) => {
                    console.error(err);
                    this.loadingService.screenLoaded();
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
