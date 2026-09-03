import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  faArrowLeft, faUser, faEnvelope, faPhone, faHandHoldingUsd,
  faCoins, faCalendarPlus, faCalendarCheck, faComment, faPlus, faSave, faCheck, faExchangeAlt, faTruck, faBell
} from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/core/services/auth.service';
import { CreditService } from 'src/app/core/services/credit.service';
import { SupplierService } from 'src/app/core/services/supplier.service';
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
  faExchangeAlt = faExchangeAlt;
  faTruck = faTruck;
  faBell = faBell;

  // Form
  form: FormGroup;
  submitted = false;
  emailError = false;

  // Data
  user: any;
  borrowerId: string;
  suppliers: any[] = [];
  isSupplier = false; // toggle: link to existing supplier

  // Temp storage to preserve data when toggling modes
  private savedManual = { firstName: '', lastName: '', phone: '', email: '' };
  private savedSupplierId: number | null = null;

  // Loading States
  isLoading = false;
  isSubmitting = false;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private borrowerService: CreditService,
    private supplierService: SupplierService,
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
    this.loadSuppliers();

    this.route.paramMap.subscribe(paramMap => {
      this.borrowerId = paramMap.get('id');
      if (this.borrowerId) {
        this.loadBorrower();
      }
    });
  }

  loadSuppliers() {
    if (!this.user?.store) return;
    this.supplierService.getAllSuppliersByStoreId(this.user.store).subscribe(
      response => {
        this.suppliers = response;
      }
    );
  }

  loadBorrower() {
    this.isLoading = true;
    this.borrowerService.getBorrower(this.borrowerId).subscribe(
      response => {
        // If linked to a supplier, switch to supplier mode
        if (response.supplierId) {
          this.isSupplier = true;
          this.form.get('supplierId').setValue(response.supplierId);
        }

        this.form.get('firstName').setValue(response.firstName);
        this.form.get('lastName').setValue(response.lastName);
        this.form.get('phone').setValue(response.phone);
        this.form.get('email').setValue(response.email);
        this.form.get('givenDate').setValue(response.givenDate?.substring(0, 10) || null);
        this.form.get('returnDate').setValue(response.returnDate?.substring(0, 10) || null);
        this.form.get('amount').setValue(response.amount);
        this.form.get('comment').setValue(response.comment);
        this.form.get('status').setValue(response.status || false);
        this.form.get('direction').setValue(response.direction || 'owed_to_me');
        this.form.get('reminderEnabled').setValue(response.reminderEnabled || false);
        this.form.get('reminderBefore').setValue(response.reminderBefore || null);

        this.updateValidators();
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
      status: [false],
      direction: ['owed_to_me'],
      supplierId: [null],
      reminderEnabled: [false],
      reminderBefore: [null]
    });
  }

  toggleSupplierMode(isSupplier: boolean) {
    if (isSupplier === this.isSupplier) return;

    if (isSupplier) {
      // Save manual fields before switching
      this.savedManual = {
        firstName: this.form.get('firstName').value || '',
        lastName: this.form.get('lastName').value || '',
        phone: this.form.get('phone').value || '',
        email: this.form.get('email').value || ''
      };
      // Restore saved supplier selection
      this.form.get('supplierId').setValue(this.savedSupplierId);
      if (this.savedSupplierId) {
        this.onSupplierSelected(); // Re-fill name/phone from supplier
      }
      // Suppress manual validators
      this.form.get('firstName').clearValidators();
      this.form.get('lastName').clearValidators();
    } else {
      // Save supplier selection before switching
      this.savedSupplierId = this.form.get('supplierId').value;
      this.form.get('supplierId').setValue(null);
      // Restore saved manual fields
      this.form.get('firstName').setValue(this.savedManual.firstName);
      this.form.get('lastName').setValue(this.savedManual.lastName);
      this.form.get('phone').setValue(this.savedManual.phone);
      this.form.get('email').setValue(this.savedManual.email);
      // Restore manual validators
      this.form.get('firstName').setValidators(Validators.required);
      this.form.get('lastName').setValidators(Validators.required);
    }

    this.isSupplier = isSupplier;
    this.form.get('firstName').updateValueAndValidity();
    this.form.get('lastName').updateValueAndValidity();
  }

  onSupplierSelected() {
    const supplierId = this.form.get('supplierId').value;
    if (!supplierId) return;
    const supplier = this.suppliers.find(s => s.id == supplierId);
    if (supplier) {
      // Auto-fill from supplier data
      this.form.get('firstName').setValue(supplier.firstName || '');
      this.form.get('lastName').setValue(supplier.lastName || '');
      this.form.get('phone').setValue(supplier.phone || '');
      this.form.get('email').setValue(supplier.email || '');
    }
  }

  private updateValidators() {
    if (this.isSupplier) {
      this.form.get('firstName').clearValidators();
      this.form.get('lastName').clearValidators();
    } else {
      this.form.get('firstName').setValidators(Validators.required);
      this.form.get('lastName').setValidators(Validators.required);
    }
    this.form.get('firstName').updateValueAndValidity();
    this.form.get('lastName').updateValueAndValidity();
  }

  create() {
    this.submitted = true;
    this.emailError = false;

    if (this.isSupplier && !this.form.get('supplierId').value) {
      return; // Must select a supplier
    }

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

    if (this.isSupplier && !this.form.get('supplierId').value) {
      return;
    }

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
