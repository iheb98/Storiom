import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  faStore, faEdit, faInfoCircle, faPhone, faEnvelope, faGlobe,
  faMapMarkerAlt, faMap, faCity, faRoad, faCog, faImage,
  faCloudUploadAlt, faEye, faTruck, faAlignLeft, faTimes,
  faPlus, faSave, faChevronDown, faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';
import { Store } from 'src/app/models/store';
import { AuthService } from 'src/app/core/services/auth.service';
import { FileService } from 'src/app/core/services/file.service';

import { StoreService } from 'src/app/core/services/store.service';
import { environment } from 'src/environments/environment';
import { getAllGovernorates, getCitiesForGovernorate, getAllCities } from 'src/app/shared/data/tunisia-locations';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-store-add',
  templateUrl: './store-add.component.html',
  styleUrls: ['./store-add.component.scss']
})
export class StoreAddComponent implements OnInit {
  store: Store;
  form: FormGroup;
  storeId: string;
  storeTypes = ['Boutique', 'Quincaillerie'];
  backend_URL = environment.backend;

  // Icons
  faStore = faStore;
  faEdit = faEdit;
  faInfoCircle = faInfoCircle;
  faPhone = faPhone;
  faEnvelope = faEnvelope;
  faGlobe = faGlobe;
  faMapMarkerAlt = faMapMarkerAlt;
  faMap = faMap;
  faCity = faCity;
  faRoad = faRoad;
  faCog = faCog;
  faImage = faImage;
  faCloudUploadAlt = faCloudUploadAlt;
  faEye = faEye;
  faTruck = faTruck;
  faAlignLeft = faAlignLeft;
  faTimes = faTimes;
  faPlus = faPlus;
  faSave = faSave;
  faChevronDown = faChevronDown;
  faExclamationCircle = faExclamationCircle;

  // File upload
  selectedFileName: string = '';
  logoPreview: string = null;

  // Autocomplete for address
  governorateSearchText = '';
  citySearchText = '';
  availableGovernorates: string[] = [];
  availableCities: string[] = [];
  filteredGovernorates: string[] = [];
  filteredCities: string[] = [];
  showGovernorateSuggestions = false;
  showCitySuggestions = false;

  // Loading States
  isLoading = false;
  isSubmitting = false;

  // Quill Editor Config
  quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'align': [] }],
      ['link'],
      ['clean']
    ]
  };

  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;

  constructor(
    private formBuilder: FormBuilder,
    private service: StoreService,
    private fileService: FileService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,

  ) { }

  ngOnInit(): void {
    this.initForm();
    this.initLocationData();

    this.route.paramMap.subscribe(paramMap => {
      this.storeId = paramMap.get('id');
      if (this.storeId) {
        this.loadStore();
      }
    });
  }

  initLocationData() {
    this.availableGovernorates = getAllGovernorates();
    this.filteredGovernorates = [...this.availableGovernorates];
    this.availableCities = getAllCities();
    this.filteredCities = [...this.availableCities];
  }

  loadStore() {
    this.isLoading = true;
    this.service.getStore(this.storeId).subscribe(
      response => {
        this.store = response;
        this.form.patchValue({
          name: response?.name,
          description: response?.description,
          phone: response?.phone,
          email: response?.email,
          site: response?.site,
          country: response?.address?.country,
          state: response?.address?.state,
          city: response?.address?.city,
          street: response?.address?.street,
          postalCode: response?.address?.postalCode,
          logo: response?.logo,
          isVisibleToPublic: response?.isVisibleToPublic,
          isSupportingDeliveries: response?.isSupportingDeliveries
        });

        // Set autocomplete text values
        this.governorateSearchText = response?.address?.state || '';
        this.citySearchText = response?.address?.city || '';

        // Update available cities based on governorate
        if (this.governorateSearchText) {
          this.availableCities = getCitiesForGovernorate(this.governorateSearchText);
          this.filteredCities = [...this.availableCities];
        }
        this.isLoading = false;
      },
      error => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Erreur lors du chargement de la boutique',
          showConfirmButton: false,
          timer: 2000
        });
      }
    );
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
      logo: [null],
      isVisibleToPublic: [true],
      isSupportingDeliveries: [false]
    });
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

  // ========================================
  // File Upload
  // ========================================
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.selectedFileName = file.name;

      const reader = new FileReader();
      reader.onload = (e) => {
        this.logoPreview = e.target.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  // ========================================
  // Save / Edit
  // ========================================
  save() {
    let fileName = null;
    if (this.fileInput.nativeElement.files[0]) {
      fileName = this.authService.getConnectedUser().id + '-' + new Date().getTime() +
        this.fileInput.nativeElement.files[0]?.name.substring(
          this.fileInput.nativeElement.files[0].name.lastIndexOf('.')
        );
    }

    if (this.form.valid) {
      this.isSubmitting = true;

      if (this.fileInput.nativeElement.files[0]) {
        this.uploadLogo(this.fileInput.nativeElement.files[0], fileName).subscribe(
          response => {
            const logo = response.fileUrl.split('/').pop();
            this.service.addStore({
              ...this.form.getRawValue(),
              logo: logo,
              userId: this.authService.getConnectedUser().id
            }).subscribe(
              response => {
                this.authService.refreshToken().subscribe(response => {
                  localStorage.setItem('accessToken', response.accessToken);
                  this.authService.loggedIn.next();
                  this.isSubmitting = false;
                  Swal.fire({
                    icon: 'success',
                    title: 'Boutique créée !',
                    showConfirmButton: false,
                    timer: 1500
                  });
                  setTimeout(() => {
                    this.router.navigate(['admin/stores/view']);
                  }, 1000);
                });
              },
              error => {
                this.isSubmitting = false;
                Swal.fire({
                  icon: 'error',
                  title: 'Erreur lors de la création',
                  showConfirmButton: false,
                  timer: 1500
                });
              }
            );
          },
          error => {
            this.isSubmitting = false;
            Swal.fire({
              icon: 'error',
              title: 'Erreur lors de l\'upload du logo',
              showConfirmButton: false,
              timer: 1500
            });
          }
        );
      } else {
        this.service.addStore({
          ...this.form.getRawValue(),
          userId: this.authService.getConnectedUser().id
        }).subscribe(
          response => {
            this.authService.refreshToken().subscribe(response => {
              localStorage.setItem('accessToken', response.accessToken);
              this.authService.loggedIn.next();
              this.isSubmitting = false;
              Swal.fire({
                icon: 'success',
                title: 'Boutique créée !',
                showConfirmButton: false,
                timer: 1500
              });
              setTimeout(() => {
                this.router.navigate(['admin/stores/view']);
              }, 1000);
            });
          },
          error => {
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

  edit() {
    let fileName = null;
    if (this.fileInput.nativeElement.files[0]) {
      fileName = this.authService.getConnectedUser().id + '-' + new Date().getTime() +
        this.fileInput.nativeElement.files[0]?.name.substring(
          this.fileInput.nativeElement.files[0].name.lastIndexOf('.')
        );
    }

    if (this.form.valid) {
      this.isSubmitting = true;

      if (this.fileInput.nativeElement.files[0]) {
        this.uploadLogo(this.fileInput.nativeElement.files[0], fileName).subscribe(
          response => {
            const logo = response.fileUrl.split('/').pop();
            this.service.updateStore({
              ...this.form.getRawValue(),
              id: this.store.id,
              logo: logo,
              userId: this.authService.getConnectedUser().id
            }).subscribe(
              response => {
                this.isSubmitting = false;
                this.service.notifyStoreUpdate();
                Swal.fire({
                  icon: 'success',
                  title: 'Boutique modifiée !',
                  showConfirmButton: false,
                  timer: 1500
                });
                this.router.navigate(['admin/stores/view']);
              },
              error => {
                this.isSubmitting = false;
                Swal.fire({
                  icon: 'error',
                  title: 'Erreur lors de la modification',
                  showConfirmButton: false,
                  timer: 1500
                });
              }
            );
          },
          error => {
            this.isSubmitting = false;
            Swal.fire({
              icon: 'error',
              title: 'Erreur lors de l\'upload du logo',
              showConfirmButton: false,
              timer: 1500
            });
          }
        );
      } else {
        this.service.updateStore({
          ...this.form.getRawValue(),
          id: this.store.id,
          userId: this.authService.getConnectedUser().id
        }).subscribe(
          response => {
            this.isSubmitting = false;
            this.service.notifyStoreUpdate();
            Swal.fire({
              icon: 'success',
              title: 'Boutique modifiée !',
              showConfirmButton: false,
              timer: 1500
            });
            this.router.navigate(['admin/stores/view']);
          },
          error => {
            this.isSubmitting = false;
            Swal.fire({
              icon: 'error',
              title: 'Erreur lors de la modification',
              showConfirmButton: false,
              timer: 1500
            });
          }
        );
      }
    }
  }

  uploadLogo(imageBlob: File, fileName: string) {
    const file = new FormData();
    file.set('file', imageBlob, fileName);
    return this.fileService.uploadFile(file);
  }
}
