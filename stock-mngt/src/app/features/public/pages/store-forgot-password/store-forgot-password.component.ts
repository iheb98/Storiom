import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { StoreAuthService } from 'src/app/core/services/store-auth.service';
import { DomainService } from 'src/app/core/services/domain.service';
import { faEnvelope, faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-store-forgot-password',
  templateUrl: './store-forgot-password.component.html',
  styleUrls: ['./store-forgot-password.component.scss']
})
export class StoreForgotPasswordComponent implements OnInit {
  faEnvelope = faEnvelope;
  faArrowLeft = faArrowLeft;
  faArrowRight = faArrowRight;

  email = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  basePath = '';
  storeName = '';

  constructor(
    private storeAuth: StoreAuthService,
    private domainService: DomainService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const storeId = this.route.parent?.snapshot.paramMap.get('storeId');
    this.basePath = storeId ? `/preview-store/${storeId}` : '/store-home';
    this.storeName = this.domainService.currentStore?.name || 'Boutique';
  }

  submit(): void {
    if (!this.email) {
      this.errorMessage = 'Veuillez entrer votre adresse email.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.storeAuth.forgotPassword(this.email).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.successMessage = 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.';
        } else {
          this.errorMessage = res.message || 'Erreur.';
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Une erreur est survenue. Réessayez plus tard.';
      }
    });
  }
}
