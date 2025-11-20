import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {


  ngOnInit(): void {
  }

  form: FormGroup;
  token: string;
  success: boolean = false;
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.token = this.route.snapshot.paramMap.get('token') || '';
    this.form = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(4)]],
      confirmPassword: ['', Validators.required]
    });
  }

  submit() {
    if (this.form.invalid || this.form.value.password !== this.form.value.confirmPassword) {
      this.error = "Les mots de passe ne correspondent pas ou sont invalides.";
      return;
    }
    this.authService.resetPassword({
      token: this.token,
      newPassword: this.form.value.password
    }).subscribe({
      next: () => {
        this.success = true;
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (err) => {
        this.error = err.error.message || "Erreur lors de la réinitialisation.";
      }
    });
  }

}
