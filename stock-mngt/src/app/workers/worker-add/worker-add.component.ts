import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { WorkerService } from 'src/app/services/worker.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-worker-add',
  templateUrl: './worker-add.component.html',
  styleUrls: ['./worker-add.component.scss']
})
export class WorkerAddComponent implements OnInit {


  form: FormGroup;
  submitted: boolean;
  emailError: boolean;
  user;
  workerId
  loading;

  constructor(private router: Router,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private workerService: WorkerService,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.loading = false;
    this.initForm();
    this.user = this.authService.getConnectedUser();
    this.route.paramMap.subscribe(paramMap => {
      this.workerId = paramMap.get('id');
      if (this.workerId)
        this.workerService.getWorker(this.workerId).subscribe(response => {
          this.form.get('firstName').setValue(response.firstName)
          this.form.get('lastName').setValue(response.lastName)
          this.form.get('phone').setValue(response.phone)
          this.form.get('email').setValue(response.email)
          this.form.get('entryDate').setValue(response.entryDate.substring(0,10))
          this.form.get('salary').setValue(response.salary)
          this.form.get('functionInStore').setValue(response.function)
        })
    })
  }

  initForm() {
    this.form = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")]],
      phone: [''],
      salary: [''],
      role:['Worker'],
      functionInStore: [''],
      superiorId: [this.authService.getConnectedUser()?.id],
      worksInStore:[this.authService.getConnectedUser()?.store?.id],
      entryDate: [null]
    });
  }

  create() {
    this.submitted = true;
    this.emailError = false;
    if (this.form.valid) {
      this.loading = true;
      this.workerService.addWorker({ ...this.form.getRawValue(), worksInStore: this.user?.store })
        .subscribe(response => {
          this.loading = false;
          Swal.fire({
            icon: 'success',
            title: 'Travailleur ajouté !',
            showConfirmButton: false,
            timer: 1500
          })
          this.router.navigate(['workers'])
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
      this.workerService.updateWorker({ ...this.form.getRawValue(), id: this.workerId })
        .subscribe(response => {
          this.loading = false;
          Swal.fire({
            icon: 'success',
            title: 'Travailleur modifié !',
            showConfirmButton: false,
            timer: 1500
          })
          this.router.navigate(['workers'])
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
