import { Component, OnInit } from '@angular/core';
import { faArrowAltCircleRight } from '@fortawesome/free-regular-svg-icons';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { faEdit, faPlus } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/services/auth.service';
import { ListenerService } from 'src/app/services/listener.service';
import { StoreService } from 'src/app/services/store.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-stores-mngt',
  templateUrl: './stores-mngt.component.html',
  styleUrls: ['./stores-mngt.component.scss']
})
export class StoresMngtComponent implements OnInit {
  faArrowAltCircleRight = faArrowAltCircleRight;
  faDelete = faTrash;
  faEdit = faEdit;
  faPlus = faPlus
  stores$;
  backend_URL = environment.backend
  constructor(private storeService: StoreService, private authService: AuthService, private listener: ListenerService) { }

  ngOnInit(): void {
    
    this.getStores()
  }

  deleteStore(id) {
    this.storeService.deleteStore(id).subscribe(
      response => {
        this.getStores();
      }
    )
  }

  getStores() {
    this.stores$ = this.storeService.getStoresByUserId(this.authService.getConnectedUser().id)
  }

  selectStore(store) {
    localStorage.setItem("selectedStore", store?.id)
    this.listener.selectStore.next(store);
  }

}
