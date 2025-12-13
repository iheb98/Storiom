import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { ExpenseService } from 'src/app/core/services/expense.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-expense-add',
  templateUrl: './expense-add.component.html',
  styleUrls: ['./expense-add.component.scss']
})
export class ExpenseAddComponent implements OnInit {


  form: FormGroup;
  submitted: boolean;
  emailError: boolean;
  user;
  expenseId
  loading;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private expenseService: ExpenseService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.loading = false;
    this.initForm();
    this.user = this.authService.getConnectedUser();
    this.route.paramMap.subscribe(paramMap => {
      this.expenseId = paramMap.get('id');
      if (this.expenseId) {
        this.loading = true;
        this.expenseService.getExpense(this.expenseId).subscribe(response => {
          this.loading = false;
          this.form.get('title').setValue(response.title)
          this.form.get('amount').setValue(response.amount)
          this.form.get('comment').setValue(response.comment)
          this.form.get('date').setValue(response.date.substring(0, 10))
        }, error => {
          this.loading = false;
          Swal.fire({
            icon: 'error',
            title: 'Une erreur est survenue ! Merci de réessayer plus tard',
            showConfirmButton: false,
            timer: 1500
          })
        })
      }
    })
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
    this.emailError = false;
    this.loading = true;
    if (this.form.valid) {
      this.expenseService.addExpense({ ...this.form.getRawValue(), storeId: this.user?.store })
        .subscribe(response => {
          this.loading = false;
          Swal.fire({
            icon: 'success',
            title: 'Dépense ajouté !',
            showConfirmButton: false,
            timer: 1500
          })
          this.router.navigate(['expenses'])
        }, error => {
          this.loading = false;
          Swal.fire({
            icon: 'error',
            title: 'Une erreur est survenue ! Merci de réessayer plus tard',
            showConfirmButton: false,
            timer: 1500
          })
        })
    }
  }

  edit() {
    this.submitted = true;
    this.emailError = false;
    this.loading = true;
    if (this.form.valid) {
      this.expenseService.updateExpense({ ...this.form.getRawValue(), id: this.expenseId })
        .subscribe(response => {
          this.loading = false;
          Swal.fire({
            icon: 'success',
            title: 'Dépense modifié !',
            showConfirmButton: false,
            timer: 1500
          })
          this.router.navigate(['expenses'])
        }, error => {
          this.loading = false;
          Swal.fire({
            icon: 'error',
            title: 'Une erreur est survenue ! Merci de réessayer plus tard',
            showConfirmButton: false,
            timer: 1500
          })
        })
    }
  }

  navigateTo(link: string) {
    this.router.navigate([link])
  }
}

