import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
  }

  form: FormGroup;
  successMessage = '';
  errorMessage = '';

  submit() {
    if (this.form.invalid) return;
    this.authService.forgotPassword(this.form.value).subscribe({
      next: () => this.successMessage = 'Lien envoyé. Vérifiez votre boîte mail.',
      error: (error) => this.errorMessage = error.error
    });
  }


}
