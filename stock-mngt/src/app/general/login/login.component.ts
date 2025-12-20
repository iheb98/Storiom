import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

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
  ) { }

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

      this.authService.login({ email: this.form.get('email').value, password: this.form.get('password').value })
        .subscribe(response => {

          if (response.errorType == "EMAIL_ERROR")
            this.emailError = true;
          else if (response.errorType == "PASSWORD_ERROR")
            this.passwordError = true;
          else {
            this.authService.registerTokens(response.accessToken, response.refreshToken)
            this.authService.loggedIn.next();
            this.router.navigate([''])
          }
        },
          error => {

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
