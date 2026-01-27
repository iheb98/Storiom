import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { UserSettingsService } from 'src/app/core/services/user-settings.service';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  submitted: boolean;
  emailError: boolean;
  passwordError: boolean;
  isLoading = false;
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private userSettingsService: UserSettingsService
  ) { }

  ngOnInit(): void {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'auto' });
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    }, 0);
    this.initForm();
  }

  initForm() {
    this.form = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
      remember: [false]
    });
  }

  login() {
    this.submitted = true;
    this.emailError = false;
    this.passwordError = false;
    if (this.form.valid) {
      this.isLoading = true;

      this.authService.login({ email: this.form.get('email').value, password: this.form.get('password').value })
        .subscribe(response => {

          if (response.errorType == "EMAIL_ERROR") {
            this.emailError = true;
            this.isLoading = false;
          }
          else if (response.errorType == "PASSWORD_ERROR") {
            this.passwordError = true;
            this.isLoading = false;
          }
          else {
            this.authService.registerTokens(response.accessToken, response.refreshToken)
            this.authService.loggedIn.next();

            // Load user settings and redirect to default screen
            this.userSettingsService.loadSettings();

            // Wait for settings to load then redirect
            const settingsSub = this.userSettingsService.settingsLoaded$.subscribe(isLoaded => {
              if (isLoaded) {
                settingsSub.unsubscribe();
                const settings = this.userSettingsService.currentSettings;
                const defaultScreen = settings.navigation?.defaultScreen;

                // Set the redirect flag so layout components don't redirect again
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
          }
        },
          error => {
            this.isLoading = false;
            Swal.fire({
              icon: 'error',
              title: error.error.message || 'Une erreur est survenue ! Merci de réessayer plus tard',
              showConfirmButton: false,
              timer: 3000
            })
          })
    }
  }
}
