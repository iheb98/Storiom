import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import {
  faEnvelope, faArrowLeft, faLock, faPaperPlane, faCheckCircle,
  faExclamationCircle, faShieldAlt, faKey
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

  // Icons
  faEnvelope = faEnvelope;
  faArrowLeft = faArrowLeft;
  faLock = faLock;
  faPaperPlane = faPaperPlane;
  faCheckCircle = faCheckCircle;
  faExclamationCircle = faExclamationCircle;
  faShieldAlt = faShieldAlt;
  faKey = faKey;

  form: FormGroup;
  successMessage = '';
  errorMessage = '';
  isSubmitting = false;
  emailSent = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'auto' });
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    }, 0);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.forgotPassword(this.form.value).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.emailSent = true;
        this.successMessage = 'Lien envoyé ! Vérifiez votre boîte mail.';
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = error.error || 'Une erreur est survenue. Veuillez réessayer.';
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
