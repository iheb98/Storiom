import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  faArrowLeft, faUser, faAddressBook, faEnvelope, faPhone,
  faBriefcase, faIdBadge, faCoins, faCalendarAlt, faPlus, faSave, faHardHat
} from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/core/services/auth.service';
import { WorkerService } from 'src/app/core/services/worker.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-worker-add',
  templateUrl: './worker-add.component.html',
  styleUrls: ['./worker-add.component.scss']
})
export class WorkerAddComponent implements OnInit {

  // Icons
  faArrowLeft = faArrowLeft;
  faUser = faUser;
  faAddressBook = faAddressBook;
  faEnvelope = faEnvelope;
  faPhone = faPhone;
  faBriefcase = faBriefcase;
  faIdBadge = faIdBadge;
  faCoins = faCoins;
  faCalendarAlt = faCalendarAlt;
  faPlus = faPlus;
  faSave = faSave;
  faHardHat = faHardHat;

  // Form
  form: FormGroup;
  submitted = false;
  emailError = false;

  // Data
  user: any;
  workerId: string;

  // Loading States
  isLoading = false;
  isSubmitting = false;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private workerService: WorkerService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.user = this.authService.getConnectedUser();

    this.route.paramMap.subscribe(paramMap => {
      this.workerId = paramMap.get('id');
      if (this.workerId) {
        this.loadWorker();
      }
    });
  }

  loadWorker() {
    this.isLoading = true;
    this.workerService.getWorker(this.workerId).subscribe(
      response => {
        this.form.get('firstName').setValue(response.firstName);
        this.form.get('lastName').setValue(response.lastName);
        this.form.get('phone').setValue(response.phone);
        this.form.get('email').setValue(response.email);
        this.form.get('entryDate').setValue(response.entryDate?.substring(0, 10) || null);
        this.form.get('salary').setValue(response.salary);
        this.form.get('functionInStore').setValue(response.function);
        this.isLoading = false;
      },
      error => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Erreur lors du chargement du travailleur',
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
      salary: [''],
      role: ['Worker'],
      functionInStore: [''],
      superiorId: [this.authService.getConnectedUser()?.id],
      worksInStore: [this.authService.getConnectedUser()?.store?.id],
      entryDate: [null]
    });
  }

  create() {
    this.submitted = true;
    this.emailError = false;

    if (this.form.valid) {
      this.isSubmitting = true;
      this.workerService.addWorker({ ...this.form.getRawValue(), worksInStore: this.user?.store })
        .subscribe(
          response => {
            this.isSubmitting = false;
            Swal.fire({
              icon: 'success',
              title: 'Travailleur ajouté !',
              showConfirmButton: false,
              timer: 1500
            });
            this.router.navigate(['workers']);
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
      this.workerService.updateWorker({ ...this.form.getRawValue(), id: this.workerId })
        .subscribe(
          response => {
            this.isSubmitting = false;
            Swal.fire({
              icon: 'success',
              title: 'Travailleur modifié !',
              showConfirmButton: false,
              timer: 1500
            });
            this.router.navigate(['workers']);
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
