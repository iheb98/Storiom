import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TermsComponent } from 'src/app/pages/terms/terms.component';
import { AuthService } from 'src/app/core/services/auth.service';
import { LoadingService } from 'src/app/core/services/loading.service';
import Swal from 'sweetalert2';

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
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private loadingService: LoadingService,
    private dialog: MatDialog) { }

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
      termsAccepted: [false, Validators.required],
      country: [''],
      city: [''],
      street: [''],
      postalCode: ['']
    })
  }

  register() {
    this.submitted = true;
    this.emailError = false;
    this.passwordError = false;
    if (this.form.valid && this.form.get('termsAccepted').value) {
      this.loadingService.screenLoading()
      this.authService.registerUser({ ...this.form.getRawValue(), confirmPassword: undefined })
        .subscribe(response => {
          this.loadingService.screenLoaded()
          if (response.errorType == "EMAIL_FOUND") {
            this.emailFound = true;
            Swal.fire({
              icon: 'error',
              title: `Cette adresse e-mail est déjà utilisée. Veuillez en choisir une autre ou vous connecter à votre compte existant.`,
              showConfirmButton: false,
              timer: 3000
            })
          }
          else if (response.success) {
            this.authService.registerTokens(response.accessToken, response.refreshToken)
            this.authService.loggedIn.next();
            Swal.fire({
              icon: 'success',
              title: `Merci de confirmer votre compte. Un mail contenant le lien de vérification a été envoyé`,
              showConfirmButton: false,
              timer: 6000
            })
            this.router.navigate(['stores/view'])
          }
        }, error => {
          this.loadingService.screenLoaded()
          Swal.fire({
            icon: 'error',
            title: 'Une erreur est survenue ! Merci de réessayer plus tard',
            showConfirmButton: false,
            timer: 1500
          })
        })
    }
  }
  openModal(event: Event) {
    event.preventDefault(); // This stops the navigation to root
  }

  openTermsDialog(event: Event): void {
    event.preventDefault();
    this.dialog.open(TermsComponent, {
      width: '600px'
    });
  }
}
