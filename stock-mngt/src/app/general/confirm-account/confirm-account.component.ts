import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { UserSettingsService } from 'src/app/core/services/user-settings.service';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-confirm-account',
  templateUrl: './confirm-account.component.html',
  styleUrls: ['./confirm-account.component.scss']
})
export class ConfirmAccountComponent implements OnInit {

  message = '';
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private userSettingsService: UserSettingsService
  ) { }

  ngOnInit(): void {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'auto' });
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    }, 0);
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      this.authService.confirmAccount(token).subscribe(response => {
        console.log(response);
        this.loading = false;

        // Check if tokens are provided for auto-login
        if (response.accessToken && response.refreshToken) {
          // Auto-login the user
          this.authService.registerTokens(response.accessToken, response.refreshToken);
          this.authService.loggedIn.next();

          Swal.fire({
            icon: 'success',
            title: 'Compte confirmé !',
            text: 'Vous êtes maintenant connecté.',
            showConfirmButton: false,
            timer: 2000
          });

          // Load user settings and redirect
          this.userSettingsService.loadSettings();
          const settingsSub = this.userSettingsService.settingsLoaded$.subscribe(isLoaded => {
            if (isLoaded) {
              settingsSub.unsubscribe();
              const settings = this.userSettingsService.currentSettings;
              const defaultScreen = settings?.navigation?.defaultScreen;

              sessionStorage.setItem('defaultScreenRedirected', 'true');

              if (defaultScreen && defaultScreen !== 'none') {
                const screenMap = {
                  'dashboard': '/admin/dashboard',
                  'products': '/admin/products',
                  'orders': '/admin/orders',
                  'stats': '/admin/dashboard'
                };
                const targetPath = screenMap[defaultScreen] || '/admin/dashboard';
                this.router.navigate([targetPath]);
              } else {
                this.router.navigate(['']);
              }
            }
          });
        } else {
          // Fallback to login page if no tokens (e.g., already confirmed)
          Swal.fire({
            icon: 'success',
            title: response.message,
            showConfirmButton: false,
            timer: 3000
          });
          this.router.navigate(['/login']);
        }
      }, (error) => {
        console.log(error);
        this.loading = false;
        Swal.fire({
          icon: 'error',
          title: error.error,
          showConfirmButton: false,
          timer: 3000
        });
        this.router.navigate(['/login']);
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Aucun token fourni',
        showConfirmButton: false,
        timer: 3000
      });
      this.router.navigate(['/login']);
    }
  }
}

