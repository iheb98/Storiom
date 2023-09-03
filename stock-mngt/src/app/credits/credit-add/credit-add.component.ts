import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { CreditService } from 'src/app/services/credit.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-credit-add',
  templateUrl: './credit-add.component.html',
  styleUrls: ['./credit-add.component.scss']
})
export class CreditAddComponent implements OnInit {

  
  form: FormGroup;
  submitted: boolean;
  emailError: boolean;
  user;
  borrowerId
  loading;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private borrowerService: CreditService,
    private route: ActivatedRoute
    ) { }

  ngOnInit(): void {
    this.loading = false;
    this.initForm();
    this.user = this.authService.getConnectedUser();
    this.route.paramMap.subscribe(paramMap => {
      this.borrowerId = paramMap.get('id');
      if (this.borrowerId)
        this.borrowerService.getBorrower(this.borrowerId).subscribe(response => {
          this.form.get('firstName').setValue(response.firstName)
          this.form.get('lastName').setValue(response.lastName)
          this.form.get('phone').setValue(response.phone)
          this.form.get('email').setValue(response.email)
          this.form.get('givenDate').setValue(response.givenDate.substring(0,10))
          this.form.get('returnDate').setValue(response.returnDate.substring(0,10))
          this.form.get('amount').setValue(response.amount)
          this.form.get('comment').setValue(response.comment)
        })
    })
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
      returnDate: [null]
    });
  }

  create() {
    this.submitted = true;
    this.emailError = false;
    this.loading = true;
    if (this.form.valid) {
      this.borrowerService.addBorrower({ ...this.form.getRawValue(), storeId: this.user?.store })
        .subscribe(response => {
          this.loading = false;
          Swal.fire({
            icon: 'success',
            title: 'Crédit ajouté !',
            showConfirmButton: false,
            timer: 1500
          })
          this.router.navigate(['credits'])
        }, error => {
          this.loading = false;
          Swal.fire({
            icon: 'error',
            title: 'Un erreur est survenue ! Merci de réessayer plus tard',
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
      this.borrowerService.updateBorrower({ ...this.form.getRawValue(), id: this.borrowerId })
        .subscribe(response => {
          this.loading = false;
          Swal.fire({
            icon: 'success',
            title: 'Crédit modifié !',
            showConfirmButton: false,
            timer: 1500
          })
          this.router.navigate(['credits'])
        }, error => {
          this.loading = false;
          Swal.fire({
            icon: 'error',
            title: 'Un erreur est survenue ! Merci de réessayer plus tard',
            showConfirmButton: false,
            timer: 1500
          })
        })
    }
  }

}
