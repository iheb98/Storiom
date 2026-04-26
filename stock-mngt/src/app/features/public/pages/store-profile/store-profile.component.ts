import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StoreAuthService, StoreCustomer } from 'src/app/core/services/store-auth.service';
import { DomainService } from 'src/app/core/services/domain.service';
import { environment } from 'src/environments/environment';
import { Subscription } from 'rxjs';
import {
  faUser, faShoppingBag, faLock, faSignOutAlt, faEdit, faSave,
  faTimes, faChevronRight, faBox, faCalendar, faMapMarkerAlt,
  faPhone, faEnvelope, faCheck, faEye
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-store-profile',
  templateUrl: './store-profile.component.html',
  styleUrls: ['./store-profile.component.scss']
})
export class StoreProfileComponent implements OnInit, OnDestroy {
  // Icons
  faUser = faUser; faShoppingBag = faShoppingBag; faLock = faLock;
  faSignOut = faSignOutAlt; faEdit = faEdit; faSave = faSave;
  faTimes = faTimes; faChevronRight = faChevronRight; faBox = faBox;
  faCalendar = faCalendar; faMapMarkerAlt = faMapMarkerAlt;
  faPhone = faPhone; faEnvelope = faEnvelope; faCheck = faCheck;
  faEye = faEye;

  environment = environment;
  customer: StoreCustomer | null = null;
  orders: any[] = [];
  activeTab: 'profile' | 'orders' | 'security' = 'profile';

  // Edit state
  isEditing = false;
  editForm = {
    firstName: '', lastName: '', phone: '',
    address: { street: '', city: '', state: '', postalCode: '' }
  };
  saving = false;
  saveMessage = '';

  // Password change
  passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
  changingPassword = false;
  passwordMessage = '';
  passwordError = '';

  // Loading
  loadingOrders = false;

  basePath = '';
  storeId: string | null = null;

  private subs: Subscription[] = [];

  constructor(
    private storeAuth: StoreAuthService,
    private route: ActivatedRoute,
    private router: Router,
    private domainService: DomainService
  ) {}

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'auto' });

    // Resolve basePath
    if (this.domainService.isCustomDomain) {
      this.basePath = '/store-home';
      this.storeId = String(this.domainService.storeId);
    } else {
      this.storeId = this.route.parent?.snapshot.paramMap.get('storeId') || null;
      this.basePath = this.storeId ? `/preview-store/${this.storeId}` : '/store-home';
    }

    // Redirect if not logged in
    if (!this.storeAuth.isLoggedIn()) {
      this.router.navigate([this.basePath, 'login']);
      return;
    }

    // Load customer data
    this.subs.push(
      this.storeAuth.customer$.subscribe(c => {
        this.customer = c;
        if (c) {
          this.editForm = {
            firstName: c.firstName || '',
            lastName: c.lastName || '',
            phone: c.phone || '',
            address: {
              street: c.address?.street || '',
              city: c.address?.city || '',
              state: c.address?.state || '',
              postalCode: c.address?.postalCode || ''
            }
          };
        }
      })
    );

    this.loadOrders();
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  switchTab(tab: 'profile' | 'orders' | 'security'): void {
    this.activeTab = tab;
    if (tab === 'orders' && this.orders.length === 0) {
      this.loadOrders();
    }
  }

  // ─── Profile ───
  startEdit(): void {
    this.isEditing = true;
    this.saveMessage = '';
  }

  cancelEdit(): void {
    this.isEditing = false;
    if (this.customer) {
      this.editForm = {
        firstName: this.customer.firstName || '',
        lastName: this.customer.lastName || '',
        phone: this.customer.phone || '',
        address: {
          street: this.customer.address?.street || '',
          city: this.customer.address?.city || '',
          state: this.customer.address?.state || '',
          postalCode: this.customer.address?.postalCode || ''
        }
      };
    }
  }

  saveProfile(): void {
    this.saving = true;
    this.saveMessage = '';
    this.storeAuth.updateProfile(this.editForm).subscribe({
      next: (res: any) => {
        this.saving = false;
        this.isEditing = false;
        if (res.success) {
          this.saveMessage = 'Profil mis à jour avec succès !';
          this.storeAuth.loadProfile();
          setTimeout(() => this.saveMessage = '', 3000);
        }
      },
      error: () => {
        this.saving = false;
        this.saveMessage = 'Erreur lors de la mise à jour.';
      }
    });
  }

  // ─── Orders ───
  loadOrders(): void {
    this.loadingOrders = true;
    this.storeAuth.getMyOrders().subscribe({
      next: (res: any) => {
        this.loadingOrders = false;
        this.orders = res.success ? res.orders : [];
      },
      error: () => {
        this.loadingOrders = false;
        this.orders = [];
      }
    });
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      'PENDING': 'En attente',
      'CONFIRMED': 'Confirmée',
      'SHIPPED': 'Expédiée',
      'DELIVERED': 'Livrée',
      'CANCELLED': 'Annulée'
    };
    return map[status] || status;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'PENDING': 'status-pending',
      'CONFIRMED': 'status-confirmed',
      'SHIPPED': 'status-shipped',
      'DELIVERED': 'status-delivered',
      'CANCELLED': 'status-cancelled'
    };
    return map[status] || '';
  }

  getProductImage(product: any): string {
    if (!product?.images) return '';
    try {
      const imgs = JSON.parse(product.images);
      const idx = product.mainImageIndex || 0;
      return imgs[idx] ? environment.backend + '/' + imgs[idx] : '';
    } catch {
      return '';
    }
  }

  getOrderTotal(order: any): number {
    return order.totalAmount || 0;
  }

  // ─── Security ───
  changePassword(): void {
    this.passwordError = '';
    this.passwordMessage = '';

    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.passwordError = 'Les mots de passe ne correspondent pas.';
      return;
    }
    if (this.passwordForm.newPassword.length < 6) {
      this.passwordError = 'Le mot de passe doit contenir au moins 6 caractères.';
      return;
    }

    this.changingPassword = true;
    // For now, we'll show a message since the backend doesn't have a change-password endpoint
    setTimeout(() => {
      this.changingPassword = false;
      this.passwordMessage = 'Fonctionnalité bientôt disponible.';
      setTimeout(() => this.passwordMessage = '', 3000);
    }, 500);
  }

  // ─── Logout ───
  logout(): void {
    this.storeAuth.logout();
    this.router.navigate([this.basePath]);
  }
}
