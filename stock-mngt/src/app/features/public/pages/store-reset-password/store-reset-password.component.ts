import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { StoreAuthService } from 'src/app/core/services/store-auth.service';
import { DomainService } from 'src/app/core/services/domain.service';
import { faLock, faArrowRight, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-store-reset-password',
  templateUrl: './store-reset-password.component.html',
  styleUrls: ['./store-reset-password.component.scss']
})
export class StoreResetPasswordComponent implements OnInit {
  faLock = faLock;
  faArrowRight = faArrowRight;
  faEye = faEye;
  faEyeSlash = faEyeSlash;

  token = '';
  newPassword = '';
  confirmPassword = '';
  showPassword = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  basePath = '';

  constructor(
    private storeAuth: StoreAuthService,
    private domainService: DomainService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') || '';
    const storeId = this.route.parent?.snapshot.paramMap.get('storeId');
    this.basePath = storeId ? `/preview-store/${storeId}` : '/store-home';
  }

  submit(): void {
    this.errorMessage = '';
    if (!this.newPassword || this.newPassword.length < 6) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 6 caractères.';
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }

    this.isLoading = true;
    this.storeAuth.resetPassword(this.token, this.newPassword).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.successMessage = 'Mot de passe réinitialisé ! Vous pouvez maintenant vous connecter.';
        } else {
          this.errorMessage = res.message || 'Token invalide ou expiré.';
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Token invalide ou expiré.';
      }
    });
  }
}
