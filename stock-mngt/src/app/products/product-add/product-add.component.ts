import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { CategoryService } from 'src/app/services/category.service';
import { LoadingService } from 'src/app/services/loading.service';
import { SupplierService } from 'src/app/services/supplier.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-product-add',
  templateUrl: './product-add.component.html',
  styleUrls: ['./product-add.component.scss']
})
export class ProductAddComponent implements OnInit {

  form: FormGroup;
  submitted: boolean;
  emailError: boolean;
  user;
  supplierId
  loading;
  supplier;
  suppliers = []
  couleurs = []
  categories;
  parentCategory
  subCategory
  subCategory2
  subCategory3
  subCategory4

  constructor(private router: Router,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private supplierService: SupplierService,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private loadingService: LoadingService) { }

  ngOnInit(): void {
    this.loading = false;
    this.initForm();
    this.couleurs = environment.couleurs
    this.user = this.authService.getConnectedUser();
    this.route.paramMap.subscribe(paramMap => {
      this.supplierId = paramMap.get('id');
      if (this.supplierId)
        this.supplierService.getSupplier(this.supplierId).subscribe(
          response => {
            this.form.get('firstName').setValue(response.firstName)
            this.form.get('lastName').setValue(response.lastName)
            this.form.get('phone').setValue(response.phone)
            this.form.get('email').setValue(response.email)
            this.form.get('credit').setValue(response.credit)
          })
    })
    this.getSuppliers();
    this.getCategories();
  }

  getSuppliers() {
    this.loadingService.screenLoading()
    this.supplierService.getAllSuppliersByStoreId(this.authService.getConnectedUser()?.store).subscribe(
      response => {
        this.loadingService.screenLoaded()
        this.suppliers = response
      }
    )
  }

  getCategories() {
    this.loadingService.screenLoading()
    this.categoryService.getCategoriesByStoreId(this.authService.getConnectedUser()?.store).subscribe(
      response => {
        this.loadingService.screenLoaded()
        this.categories = response
      }
    )
  }

  initForm() {
    this.form = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")]],
      phone: [''],
      supplier: [''],
      color: [''],
      credit: ['']
    });
  }

  create() {
    this.submitted = true;
    this.emailError = false;
    this.loading = true;
    if (this.form.valid) {
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
            title: 'Un erreur est survenue ! Merci de réessayer plus tard',
            showConfirmButton: false,
            timer: 1500
          })
        })
    }
  }

  categoryChanged(categoryDepth) {
    if (categoryDepth == 0) {
      this.subCategory = null
      this.subCategory2 = null
      this.subCategory3 = null
      this.subCategory4 = null
    } else if (categoryDepth == 1) {
      this.subCategory2 = null
      this.subCategory3 = null
      this.subCategory4 = null
    } else if (categoryDepth == 2) {
      this.subCategory3 = null
      this.subCategory4 = null
    } else if (categoryDepth == 3) {
      this.subCategory4 = null
    }

  }

}
