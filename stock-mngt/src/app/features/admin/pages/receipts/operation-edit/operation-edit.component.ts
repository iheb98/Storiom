import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  faArrowLeft, faBox, faShoppingCart, faTruck, faUndo, faCoins, faTag,
  faCubes, faCalculator, faCalendarAlt, faClock, faSave, faSpinner
} from '@fortawesome/free-solid-svg-icons';
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
  operationId;
  types = [{ value: "LOADED", label: "Chargé" }, { value: "SOLD", label: "Vendu" }, { value: "RETURNED", label: "Retourné" }];
  products = [];

  // Icons
  faArrowLeft = faArrowLeft;
  faBox = faBox;
  faShoppingCart = faShoppingCart;
  faTruck = faTruck;
  faUndo = faUndo;
  faCoins = faCoins;
  faTag = faTag;
  faCubes = faCubes;
  faCalculator = faCalculator;
  faCalendarAlt = faCalendarAlt;
  faClock = faClock;
  faSave = faSave;
  faSpinner = faSpinner;

  // Loading States
  isLoading = true;
  isSubmitting = false;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private receiptService: ReceiptService,
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
      this.operationId = paramMap.get('id');
      if (this.operationId) {
        this.loadOperation();
      } else {
        this.isLoading = false;
      }
    });
  }

  loadOperation() {
    this.isLoading = true;
    this.receiptService.getOperation(this.operationId).subscribe(
      response => {
        this.form.get('type').setValue(response.type);
        this.form.get('amount').setValue(response.amount);
        this.form.get('price').setValue(response.price);
        this.form.get('total').setValue(response.price * response.amount);
        this.form.get('date').setValue((new Date(response.date)).toISOString().substring(0, 16));
        this.form.get('productName').setValue(response?.product?.name);
        this.products.push(response.product);
        this.isLoading = false;
      },
      error => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Erreur lors du chargement de l\'opération',
          showConfirmButton: false,
          timer: 2000
        });
      }
    );
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
    if (this.form.valid) {
      this.isSubmitting = true;
      this.receiptService.updateOperation({ ...this.form.getRawValue(), id: this.operationId })
        .subscribe(
          response => {
            this.isSubmitting = false;
            Swal.fire({
              icon: 'success',
              title: 'Opération modifiée !',
              showConfirmButton: false,
              timer: 1500
            });
            this.router.navigate(['operations']);
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

  calculateTotal() {
    this.form.get('total').setValue(this.form.get('price').value * this.form.get('amount').value);
  }

  navigateTo(link: string) {
    this.router.navigate([link]);
  }
}
