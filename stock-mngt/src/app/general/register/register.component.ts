import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TermsComponent } from 'src/app/pages/terms/terms.component';
import { AuthService } from 'src/app/core/services/auth.service';
import { getAllGovernorates, getCitiesForGovernorate, getAllCities } from 'src/app/shared/data/tunisia-locations';

import Swal from 'sweetalert2';
import {
  faStore,
  faRocket,
  faShieldAlt,
  faUser,
  faEnvelope,
  faPhone,
  faLock,
  faArrowRight,
  faFileContract,
  faTimes,
  faCheck,
  faMapMarkerAlt,
  faChevronDown,
  faChevronUp
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  // Icons
  faStore = faStore;
  faRocket = faRocket;
  faShieldAlt = faShieldAlt;
  faUser = faUser;
  faEnvelope = faEnvelope;
  faPhone = faPhone;
  faLock = faLock;
  faArrowRight = faArrowRight;
  faFileContract = faFileContract;
  faTimes = faTimes;
  faCheck = faCheck;
  faMapMarkerAlt = faMapMarkerAlt;
  faChevronDown = faChevronDown;
  faChevronUp = faChevronUp;

  form: FormGroup;
  submitted: boolean;
  emailError: boolean;
  emailFound: boolean;
  passwordError: boolean;
  confirmPasswordError: boolean;
  showAddressSection = false;
  isLoading = false;

  // Autocomplete for address
  governorateSearchText = '';
  citySearchText = '';
  availableGovernorates: string[] = [];
  availableCities: string[] = [];
  filteredGovernorates: string[] = [];
  filteredCities: string[] = [];
  showGovernorateSuggestions = false;
  showCitySuggestions = false;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.initForm();
    this.initLocationData();
  }

  initForm() {
    this.form = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")]],
      phone: [''],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      termsAccepted: [false, Validators.required],
      country: ['Tunisie'],
      state: [''],
      city: [''],
      street: [''],
      postalCode: ['']
    })
  }

  initLocationData() {
    this.availableGovernorates = getAllGovernorates();
    this.filteredGovernorates = [...this.availableGovernorates];
    this.availableCities = getAllCities();
    this.filteredCities = [...this.availableCities];
  }

  // ========================================
  // Governorate Autocomplete
  // ========================================
  normalizeText(text: string): string {
    return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  onGovernorateSearch() {
    const searchTerm = this.normalizeText(this.governorateSearchText.trim());
    if (!searchTerm) {
      this.filteredGovernorates = [...this.availableGovernorates];
      this.form.patchValue({ state: '' });
      this.availableCities = getAllCities();
      this.filteredCities = [...this.availableCities];
    } else {
      this.filteredGovernorates = this.availableGovernorates.filter(gov =>
        this.normalizeText(gov).includes(searchTerm)
      );
    }
    this.showGovernorateSuggestions = true;
  }

  selectGovernorate(governorate: string) {
    this.governorateSearchText = governorate;
    this.form.patchValue({ state: governorate });
    this.showGovernorateSuggestions = false;

    // Update cities based on selected governorate
    this.availableCities = getCitiesForGovernorate(governorate);
    this.filteredCities = [...this.availableCities];
    this.citySearchText = '';
    this.form.patchValue({ city: '' });
  }

  toggleGovernorateSuggestions() {
    this.showGovernorateSuggestions = !this.showGovernorateSuggestions;
    if (this.showGovernorateSuggestions) {
      this.filteredGovernorates = [...this.availableGovernorates];
    }
  }

  hideGovernorateSuggestionsDelayed() {
    setTimeout(() => {
      this.showGovernorateSuggestions = false;
    }, 200);
  }

  // ========================================
  // City Autocomplete
  // ========================================
  onCitySearch() {
    const searchTerm = this.normalizeText(this.citySearchText.trim());
    if (!searchTerm) {
      this.filteredCities = [...this.availableCities];
      this.form.patchValue({ city: '' });
    } else {
      this.filteredCities = this.availableCities.filter(city =>
        this.normalizeText(city).includes(searchTerm)
      );
    }
    this.showCitySuggestions = true;
  }

  selectCity(city: string) {
    this.citySearchText = city;
    this.form.patchValue({ city: city });
    this.showCitySuggestions = false;
  }

  toggleCitySuggestions() {
    this.showCitySuggestions = !this.showCitySuggestions;
    if (this.showCitySuggestions) {
      this.filteredCities = [...this.availableCities];
    }
  }

  hideCitySuggestionsDelayed() {
    setTimeout(() => {
      this.showCitySuggestions = false;
    }, 200);
  }

  register() {
    this.submitted = true;
    this.emailError = false;
    this.passwordError = false;
    if (this.form.valid && this.form.get('termsAccepted').value) {
      this.isLoading = true;

      this.authService.registerUser({ ...this.form.getRawValue(), confirmPassword: undefined })
        .subscribe(response => {

          if (response.errorType == "EMAIL_FOUND") {
            this.emailFound = true;
            this.isLoading = false;
            Swal.fire({
              icon: 'error',
              title: `Cette adresse e-mail est déjà utilisée. Veuillez en choisir une autre ou vous connecter à votre compte existant.`,
              showConfirmButton: false,
              timer: 3000
            })
          }
          else if (response.success) {
            this.authService.registerTokens(response.accessToken, response.refreshToken)
            this.authService.loggedIn.next();
            Swal.fire({
              icon: 'success',
              title: `Merci de confirmer votre compte. Un mail contenant le lien de vérification a été envoyé`,
              showConfirmButton: false,
              timer: 6000
            })
            this.router.navigate([''])
          }
        }, error => {
          this.isLoading = false;
          Swal.fire({
            icon: 'error',
            title: 'Une erreur est survenue ! Merci de réessayer plus tard',
            showConfirmButton: false,
            timer: 1500
          })
        })
    }
  }
  showTermsModal = false;

  openTermsDialog(event: Event): void {
    event.preventDefault();
    this.showTermsModal = true;
  }
}

