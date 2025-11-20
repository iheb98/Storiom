import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { LoadingService } from 'src/app/core/services/loading.service';
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
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private loadingService: LoadingService) { }

  ngOnInit(): void {
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
      this.loadingService.screenLoading()
      this.authService.login({ email: this.form.get('email').value, password: this.form.get('password').value })
        .subscribe(response => {
          this.loadingService.screenLoaded()
          if (response.errorType == "EMAIL_ERROR")
            this.emailError = true;
          else if (response.errorType == "PASSWORD_ERROR")
            this.passwordError = true;
          else {
            this.authService.registerTokens(response.accessToken, response.refreshToken)
            this.authService.loggedIn.next();
            this.router.navigate(['stores/view'])
          }
        },
          error => {
            this.loadingService.screenLoaded()
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
