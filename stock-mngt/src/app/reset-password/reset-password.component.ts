import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import {
  faLock, faKey, faCheckCircle, faExclamationCircle, faArrowLeft,
  faShieldAlt, faEye, faEyeSlash, faCheck, faTimes
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

  // Icons
  faLock = faLock;
  faKey = faKey;
  faCheckCircle = faCheckCircle;
  faExclamationCircle = faExclamationCircle;
  faArrowLeft = faArrowLeft;
  faShieldAlt = faShieldAlt;
  faEye = faEye;
  faEyeSlash = faEyeSlash;
  faCheck = faCheck;
  faTimes = faTimes;

  form: FormGroup;
  token: string;
  success: boolean = false;
  error: string = '';
  isSubmitting: boolean = false;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  // Password strength
  passwordStrength: 'weak' | 'medium' | 'strong' | '' = '';

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.token = this.route.snapshot.paramMap.get('token') || '';
    this.form = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });

    // Watch password changes for strength indicator
    this.form.get('password')?.valueChanges.subscribe(password => {
      this.checkPasswordStrength(password);
    });
  }

  ngOnInit(): void { }

  checkPasswordStrength(password: string) {
    if (!password) {
      this.passwordStrength = '';
      return;
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;

    const score = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecial, isLongEnough].filter(Boolean).length;

    if (score <= 2) {
      this.passwordStrength = 'weak';
    } else if (score <= 3) {
      this.passwordStrength = 'medium';
    } else {
      this.passwordStrength = 'strong';
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  get passwordsMatch(): boolean {
    return this.form.value.password === this.form.value.confirmPassword && this.form.value.confirmPassword !== '';
  }

  submit() {
    this.error = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.form.value.password !== this.form.value.confirmPassword) {
      this.error = "Les mots de passe ne correspondent pas.";
      return;
    }

    this.isSubmitting = true;

    this.authService.resetPassword({
      token: this.token,
      newPassword: this.form.value.password
    }).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.success = true;
        setTimeout(() => this.router.navigate(['/login']), 4000);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.error = err.error?.message || "Erreur lors de la réinitialisation. Le lien a peut-être expiré.";
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
