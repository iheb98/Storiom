import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/core/services/auth.service';
import { TUNISIA_LOCATIONS, getAllGovernorates, getCitiesForGovernorate } from 'src/app/shared/data/tunisia-locations';
import {
    faUser, faEnvelope, faPhone, faGlobe, faMapMarkerAlt, faCity,
    faRoad, faMailBulk, faSave, faSpinner, faCheckCircle, faExclamationCircle,
    faLock, faInfoCircle
} from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-profile-details',
    templateUrl: './profile-details.component.html',
    styleUrls: ['./profile-details.component.scss']
})
export class ProfileDetailsComponent implements OnInit, OnChanges {

    @Input() user: any;
    profileForm: FormGroup;
    isSaving = false;
    isLoading = true;
    successMessage = '';
    errorMessage = '';

    // Location options
    governorates: string[] = [];
    cities: string[] = [];

    // Icons
    faUser = faUser;
    faEnvelope = faEnvelope;
    faPhone = faPhone;
    faGlobe = faGlobe;
    faMapMarkerAlt = faMapMarkerAlt;
    faCity = faCity;
    faRoad = faRoad;
    faMailBulk = faMailBulk;
    faSave = faSave;
    faSpinner = faSpinner;
    faCheckCircle = faCheckCircle;
    faExclamationCircle = faExclamationCircle;
    faLock = faLock;
    faInfoCircle = faInfoCircle;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.governorates = getAllGovernorates();
        if (this.user) {
            this.initForm();
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['user'] && this.user) {
            this.initForm();
        }
    }

    initForm() {
        const currentGovernorate = this.user.address?.state || '';

        this.profileForm = this.fb.group({
            firstName: [this.user.firstName, [Validators.required]],
            lastName: [this.user.lastName, [Validators.required]],
            email: [{ value: this.user.email, disabled: true }],
            phone: [this.user.phone, [Validators.required]],
            // Address Fields
            country: [this.user.address?.country || 'Tunisie'],
            state: [currentGovernorate],
            city: [this.user.address?.city || ''],
            street: [this.user.address?.street || ''],
            postalCode: [this.user.address?.postalCode || '']
        });

        // Load cities for the current governorate
        if (currentGovernorate) {
            this.cities = getCitiesForGovernorate(currentGovernorate);
        }

        this.isLoading = false;
    }

    onGovernorateChange() {
        const selectedGov = this.profileForm.get('state').value;
        this.cities = getCitiesForGovernorate(selectedGov);
        this.profileForm.get('city').setValue('');
    }

    save() {
        if (this.profileForm.invalid) return;

        this.isSaving = true;
        this.successMessage = '';
        this.errorMessage = '';

        const formValues = this.profileForm.getRawValue();
        const updateData = {
            ...this.user,
            firstName: formValues.firstName,
            lastName: formValues.lastName,
            phone: formValues.phone,
            address: {
                country: formValues.country,
                state: formValues.state,
                city: formValues.city,
                street: formValues.street,
                postalCode: formValues.postalCode
            }
        };

        this.authService.updateUser(updateData).subscribe({
            next: (res) => {
                this.isSaving = false;
                this.successMessage = 'Profil mis à jour avec succès !';
                setTimeout(() => this.successMessage = '', 4000);
            },
            error: (err) => {
                this.isSaving = false;
                this.errorMessage = 'Échec de la mise à jour du profil. Veuillez réessayer plus tard.';
                console.error(err);
                setTimeout(() => this.errorMessage = '', 5000);
            }
        });
    }
}
