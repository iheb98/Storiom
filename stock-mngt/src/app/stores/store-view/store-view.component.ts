import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { LoadingService } from 'src/app/services/loading.service';
import { StoreService } from 'src/app/services/store.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-store-view',
  templateUrl: './store-view.component.html',
  styleUrls: ['./store-view.component.scss']
})
export class StoreViewComponent implements OnInit {
  store;
  backend_URL = environment.backend
  constructor(
    private authService: AuthService,
    private storeService: StoreService,
    private loadingService: LoadingService) { }

  ngOnInit(): void {
    this.loadingService.screenLoading()
    console.log("tessssssssssssss")
    this.storeService.getStore(this.authService.getConnectedUser()?.store).subscribe(
      store => {
        console.log("tessstttt")
        this.store = store
        this.loadingService.screenLoaded()
      }, error => {
        console.log("test");
        this.loadingService.screenLoaded()
        Swal.fire({
          icon: 'error',
          title: 'Une erreur est survenue ! Merci de réessayer plus tard',
          showConfirmButton: false,
          timer: 1500
        })
      }
    )
  }

}
