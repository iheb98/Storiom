import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
    faArrowLeft, faTruck, faUser, faPhone, faEnvelope,
    faMapMarkerAlt, faComment, faSave, faPlus, faTimes
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { AuthService } from 'src/app/core/services/auth.service';
import { DeliveryWorkerService } from 'src/app/core/services/delivery-worker.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-delivery-worker-add',
    templateUrl: './delivery-worker-add.component.html',
    styleUrls: ['./delivery-worker-add.component.scss']
})
export class DeliveryWorkerAddComponent implements OnInit {
    // Icons
    faArrowLeft = faArrowLeft;
    faTruck = faTruck;
    faUser = faUser;
    faPhone = faPhone;
    faEnvelope = faEnvelope;
    faMapMarkerAlt = faMapMarkerAlt;
    faWhatsapp = faWhatsapp;
    faComment = faComment;
    faSave = faSave;
    faPlus = faPlus;
    faTimes = faTimes;

    // Form
    form: FormGroup;
    submitted = false;

    // Data
    user: any;
    workerId: number;
    isEditMode = false;

    // States
    tunisianStates = [
        'Ariana', 'Béja', 'Ben Arous', 'Bizerte', 'Gabès', 'Gafsa',
        'Jendouba', 'Kairouan', 'Kasserine', 'Kébili', 'Le Kef',
        'Mahdia', 'La Manouba', 'Médenine', 'Monastir', 'Nabeul',
        'Sfax', 'Sidi Bouzid', 'Siliana', 'Sousse', 'Tataouine',
        'Tozeur', 'Tunis', 'Zaghouan'
    ];
    selectedStates: string[] = [];

    // Loading
    isLoading = false;
    isSubmitting = false;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private formBuilder: FormBuilder,
        private authService: AuthService,
        private deliveryWorkerService: DeliveryWorkerService
    ) { }

    ngOnInit(): void {
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'auto' });
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
        }, 0);
        this.user = this.authService.getConnectedUser();
        this.initForm();

        this.route.params.subscribe(params => {
            if (params['id']) {
                this.workerId = +params['id'];
                this.isEditMode = true;
                this.loadWorker();
            }
        });
    }

    initForm() {
        this.form = this.formBuilder.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            email: ['', [Validators.email]],
            phone: ['', Validators.required],
            whatsapp: [''],
            description: [''],
            sendEmail: [false]
        });
    }

    loadWorker() {
        this.isLoading = true;
        this.deliveryWorkerService.getById(this.workerId).subscribe(
            (worker) => {
                this.form.patchValue({
                    firstName: worker.firstName,
                    lastName: worker.lastName,
                    email: worker.email,
                    phone: worker.phone,
                    whatsapp: worker.whatsapp,
                    description: worker.description,
                    sendEmail: worker.sendEmail || false
                });
                this.selectedStates = worker.supportedStates || [];
                this.isLoading = false;
            },
            (error) => {
                this.isLoading = false;
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur lors du chargement',
                    showConfirmButton: false,
                    timer: 1500
                });
                this.router.navigate(['/delivery-workers']);
            }
        );
    }

    toggleState(state: string) {
        const index = this.selectedStates.indexOf(state);
        if (index > -1) {
            this.selectedStates.splice(index, 1);
        } else {
            this.selectedStates.push(state);
        }
    }

    isStateSelected(state: string): boolean {
        return this.selectedStates.includes(state);
    }

    selectAllStates() {
        this.selectedStates = [...this.tunisianStates];
    }

    clearAllStates() {
        this.selectedStates = [];
    }

    onSubmit() {
        this.submitted = true;

        if (this.form.valid) {
            this.isSubmitting = true;

            const data = {
                ...this.form.value,
                supportedStates: this.selectedStates,
                storeId: this.user?.store
            };

            if (this.isEditMode) {
                this.deliveryWorkerService.update(this.workerId, data).subscribe(
                    () => {
                        this.isSubmitting = false;
                        Swal.fire({
                            icon: 'success',
                            title: 'Livreur modifié !',
                            showConfirmButton: false,
                            timer: 1500
                        });
                        this.router.navigate(['/delivery-workers']);
                    },
                    (error) => {
                        this.isSubmitting = false;
                        Swal.fire({
                            icon: 'error',
                            title: 'Erreur lors de la modification',
                            showConfirmButton: false,
                            timer: 1500
                        });
                    }
                );
            } else {
                this.deliveryWorkerService.create(data).subscribe(
                    () => {
                        this.isSubmitting = false;
                        Swal.fire({
                            icon: 'success',
                            title: 'Livreur ajouté !',
                            showConfirmButton: false,
                            timer: 1500
                        });
                        this.router.navigate(['/delivery-workers']);
                    },
                    (error) => {
                        this.isSubmitting = false;
                        Swal.fire({
                            icon: 'error',
                            title: 'Erreur lors de la création',
                            showConfirmButton: false,
                            timer: 1500
                        });
                    }
                );
            }
        }
    }

    goBack() {
        this.router.navigate(['/delivery-workers']);
    }
}
