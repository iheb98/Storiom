import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { StoreAuthService } from 'src/app/core/services/store-auth.service';
import { DomainService } from 'src/app/core/services/domain.service';
import { CartService } from 'src/app/core/services/cart.service';
import {
  faEnvelope, faLock, faArrowRight, faEye, faEyeSlash
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-store-login',
  templateUrl: './store-login.component.html',
  styleUrls: ['./store-login.component.scss']
})
export class StoreLoginComponent implements OnInit {
  faEnvelope = faEnvelope;
  faLock = faLock;
  faArrowRight = faArrowRight;
  faEye = faEye;
  faEyeSlash = faEyeSlash;

  email = '';
  password = '';
  showPassword = false;
  isLoading = false;
  errorMessage = '';
  basePath = '';
  storeName = '';
  private previewStoreId: number | null = null;

  constructor(
    private storeAuth: StoreAuthService,
    private domainService: DomainService,
    private cartService: CartService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const storeId = this.route.parent?.snapshot.paramMap.get('storeId');
    this.basePath = storeId ? `/preview-store/${storeId}` : '/store-home';
    this.previewStoreId = storeId ? +storeId : null;
    this.storeName = this.domainService.currentStore?.name || 'Boutique';

    if (this.storeAuth.isLoggedIn()) {
      this.router.navigate([this.basePath]);
    }
  }

  login(): void {
    if (!this.email || !this.password) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.storeAuth.login(this.email, this.password, this.previewStoreId).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.cartService.syncCartOnLogin();
          this.router.navigate([this.basePath]);
        } else if (res.errorType === 'NOT_CONFIRMED') {
          this.errorMessage = 'Veuillez confirmer votre email avant de vous connecter.';
        } else if (res.errorType === 'EMAIL_ERROR') {
          this.errorMessage = 'Aucun compte trouvé avec cet email.';
        } else if (res.errorType === 'PASSWORD_ERROR') {
          this.errorMessage = 'Mot de passe incorrect.';
        } else {
          this.errorMessage = res.message || 'Erreur de connexion.';
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Une erreur est survenue. Réessayez plus tard.';
      }
    });
  }
}
