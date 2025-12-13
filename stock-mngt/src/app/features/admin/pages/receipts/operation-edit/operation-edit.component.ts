import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { ReceiptService } from 'src/app/core/services/receipt.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-operation-edit',
  templateUrl: './operation-edit.component.html',
  styleUrls: ['./operation-edit.component.scss']
})
export class OperationEditComponent implements OnInit {

  form: FormGroup;
  submitted: boolean;
  emailError: boolean;
  user;
  operationId
  loading;
  types = [{ value: "LOADED", label: "Chargé" }, { value: "SOLD", label: "Vendu" }, { value: "RETURNED", label: "Retourné" }]
  products = []

  constructor(private router: Router,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private receiptService: ReceiptService,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.loading = false;
    this.initForm();
    this.user = this.authService.getConnectedUser();
    this.route.paramMap.subscribe(paramMap => {
      this.operationId = paramMap.get('id');
      if (this.operationId)
        this.receiptService.getOperation(this.operationId).subscribe(response => {
          this.form.get('type').setValue(response.type)
          this.form.get('amount').setValue(response.amount)
          this.form.get('price').setValue(response.price)
          this.form.get('total').setValue(response.price * response.amount)
          this.form.get('date').setValue((new Date(response.date)).toISOString().substring(0, 16))
          this.form.get('productName').setValue(response?.product?.name)
          this.products.push(response.product)
          console.log(response)
          console.log(this.form)
          console.log(response)
        })
    })
  }

  initForm() {
    this.form = this.formBuilder.group({
      productName: [{ value: '', disabled: true }],
      type: [{ value: '', disabled: true }],
      price: [''],
      amount: [''],
      date: [''],
      total: [{ value: '', disabled: true }]
    });
  }

  edit() {
    this.submitted = true;
    console.log(this.form.value)
    if (this.form.valid) {
      this.loading = true;
      this.receiptService.updateOperation({ ...this.form.getRawValue(), id: this.operationId })
        .subscribe(response => {
          this.loading = false;
          Swal.fire({
            icon: 'success',
            title: 'Operation modifié !',
            showConfirmButton: false,
            timer: 1500
          })
          this.router.navigate(['operations'])
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

  calculateTotal() {
    this.form.get('total').setValue(this.form.get('price').value * this.form.get('amount').value)
  }

  navigateTo(link: string) {
    this.router.navigate([link])
  }
}
