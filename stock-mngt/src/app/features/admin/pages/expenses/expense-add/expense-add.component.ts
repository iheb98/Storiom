import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  faArrowLeft, faReceipt, faTag, faCoins, faCalendarAlt,
  faComment, faPlus, faSave
} from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/core/services/auth.service';
import { ExpenseService } from 'src/app/core/services/expense.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-expense-add',
  templateUrl: './expense-add.component.html',
  styleUrls: ['./expense-add.component.scss']
})
export class ExpenseAddComponent implements OnInit {

  // Icons
  faArrowLeft = faArrowLeft;
  faReceipt = faReceipt;
  faTag = faTag;
  faCoins = faCoins;
  faCalendarAlt = faCalendarAlt;
  faComment = faComment;
  faPlus = faPlus;
  faSave = faSave;

  // Form
  form: FormGroup;
  submitted = false;

  // Data
  user: any;
  expenseId: string;

  // Loading States
  isLoading = false;
  isSubmitting = false;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private expenseService: ExpenseService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'auto' });
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    }, 0);
    this.initForm();
    this.user = this.authService.getConnectedUser();

    this.route.paramMap.subscribe(paramMap => {
      this.expenseId = paramMap.get('id');
      if (this.expenseId) {
        this.loadExpense();
      }
    });
  }

  loadExpense() {
    this.isLoading = true;
    this.expenseService.getExpense(this.expenseId).subscribe(
      response => {
        this.form.get('title').setValue(response.title);
        this.form.get('amount').setValue(response.amount);
        this.form.get('comment').setValue(response.comment);
        this.form.get('date').setValue(response.date?.substring(0, 10) || null);
        this.isLoading = false;
      },
      error => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Erreur lors du chargement de la dépense',
          showConfirmButton: false,
          timer: 2000
        });
      }
    );
  }

  initForm() {
    this.form = this.formBuilder.group({
      title: ['', Validators.required],
      amount: ['', Validators.required],
      date: [''],
      comment: [''],
    });
  }

  create() {
    this.submitted = true;

    if (this.form.valid) {
      this.isSubmitting = true;
      this.expenseService.addExpense({ ...this.form.getRawValue(), storeId: this.user?.store })
        .subscribe(
          response => {
            this.isSubmitting = false;
            Swal.fire({
              icon: 'success',
              title: 'Dépense ajoutée !',
              showConfirmButton: false,
              timer: 1500
            });
            this.router.navigate(['expenses']);
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

    if (this.form.valid) {
      this.isSubmitting = true;
      this.expenseService.updateExpense({ ...this.form.getRawValue(), id: this.expenseId })
        .subscribe(
          response => {
            this.isSubmitting = false;
            Swal.fire({
              icon: 'success',
              title: 'Dépense modifiée !',
              showConfirmButton: false,
              timer: 1500
            });
            this.router.navigate(['expenses']);
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
