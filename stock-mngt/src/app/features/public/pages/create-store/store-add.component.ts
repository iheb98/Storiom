import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { FileService } from 'src/app/core/services/file.service';

import { StoreService } from 'src/app/core/services/store.service';
import { ToastService } from 'src/app/core/services/toast.service';
import {
  faStore, faRocket, faChartBar, faBoxes, faPhone, faEnvelope,
  faGlobe, faMap, faCity, faRoad, faImage, faCheck, faExclamationCircle,
  faCloudUploadAlt, faCheckCircle, faAlignLeft
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

