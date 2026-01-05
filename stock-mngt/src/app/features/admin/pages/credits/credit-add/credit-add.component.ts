import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  faArrowLeft, faUser, faEnvelope, faPhone, faHandHoldingUsd,
  faCoins, faCalendarPlus, faCalendarCheck, faComment, faPlus, faSave, faCheck
} from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/core/services/auth.service';
import { CreditService } from 'src/app/core/services/credit.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-credit-add',
  templateUrl: './credit-add.component.html',
  styleUrls: ['./credit-add.component.scss']
})
export class CreditAddComponent implements OnInit {

  // Icons
  faArrowLeft = faArrowLeft;
  faUser = faUser;
  faEnvelope = faEnvelope;
  faPhone = faPhone;
  faHandHoldingUsd = faHandHoldingUsd;
  faCoins = faCoins;
  faCalendarPlus = faCalendarPlus;
  faCalendarCheck = faCalendarCheck;
  faComment = faComment;
  faPlus = faPlus;
  faSave = faSave;
  faCheck = faCheck;

  // Form
  form: FormGroup;
  submitted = false;
  emailError = false;

  // Data
  user: any;
  borrowerId: string;

  // Loading States
  isLoading = false;
  isSubmitting = false;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private borrowerService: CreditService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.user = this.authService.getConnectedUser();

    this.route.paramMap.subscribe(paramMap => {
      this.borrowerId = paramMap.get('id');
      if (this.borrowerId) {
        this.loadBorrower();
      }
    });
  }

  loadBorrower() {
    this.isLoading = true;
    this.borrowerService.getBorrower(this.borrowerId).subscribe(
      response => {
        this.form.get('firstName').setValue(response.firstName);
        this.form.get('lastName').setValue(response.lastName);
        this.form.get('phone').setValue(response.phone);
        this.form.get('email').setValue(response.email);
        this.form.get('givenDate').setValue(response.givenDate?.substring(0, 10) || null);
        this.form.get('returnDate').setValue(response.returnDate?.substring(0, 10) || null);
        this.form.get('amount').setValue(response.amount);
        this.form.get('comment').setValue(response.comment);
        this.form.get('status').setValue(response.status || false);
        this.isLoading = false;
      },
      error => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Erreur lors du chargement du crédit',
          showConfirmButton: false,
          timer: 2000
        });
      }
    );
  }

  initForm() {
    this.form = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")]],
      phone: [''],
      comment: [''],
      amount: [''],
      givenDate: [null],
      returnDate: [null],
      status: [false]
    });
  }

  create() {
    this.submitted = true;
    this.emailError = false;

    if (this.form.valid) {
      this.isSubmitting = true;
      this.borrowerService.addBorrower({ ...this.form.getRawValue(), storeId: this.user?.store })
        .subscribe(
          response => {
            this.isSubmitting = false;
            Swal.fire({
              icon: 'success',
              title: 'Crédit ajouté !',
              showConfirmButton: false,
              timer: 1500
            });
            this.router.navigate(['credits']);
          },
          error => {
            this.isSubmitting = false;
            Swal.fire({
              icon: 'error',
              title: 'Une erreur est survenue ! Merci de réessayer plus tard',
              showConfirmButton: false,
              timer: 1500
            });
          }
        );
    }
  }

  edit() {
    this.submitted = true;
    this.emailError = false;

    if (this.form.valid) {
      this.isSubmitting = true;
      this.borrowerService.updateBorrower({ ...this.form.getRawValue(), id: this.borrowerId })
        .subscribe(
          response => {
            this.isSubmitting = false;
            Swal.fire({
              icon: 'success',
              title: 'Crédit modifié !',
              showConfirmButton: false,
              timer: 1500
            });
            this.router.navigate(['credits']);
          },
          error => {
            this.isSubmitting = false;
            Swal.fire({
              icon: 'error',
              title: 'Une erreur est survenue ! Merci de réessayer plus tard',
              showConfirmButton: false,
              timer: 1500
            });
          }
        );
    }
  }

  navigateTo(link: string) {
    this.router.navigate([link]);
  }
}
