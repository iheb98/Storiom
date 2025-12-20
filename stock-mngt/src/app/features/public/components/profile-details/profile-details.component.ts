import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/core/services/auth.service';
import { TUNISIA_LOCATIONS, getAllGovernorates, getCitiesForGovernorate } from 'src/app/shared/data/tunisia-locations';

@Component({
    selector: 'app-profile-details',
    templateUrl: './profile-details.component.html',
    styleUrls: ['./profile-details.component.scss']
})
export class ProfileDetailsComponent implements OnInit {

    @Input() user: any;
    profileForm: FormGroup;
    isSaving = false;
    successMessage = '';
    errorMessage = '';

    // Location options
    governorates: string[] = [];
    cities: string[] = [];

    constructor(
        private fb: FormBuilder,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.governorates = getAllGovernorates();
        this.initForm();
    }

    initForm() {
        const currentGovernorate = this.user.address?.state || '';

        this.profileForm = this.fb.group({
            firstName: [this.user.firstName, [Validators.required]],
            lastName: [this.user.lastName, [Validators.required]],
            email: [{ value: this.user.email, disabled: true }], // Email usually immutable or requires special flow
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
    }

    onGovernorateChange() {
        const selectedGov = this.profileForm.get('state').value;
        this.cities = getCitiesForGovernorate(selectedGov);
        this.profileForm.get('city').setValue(''); // Reset city when governorate changes
    }

    save() {
        if (this.profileForm.invalid) return;

        this.isSaving = true;
        this.successMessage = '';
        this.errorMessage = '';

        const formValues = this.profileForm.getRawValue();
        const updateData = {
            ...this.user, // exist data
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
                // Update local user reference if needed, ideally re-fetch or update subject
                setTimeout(() => this.successMessage = '', 3000);
            },
            error: (err) => {
                this.isSaving = false;
                this.errorMessage = 'Échec de la mise à jour du profil. Veuillez réessayer plus tard.';
                console.error(err);
            }
        });
    }
}
