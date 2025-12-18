import { Component, OnInit } from '@angular/core';
import {
  faEdit, faInfo, faBox, faShoppingCart, faFolder, faTruck,
  faCheckCircle, faTimesCircle, faEye, faPhoneAlt, faPhone,
  faEnvelope, faGlobe, faMapMarkerAlt, faRoad, faCity, faMap,
  faBolt, faPlus, faExternalLinkAlt
} from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/core/services/auth.service';
import { LoadingService } from 'src/app/core/services/loading.service';
import { StoreService } from 'src/app/core/services/store.service';
import { ProductService } from 'src/app/core/services/product.service';
import { CategoryService } from 'src/app/core/services/category.service';
import { SupplierService } from 'src/app/core/services/supplier.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

import { OrderService } from 'src/app/core/services/order.service';

@Component({
  selector: 'app-store-view',
  templateUrl: './store-view.component.html',
  styleUrls: ['./store-view.component.scss']
})
export class StoreViewComponent implements OnInit {
  store: any;
  storeWebsite: string;
  backend_URL = environment.backend;

  // Icons
  editIcon = faEdit;
  infoIcon = faInfo;
  boxIcon = faBox;
  cartIcon = faShoppingCart;
  folderIcon = faFolder;
  truckIcon = faTruck;
  checkIcon = faCheckCircle;
  timesIcon = faTimesCircle;
  eyeIcon = faEye;
  phoneHeaderIcon = faPhoneAlt;
  phoneIcon = faPhone;
  envelopeIcon = faEnvelope;
  globeIcon = faGlobe;
  mapMarkerIcon = faMapMarkerAlt;
  roadIcon = faRoad;
  cityIcon = faCity;
  mapIcon = faMap;
  boltIcon = faBolt;
  plusIcon = faPlus;
  externalLinkIcon = faExternalLinkAlt;

  selectedImage: string | null = null;

  // Stats
  productsCount = 0;
  ordersCount = 0;
  categoriesCount = 0;
  suppliersCount = 0;

  constructor(
    private authService: AuthService,
    private storeService: StoreService,
    private productService: ProductService,
    private orderService: OrderService,
    private categoryService: CategoryService,
    private supplierService: SupplierService,
    private loadingService: LoadingService
  ) { }

  ngOnInit(): void {
    this.loadStore();
  }

  loadStore() {
    this.loadingService.screenLoading();
    const storeId = this.authService.getConnectedUser()?.store;

    this.storeService.getStore(storeId).subscribe(
      store => {
        this.store = store;
        this.storeWebsite = this.fillLink(this.store?.site);
        this.loadingService.screenLoaded();
        this.loadStats(storeId);
      },
      error => {
        this.loadingService.screenLoaded();
        Swal.fire({
          icon: 'error',
          title: error?.error?.message || 'Une erreur est survenue ! Merci de réessayer plus tard',
          showConfirmButton: false,
          timer: 1500
        });
      }
    );
  }

  loadStats(storeId: number) {
    // Load products count (Backend returns a raw number)
    this.productService.countProductsByStoreId(storeId, {}).subscribe(
      res => {
        this.productsCount = typeof res === 'object' ? (res?.count || 0) : (res || 0);
      }
    );

    // Load orders count
    this.orderService.getStoreOrders(storeId).subscribe(
      res => {
        this.ordersCount = res?.length || 0;
      }
    );

    // Load categories count
    this.categoryService.getCategoriesByStoreId(storeId).subscribe(
      res => {
        this.categoriesCount = res?.length || 0;
      }
    );

    // Load suppliers count
    this.supplierService.getAllSuppliersByStoreId(storeId).subscribe(
      res => {
        this.suppliersCount = res?.length || 0;
      }
    );
  }

  fillLink(link: string): string {
    if (link != null) {
      if (link.indexOf('http://') === -1 && link.indexOf('https://') === -1) {
        return 'http://' + link;
      }
      return link;
    }
    return null;
  }

  openImage(image: string) {
    this.selectedImage = image;
  }

  closeImage() {
    this.selectedImage = null;
  }
}
