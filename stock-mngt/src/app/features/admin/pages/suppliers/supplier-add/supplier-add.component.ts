import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { SupplierService } from 'src/app/core/services/supplier.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-supplier-add',
  templateUrl: './supplier-add.component.html',
  styleUrls: ['./supplier-add.component.scss']
})
export class SupplierAddComponent implements OnInit {

  form: FormGroup;
  submitted: boolean;
  emailError: boolean;
  user;
  supplierId
  loading;

  constructor(private router: Router,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private supplierService: SupplierService,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.loading = false;
    this.initForm();
    this.user = this.authService.getConnectedUser();
    this.route.paramMap.subscribe(paramMap => {
      this.supplierId = paramMap.get('id');
      if (this.supplierId)
        this.supplierService.getSupplier(this.supplierId).subscribe(response => {
          this.form.get('firstName').setValue(response.firstName)
          this.form.get('lastName').setValue(response.lastName)
          this.form.get('phone').setValue(response.phone)
          this.form.get('email').setValue(response.email)
          this.form.get('credit').setValue(response.credit)
          this.form.get('description').setValue(response.description)
        })
    })
  }

  initForm() {
    this.form = this.formBuilder.group({
      firstName: [''],
      lastName: [''],
      email: ['', [Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")]],
      phone: [''],
      credit: [''],
      description:['']
    });
  }

  create() {
    this.submitted = true;
    this.emailError = false;
    if (this.form.valid) {
      this.loading = true;
      this.supplierService.addSupplier({ ...this.form.getRawValue(), storeId: this.user?.store })
        .subscribe(response => {
          this.loading = false;
          Swal.fire({
            icon: 'success',
            title: 'Fournisseur ajouté !',
            showConfirmButton: false,
            timer: 1500
          })
          this.router.navigate(['suppliers'])
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
    if (this.form.valid) {
      this.loading = true;
      this.supplierService.updateSupplier({ ...this.form.getRawValue(), id: this.supplierId })
        .subscribe(response => {
          this.loading = false;
          Swal.fire({
            icon: 'success',
            title: 'Fournisseur modifié !',
            showConfirmButton: false,
            timer: 1500
          })
          this.router.navigate(['suppliers'])
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
}
