import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { faArrowLeft, faSave, faCog } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/core/services/auth.service';
import { StoreServiceService } from 'src/app/core/services/store-service.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-service-add',
    templateUrl: './service-add.component.html',
    styleUrls: ['./service-add.component.scss']
})
export class ServiceAddComponent implements OnInit {
    // Icons
    faArrowLeft = faArrowLeft;
    faSave = faSave;
    faCog = faCog;

    // Form
    form!: FormGroup;
    editMode = false;
    serviceId: number | null = null;
    user: any;

    // Loading
    isLoading = false;
    isSaving = false;

    // Categories
    categories = [
        { value: 'OTHER', label: 'Autre' },
        { value: 'REPAIR', label: 'Réparation' },
        { value: 'MAINTENANCE', label: 'Entretien' },
        { value: 'INSTALLATION', label: 'Installation' },
        { value: 'CLEANING', label: 'Nettoyage' },
        { value: 'CONSULTING', label: 'Consultation' }
    ];

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private route: ActivatedRoute,
        private authService: AuthService,
        private storeServiceService: StoreServiceService
    ) { }

    ngOnInit(): void {
        this.user = this.authService.getConnectedUser();
        this.initForm();

        // Check if editing
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.editMode = true;
            this.serviceId = parseInt(id);
            this.loadService();
        }
    }

    initForm() {
        this.form = this.fb.group({
            name: ['', Validators.required],
            description: [''],
            price: [0, [Validators.required, Validators.min(0)]],
            estimatedDuration: [''],
            category: ['OTHER'],
            isActive: [true],
            isPriceVariable: [false]
        });

        // Listen to isPriceVariable changes to toggle price validation
        this.form.get('isPriceVariable')?.valueChanges.subscribe((isVariable: boolean) => {
            const priceControl = this.form.get('price');
            if (isVariable) {
                priceControl?.clearValidators();
                priceControl?.setValue(null);
            } else {
                priceControl?.setValidators([Validators.required, Validators.min(0)]);
            }
            priceControl?.updateValueAndValidity();
        });
    }

    loadService() {
        this.isLoading = true;
        this.storeServiceService.getById(this.serviceId!).subscribe(
            (service) => {
                this.form.patchValue({
                    name: service.name,
                    description: service.description,
                    price: service.price,
                    estimatedDuration: service.estimatedDuration,
                    category: service.category || 'OTHER',
                    isActive: service.isActive !== false,
                    isPriceVariable: service.isPriceVariable || false
                });
                this.isLoading = false;
            },
            (error) => {
                console.error('Error loading service:', error);
                this.isLoading = false;
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur lors du chargement',
                    showConfirmButton: false,
                    timer: 1500
                });
                this.router.navigate(['/admin/services']);
            }
        );
    }

    save() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.isSaving = true;
        const data = {
            ...this.form.value,
            storeId: this.user?.store
        };

        const request = this.editMode
            ? this.storeServiceService.update(this.serviceId!, data)
            : this.storeServiceService.create(data);

        request.subscribe(
            () => {
                this.isSaving = false;
                Swal.fire({
                    icon: 'success',
                    title: this.editMode ? 'Service modifié !' : 'Service créé !',
                    showConfirmButton: false,
                    timer: 1500
                });
                this.router.navigate(['/admin/services']);
            },
            (error) => {
                this.isSaving = false;
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur lors de l\'enregistrement',
                    text: error.error?.message || 'Une erreur est survenue',
                    showConfirmButton: true
                });
            }
        );
    }

    goBack() {
        this.router.navigate(['/admin/services']);
    }
}
