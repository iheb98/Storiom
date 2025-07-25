import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { faBuyNLarge, faNode } from '@fortawesome/free-brands-svg-icons';
import { faArrowAltCircleRight, faChartBar } from '@fortawesome/free-regular-svg-icons';
import { faPowerOff, faHome, faStore, faUser, faCodeBranch, faHandHoldingUsd, faCoins, faShuttleVan, faBox, faReceipt, faImage, faFile, faWindowRestore } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from './services/auth.service';
import { ListenerService } from './services/listener.service';
import { LoadingService } from './services/loading.service';
import { StoreService } from './services/store.service';
import { environment } from 'src/environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { SubscriptionComponent } from './general/subscription/subscription.component';

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
  subscriptionStatus: string | null = null;
  subscriptionDetails: any = null;
  showTooltip = false; // Controls tooltip visibility


  constructor(
    private authService: AuthService,
    private router: Router,
    public loadingService: LoadingService,
    public storeService: StoreService,
    private dialog: MatDialog
  ) {
    console.log("constructor loaded")
    this.authService.loggedIn.subscribe(response => {
      console.log("Test 1")
      this.subscriptionDetails = this.authService.getConnectedUser()?.subscription;
      console.log("Test 2")
      this.checkSubscriptionStatus(this.authService.getConnectedUser()?.subscription)
      console.log("Test 3")

      this.connectedUser = this.authService.getConnectedUser()
      console.log("Test 4")

      console.log(this.connectedUser)
      this.storeService.getStore(this.authService.getConnectedUser()?.store).subscribe(
        store => {
          console.log("Test 5")
          this.store = store
          console.log("Test 6")
          this.loadingService.screenLoaded()
        }, error => {
          this.loadingService.screenLoaded()
        }
      )
    })
  }
  ngOnInit() {
    this.connectedUser = this.authService.getConnectedUser()
    this.authService.checkSubscription(this.authService.getConnectedUser()?.id).subscribe(isExpired => {
      if (isExpired) {
        this.dialog.open(SubscriptionComponent, {
          width: '400px'
        });
      }
    }, error => {

    })
    this.setMenu()
    console.log(this.authService.getConnectedUser())

    this.storeService.getStore(this.authService.getConnectedUser()?.store).subscribe(
      store => {
        this.store = store
        this.loadingService.screenLoaded()
      }, error => {
        this.loadingService.screenLoaded()
      }
    )

    this.subscriptionDetails = this.authService.getConnectedUser()?.subscription;
    this.checkSubscriptionStatus(this.authService.getConnectedUser()?.subscription)
  }
  logout() {
    this.authService.logout().subscribe(response => {
      this.connectedUser = null
      this.subscriptionStatus = null
      this.store = null
      this.opened = false
      console.log(this.connectedUser)
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("accessToken")
      this.router.navigate(['login'])
    })
  }

  checkSubscriptionStatus(subscription: any) {
    const { activationDate, expirationDate, duration } = subscription;
    let calculatedExpirationDate = expirationDate ? new Date(expirationDate) : new Date(activationDate);

    if (!expirationDate) {
      const durationMapping: { [key: string]: number } = {
        "TRIAL": 30,
        "1M": 30,
        "3M": 90,
        "6M": 180,
        "12M": 365
      };
      calculatedExpirationDate.setDate(calculatedExpirationDate.getDate() + (durationMapping[duration] || 0));
    }

    this.subscriptionStatus = new Date() > calculatedExpirationDate ? 'Expired' : 'Active';
    this.subscriptionDetails.expirationDate = calculatedExpirationDate.toISOString();
  }

  getSubscriptionTooltip(): string {
    if (!this.subscriptionDetails) return "No subscription details available.";

    const { activationDate, expirationDate, duration, paymentDate } = this.subscriptionDetails;

    return `Abonnement valide du ${new Date(activationDate).toLocaleDateString()} au ${new Date(expirationDate).toLocaleDateString()}`;
    //Payment: ${paymentDate ? new Date(paymentDate).toLocaleDateString() : "Not paid"}`;
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
      label: 'Marques',
      icon: faImage,
      link: 'brands',
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
      label: 'Operations',
      icon: faWindowRestore,
      link: 'operations',
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
