import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { StoreAuthService } from 'src/app/core/services/store-auth.service';
import { DomainService } from 'src/app/core/services/domain.service';
import {
  faUser, faEnvelope, faPhone, faLock, faArrowRight, faEye, faEyeSlash
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-store-register',
  templateUrl: './store-register.component.html',
  styleUrls: ['./store-register.component.scss']
})
export class StoreRegisterComponent implements OnInit {
  faUser = faUser;
  faEnvelope = faEnvelope;
  faPhone = faPhone;
  faLock = faLock;
  faArrowRight = faArrowRight;
  faEye = faEye;
  faEyeSlash = faEyeSlash;

  firstName = '';
  lastName = '';
  email = '';
  phone = '';
  password = '';
  confirmPassword = '';
  showPassword = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  basePath = '';
  storeName = '';
  private previewStoreId: number | null = null;

  constructor(
    private storeAuth: StoreAuthService,
    private domainService: DomainService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const storeId = this.route.parent?.snapshot.paramMap.get('storeId');
    this.basePath = storeId ? `/preview-store/${storeId}` : '/store-home';
    this.previewStoreId = storeId ? +storeId : null;
    this.storeName = this.domainService.currentStore?.name || 'Boutique';
  }

  register(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.firstName || !this.lastName || !this.email || !this.password) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }

    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = 'Veuillez entrer une adresse email valide.';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 6 caractères.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }

    this.isLoading = true;

    this.storeAuth.register({
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phone: this.phone,
      password: this.password
    }, this.previewStoreId).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.successMessage = 'Inscription réussie ! Vérifiez votre email pour confirmer votre compte.';
        } else if (res.errorType === 'EMAIL_FOUND') {
          this.errorMessage = 'Cette adresse email est déjà utilisée.';
        } else {
          this.errorMessage = res.message || 'Erreur lors de l\'inscription.';
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Une erreur est survenue. Réessayez plus tard.';
      }
    });
  }
}
