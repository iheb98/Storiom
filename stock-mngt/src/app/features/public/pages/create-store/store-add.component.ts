import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { FileService } from 'src/app/core/services/file.service';

import { StoreService } from 'src/app/core/services/store.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { getAllGovernorates, getCitiesForGovernorate, getAllCities } from 'src/app/shared/data/tunisia-locations';
import {
  faStore, faRocket, faChartBar, faBoxes, faPhone, faEnvelope,
  faGlobe, faMap, faCity, faRoad, faImage, faCheck, faExclamationCircle,
  faCloudUploadAlt, faCheckCircle, faAlignLeft, faChevronDown
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-create-store',
  templateUrl: './store-add.component.html',
  styleUrls: ['./store-add.component.scss']
})
export class CreateStoreComponent implements OnInit {
  form: FormGroup;
  storeTypes = ['Boutique', 'Quincaillerie']
  selectedFileName: string = null;
  termsAccepted = false;
  showTermsModal = false;
  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;

  // Icons
  faStore = faStore;
  faRocket = faRocket;
  faChartBar = faChartBar;
  faBoxes = faBoxes;
  faPhone = faPhone;
  faEnvelope = faEnvelope;
  faGlobe = faGlobe;
  faMap = faMap;
  faCity = faCity;
  faRoad = faRoad;
  faImage = faImage;
  faCheck = faCheck;
  faExclamationCircle = faExclamationCircle;
  faCloudUploadAlt = faCloudUploadAlt;
  faCheckCircle = faCheckCircle;
  faAlignLeft = faAlignLeft;
  faChevronDown = faChevronDown;

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
    private formBuilder: FormBuilder,
    private service: StoreService,
    private fileService: FileService,
    private authService: AuthService,
    private router: Router,

    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    // Check if user already has a store
    const user = this.authService.getConnectedUser();
    if (user?.store) {
      this.router.navigate(['/admin/stores/view']);
      return;
    }
    this.initForm();
    this.initLocationData();
  }

  initForm() {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      storeType: ['Boutique', Validators.required],
      description: [''],
      phone: [''],
      email: [''],
      site: [''],
      country: ['Tunisie'],
      state: [''],
      city: [''],
      street: [''],
      postalCode: [''],
      logo: [null]
    });
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

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFileName = input.files[0].name;
    }
  }

  save() {
    let fileName = null;
    if (this.fileInput.nativeElement.files[0])
      fileName = this.authService.getConnectedUser().id + '-' + new Date().getTime() + this.fileInput.nativeElement.files[0]?.name.substring(this.fileInput.nativeElement.files[0].name.lastIndexOf('.'))
    if (this.form.valid) {

      if (this.fileInput.nativeElement.files[0])
        this.uploadLogo(this.fileInput.nativeElement.files[0], fileName).subscribe(
          response => {
            const logo = response.fileUrl.split('/').pop();
            this.service.addStore({ ...this.form.getRawValue(), logo: logo, userId: this.authService.getConnectedUser().id }).subscribe(
              response => {
                this.authService.refreshToken().subscribe(response => {
                  localStorage.setItem('accessToken', response.accessToken);

                  this.authService.loggedIn.next();
                  this.toastService.showSuccess('Boutique créée avec succès !');
                  setTimeout(() => {
                    this.router.navigate(['/admin/stores/view']);
                  }, 1000);
                })
              }
            )
          }
        )
      else
        this.service.addStore({ ...this.form.getRawValue(), userId: this.authService.getConnectedUser().id }).subscribe(
          response => {
            this.authService.refreshToken().subscribe(response => {
              localStorage.setItem('accessToken', response.accessToken);

              this.authService.loggedIn.next();
              this.toastService.showSuccess('Boutique créée avec succès !');
              setTimeout(() => {
                this.router.navigate(['/admin/stores/view']);
              }, 1000);
            })
          }
        )
    }
  }

  uploadLogo(imageBlob, fileName) {
    const file = new FormData();
    file.set('file', imageBlob, fileName)
    return this.fileService.uploadFile(file)
  }
}

