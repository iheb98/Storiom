import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  form: FormGroup;
  submitted: boolean;
  emailError: boolean;
  emailFound: boolean;
  passwordError: boolean;
  confirmPasswordError: boolean;
  constructor(private router: Router, private formBuilder: FormBuilder, private authService: AuthService) { }

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.form = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")]],
      phone: [''],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    });
  }

  register() {
    this.submitted = true;
    this.emailError = false;
    this.passwordError = false;
    console.log(this.form)
    console.log(this.form.valid)
    if (this.form.valid) {
      this.authService.registerUser({ ...this.form.getRawValue(), confirmPassword: undefined })
        .subscribe(response => {
          if (response.errorType == "EMAIL_Found")
            this.emailFound = true;
          else if (response.success) {
            this.authService.registerTokens(response.accessToken, response.refreshToken)

            this.router.navigate([''])
          }
        })
    }
  }

  

}
