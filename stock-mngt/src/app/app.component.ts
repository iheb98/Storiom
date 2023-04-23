import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { faNode } from '@fortawesome/free-brands-svg-icons';
import { faArrowAltCircleRight, faChartBar } from '@fortawesome/free-regular-svg-icons';
import { faPowerOff, faHome, faStore, faUser, faCodeBranch, faHandHoldingUsd, faCoins, faShuttleVan, faBox, faReceipt } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from './services/auth.service';
import { ListenerService } from './services/listener.service';
import { LoadingService } from './services/loading.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  storeIcon = faStore
  homeIcon = faHome
  powerIcon = faPowerOff
  userIcon = faUser
  categoryIcon = faCodeBranch
  statsIcon = faChartBar
  title = 'stock-mngt';
  opened = false;
  connectedUser;
  menu;

  constructor(private authService: AuthService, private router: Router,public loadingService: LoadingService) {
  }
  ngOnInit() {
    this.connectedUser = this.authService.getConnectedUser()
    this.setMenu()
  }
  logout() {
    this.authService.logout().subscribe(response => {
      this.connectedUser = this.authService.getConnectedUser()
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("accessToken")
      this.router.navigate(['login'])
    })
  }

  setMenu() {
    this.menu = [{
      label: 'Accueil',
      icon: this.homeIcon,
      link: '',
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
      link: 'statistics',
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
    }]
  }

}
