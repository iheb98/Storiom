import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { faNode } from '@fortawesome/free-brands-svg-icons';
import { faArrowAltCircleRight, faChartBar } from '@fortawesome/free-regular-svg-icons';
import { faPowerOff, faHome, faStore, faUser, faCodeBranch, faHandHoldingUsd, faCoins, faShuttleVan, faBox, faReceipt, faImage, faFile } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from './services/auth.service';
import { ListenerService } from './services/listener.service';
import { LoadingService } from './services/loading.service';
import { StoreService } from './services/store.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  backend_URL = environment.backend
  storeIcon = faStore
  homeIcon = faHome
  powerIcon = faPowerOff
  userIcon = faUser
  categoryIcon = faCodeBranch
  statsIcon = faChartBar
  title = 'stock-mngt';
  opened = false;
  connectedUser;
  store;
  menu;

  constructor(
    private authService: AuthService,
    private router: Router,
    public loadingService: LoadingService,
    public storeService: StoreService
  ) {
  }
  ngOnInit() {
    this.connectedUser = this.authService.getConnectedUser()
    console.log(this.connectedUser?.store)
    this.setMenu()
    console.log(this.connectedUser)
    this.authService.loggedIn.subscribe(response => {
      this.connectedUser = this.authService.getConnectedUser()
      console.log(this.connectedUser)
    })
    this.storeService.getStore(this.authService.getConnectedUser()?.store).subscribe(
      store => {
        this.store = store
        this.loadingService.screenLoaded()
      }, error => {
        this.loadingService.screenLoaded()
      }
    )
  }
  logout() {
    this.authService.logout().subscribe(response => {
      this.connectedUser = null
      this.opened = false
      console.log(this.connectedUser)
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("accessToken")
      this.router.navigate(['login'])
    })
  }

  setMenu() {
    this.menu = [{
      label: 'Accueil',
      icon: this.homeIcon,
      link: 'stores/view',
    },
    {
      label: 'Catégories',
      icon: this.categoryIcon,
      link: 'categories',
    },
    {
      label: 'Fournisseurs',
      icon: faShuttleVan,
      link: 'suppliers',
    },
    {
      label: 'Marques',
      icon: faImage,
      link: 'brands',
    },
    {
      label: 'Produits',
      icon: faBox,
      link: 'products',
    },
    {
      label: 'Factures',
      icon: faReceipt,
      link: 'receipts',
    }
      ,
    {
      label: 'Travailleurs',
      icon: this.userIcon,
      link: 'workers',
    }
      ,
    {
      label: 'Statistiques',
      icon: this.statsIcon,
      link: 'dashboard',
    }
      ,
    {
      label: 'Dépenses',
      icon: faCoins,
      link: 'expenses',
    },
    {
      label: 'Crédits',
      icon: faHandHoldingUsd,
      link: 'credits',
    },
    {
      label: 'Rapport',
      icon: faFile,
      link: 'reports/generate',
    }
    ]
  }

}
