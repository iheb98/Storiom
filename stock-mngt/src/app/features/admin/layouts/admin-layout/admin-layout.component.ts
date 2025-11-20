import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { faChartBar } from '@fortawesome/free-regular-svg-icons';
import {
  faPowerOff, faHome, faStore, faUser, faCodeBranch, faHandHoldingUsd,
  faCoins, faShuttleVan, faBox, faReceipt, faImage, faFile, faWindowRestore, faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../../../core/services/auth.service';
import { LoadingService } from '../../../../core/services/loading.service';
import { StoreService } from '../../../../core/services/store.service';
import { environment } from 'src/environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { SubscriptionComponent } from '../../../../general/subscription/subscription.component';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent implements OnInit {
  backend_URL = environment.backend;
  storeIcon = faStore;
  homeIcon = faHome;
  powerIcon = faPowerOff;
  userIcon = faUser;
  categoryIcon = faCodeBranch;
  statsIcon = faChartBar;
  opened = false;

  connectedUser: any;
  store: any;
  menu: Array<any> = [];

  subscriptionStatus: string | null = null;
  subscriptionDetails: any = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    public loadingService: LoadingService,
    public storeService: StoreService,
    private dialog: MatDialog
  ) {
    this.authService.loggedIn.subscribe(() => {
      this.subscriptionDetails = this.authService.getConnectedUser()?.subscription;
      this.checkSubscriptionStatus(this.subscriptionDetails);

      this.connectedUser = this.authService.getConnectedUser();

      this.storeService.getStore(this.authService.getConnectedUser()?.store).subscribe(
        store => {
          this.store = store;
          this.loadingService.screenLoaded();
        },
        _ => this.loadingService.screenLoaded()
      );
    });
  }

  ngOnInit(): void {
    this.connectedUser = this.authService.getConnectedUser();

    this.authService.checkSubscription(this.authService.getConnectedUser()?.id).subscribe(isExpired => {
      if (isExpired) {
        this.dialog.open(SubscriptionComponent, { width: '400px' });
      }
    }, _ => {});

    this.setMenu();

    this.storeService.getStore(this.authService.getConnectedUser()?.store).subscribe(
      store => {
        this.store = store;
        this.loadingService.screenLoaded();
      },
      _ => this.loadingService.screenLoaded()
    );

    this.subscriptionDetails = this.authService.getConnectedUser()?.subscription;
    if (this.subscriptionDetails) {
      this.checkSubscriptionStatus(this.subscriptionDetails);
    }
  }

  logout() {
    this.authService.logout().subscribe(_ => {
      this.connectedUser = null;
      this.subscriptionStatus = null;
      this.store = null;
      this.opened = false;
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('accessToken');
      this.router.navigate(['login']);
    });
  }

  checkSubscriptionStatus(subscription: any) {
    if (!subscription) {
      this.subscriptionStatus = null;
      return;
    }

    const { activationDate, expirationDate, duration } = subscription;
    let calculatedExpirationDate = expirationDate ? new Date(expirationDate) : new Date(activationDate);

    if (!expirationDate) {
      const durationMapping: { [key: string]: number } = {
        TRIAL: 30, '1M': 30, '3M': 90, '6M': 180, '12M': 365
      };
      calculatedExpirationDate.setDate(
        calculatedExpirationDate.getDate() + (durationMapping[duration] || 0)
      );
    }

    this.subscriptionStatus = new Date() > calculatedExpirationDate ? 'Expired' : 'Active';
    // keep a normalized expirationDate for the tooltip
    this.subscriptionDetails.expirationDate = calculatedExpirationDate.toISOString();
  }

  getSubscriptionTooltip(): string {
    if (!this.subscriptionDetails) return 'No subscription details available.';

    const { activationDate, expirationDate } = this.subscriptionDetails;
    return `Abonnement valide du ${new Date(activationDate).toLocaleDateString()} au ${new Date(expirationDate).toLocaleDateString()}`;
  }

  categories: any[] = [
    {
      name: 'Electronics',
      subcategories: [
        {
          name: 'Phones',
          subcategories: [
            { id: 111, name: 'Smartphones' },
            { id: 112, name: 'Feature Phones' }
          ]
        },
        {
          name: 'Laptops',
          subcategories: [
            { id: 121, name: 'Gaming Laptops' },
            { id: 122, name: 'Ultrabooks' }
          ]
        }
      ]
    },
    {
      name: 'Fashion',
      subcategories: [
        {
          name: 'Men',
          subcategories: [
            { id: 211, name: 'Shirts' },
            { id: 212, name: 'Shoes' }
          ]
        },
        {
          name: 'Women',
          subcategories: [
            { id: 221, name: 'Dresses' },
            { id: 222, name: 'Bags' }
          ]
        }
      ]
    }
  ];


  setMenu() {
    this.menu = [
      { label: 'Boutique', icon: faInfoCircle, link: 'admin/stores/view' },
      { label: 'Catégories', icon: this.categoryIcon, link: 'admin/categories' },
      { label: 'Marques', icon: faImage, link: 'admin/brands' },
      { label: 'Fournisseurs', icon: faShuttleVan, link: 'admin/suppliers' },
      { label: 'Produits', icon: faBox, link: 'admin/products' },
      { label: 'Factures', icon: faReceipt, link: 'admin/receipts' },
      { label: 'Operations', icon: faWindowRestore, link: 'admin/operations' },
      { label: 'Travailleurs', icon: this.userIcon, link: 'admin/workers' },
      { label: 'Statistiques', icon: this.statsIcon, link: 'admin/dashboard' },
      { label: 'Dépenses', icon: faCoins, link: 'admin/expenses' },
      { label: 'Crédits', icon: faHandHoldingUsd, link: 'admin/credits' },
      { label: 'Rapport', icon: faFile, link: 'admin/reports/generate' }
    ];
  }
}
