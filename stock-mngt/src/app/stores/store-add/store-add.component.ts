import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Form, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from 'src/app/models/store';
import { AuthService } from 'src/app/services/auth.service';
import { FileService } from 'src/app/services/file.service';
import { StoreService } from 'src/app/services/store.service';

@Component({
  selector: 'app-store-add',
  templateUrl: './store-add.component.html',
  styleUrls: ['./store-add.component.scss']
})
export class StoreAddComponent implements OnInit {
  store: Store;
  form: FormGroup;
  storeId
  storeTypes = ['Boutique', 'Quincaillerie']
  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;
  constructor(private formBuilder: FormBuilder,
    private service: StoreService,
    private fileService: FileService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.initForm();
    this.route.paramMap.subscribe(paramMap => {
      this.storeId = paramMap.get('id');
    })
    if (this.storeId) {
      this.service.getStore(this.storeId).subscribe(
        response => {
          this.store = response
          this.form.get('name').setValue(response?.name)
          this.form.get('description').setValue(response?.description)
          this.form.get('phone').setValue(response?.phone)
          this.form.get('email').setValue(response?.email)
          this.form.get('site').setValue(response?.site)
          this.form.get('country').setValue(response?.address?.country)
          this.form.get('state').setValue(response?.address?.state)
          this.form.get('city').setValue(response?.address?.city)
          this.form.get('street').setValue(response?.address?.street)
          this.form.get('postalCode').setValue(response?.address?.postalCode)
          this.form.get('logo').setValue(response?.logo)
        })
    }
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
                  this.router.navigate(['stores/view'])
                })
              }
            )
          }
        )
      else
        this.authService.refreshToken().subscribe(response => {
          localStorage.setItem('accessToken', response.accessToken);
          this.authService.loggedIn.next();
          this.router.navigate(['stores/view'])
        })

    }
  }

  edit() {
    let fileName = null;
    if (this.fileInput.nativeElement.files[0])
      fileName = this.authService.getConnectedUser().id + '-' + new Date().getTime() + this.fileInput.nativeElement.files[0]?.name.substring(this.fileInput.nativeElement.files[0].name.lastIndexOf('.'))
    if (this.form.valid) {
      if (this.fileInput.nativeElement.files[0])
        this.uploadLogo(this.fileInput.nativeElement.files[0], fileName).subscribe(
          response => {
            const logo = response.fileUrl.split('/').pop();
            this.service.updateStore({ ...this.form.getRawValue(), id: this.store.id, logo: logo, userId: this.authService.getConnectedUser().id }).subscribe(
              response => {
                this.router.navigate(['stores/view'])
              }
            )
          }
        )
      else
        this.service.updateStore({ ...this.form.getRawValue(), id: this.store.id, userId: this.authService.getConnectedUser().id }).subscribe(
          response => {
            this.router.navigate(['stores/view'])
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
