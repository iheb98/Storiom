import { Component, OnInit } from '@angular/core';
import { faEdit, faInfo } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/core/services/auth.service';
import { LoadingService } from 'src/app/core/services/loading.service';
import { StoreService } from 'src/app/core/services/store.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-store-view',
  templateUrl: './store-view.component.html',
  styleUrls: ['./store-view.component.scss']
})
export class StoreViewComponent implements OnInit {
  store;
  storeWebsite;
  backend_URL = environment.backend
  editIcon = faEdit
  infoIcon = faInfo
  selectedImage: string | null = null;

  constructor(
    private authService: AuthService,
    private storeService: StoreService,
    private loadingService: LoadingService) { }

  ngOnInit(): void {
    this.loadingService.screenLoading()
    this.storeService.getStore(this.authService.getConnectedUser()?.store).subscribe(
      store => {
        this.store = store
        this.storeWebsite = this.fillLink(this.store?.site)
        this.loadingService.screenLoaded()
      }, error => {
        this.loadingService.screenLoaded()
        Swal.fire({
          icon: 'error',
          title: error?.error?.message ? error?.error?.message : 'Une erreur est survenue ! Merci de réessayer plus tard',
          showConfirmButton: false,
          timer: 1500
        })
      }
    )
  }

  fillLink(link) {
    console.log(link)
    if (link != null) {
      if (link.indexOf('http://') == -1 && link.indexOf('https://') == -1) {
        return 'http://' + link
      }
      return link
    }
    return null
  }
  openImage(image: string) {
    this.selectedImage = image;
  }

  closeImage() {
    this.selectedImage = null;
  }
}
