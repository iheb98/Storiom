import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Form, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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
  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;
  constructor(private formBuilder: FormBuilder,
    private service: StoreService,
    private fileService: FileService,
    private authService: AuthService,
    private router: Router) {
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      description: [''],
      logo: [null]
    });
  }

  save() {
    let fileName = null;
    if (this.fileInput.nativeElement.files[0])
      fileName = this.authService.getConnectedUser().id + '-' + new Date().getTime() + this.fileInput.nativeElement.files[0]?.name.substring(this.fileInput.nativeElement.files[0].name.lastIndexOf('.'))
    if (this.form.valid) {
      this.service.addStore({ ...this.form.getRawValue(), logo: fileName, userId: this.authService.getConnectedUser().id }).subscribe(
        response => {
          if (this.fileInput.nativeElement.files[0])
            this.uploadLogo(this.fileInput.nativeElement.files[0], fileName).subscribe(
              response => {
                this.authService.refreshToken().subscribe(response => {
                  localStorage.setItem('accessToken', response.accessToken);
                  this.router.navigate([''])
                })
              }
            )
          else
            this.authService.refreshToken().subscribe(response => {
              localStorage.setItem('accessToken', response.accessToken);
              this.router.navigate([''])
            })
        }
      )
    } else {

    }
  }


  uploadLogo(imageBlob, fileName) {
    const file = new FormData();
    file.set('file', imageBlob, fileName)
    return this.fileService.uploadFile(file)
  }
}
