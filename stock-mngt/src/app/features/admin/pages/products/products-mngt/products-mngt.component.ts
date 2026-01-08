import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import {
  faEdit, faTrash, faEye, faArrowUp, faArrowDown, faPlus, faSearch,
  faFilter, faUndo, faTag, faAlignLeft, faTruck, faFolder, faCubes,
  faEyeSlash, faGlobe, faLock, faSearchPlus, faShoppingCart, faTimes, faBox,
  faBarcode, faCamera
} from '@fortawesome/free-solid-svg-icons';
import { BarcodeFormat } from '@zxing/library';
import { AuthService } from 'src/app/core/services/auth.service';
import { CategoryService } from 'src/app/core/services/category.service';
import { FileService } from 'src/app/core/services/file.service';
import { ProductService } from 'src/app/core/services/product.service';
import { QueryService } from 'src/app/core/services/query.service';
import { ReceiptService } from 'src/app/core/services/receipt.service';
import { StoreService } from 'src/app/core/services/store.service';
import { SupplierService } from 'src/app/core/services/supplier.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { SellProductComponent } from '../sell-product/sell-product.component';

@Component({
  selector: 'app-products-mngt',
  templateUrl: './products-mngt.component.html',
  styleUrls: ['./products-mngt.component.scss']
})
export class ProductsMngtComponent implements OnInit {
  environment = environment;

  // Icons
  faEdit = faEdit;
  faTrash = faTrash;
  faEye = faEye;
  faEyeSlash = faEyeSlash;
  faArrowUp = faArrowUp;
  faArrowDown = faArrowDown;
  faPlus = faPlus;
  faSearch = faSearch;
  faFilter = faFilter;
  faUndo = faUndo;
  faTag = faTag;
  faAlignLeft = faAlignLeft;
  faTruck = faTruck;
  faFolder = faFolder;
  faCubes = faCubes;
  faGlobe = faGlobe;
  faLock = faLock;
  faSearchPlus = faSearchPlus;
  faShoppingCart = faShoppingCart;
  faTimes = faTimes;
  faBox = faBox;
  faBarcode = faBarcode;
  faCamera = faCamera;

  // Loading States
  isLoading = true;
  isActionLoading = false;

  // Filters
  minBuyingPriceFilter: number = null;
  maxBuyingPriceFilter: number = null;
  minSellingPriceFilter: number = null;
  maxSellingPriceFilter: number = null;
  minQuantityFilter: number = null;
  maxQuantityFilter: number = null;
  nameFilter = '';
  descriptionFilter = '';
  colorFilter = '';
  supplierFilter: number = null;
  categoryFilter: number = null;
  codeFilter = '';

  // Scanner
  scannerActive = false;
  scannerError = '';
  allowedFormats = [
    BarcodeFormat.EAN_13,
    BarcodeFormat.EAN_8,
    BarcodeFormat.CODE_128,
    BarcodeFormat.CODE_39,
    BarcodeFormat.UPC_A,
    BarcodeFormat.UPC_E,
    BarcodeFormat.ITF
  ];

  // Data
  suppliers: any[] = [];
  products: any[] = [];
  categories: any[] = [];
  count: number = 0;

  // Pagination
  currentPage = 0;
  currentSize = 24;

  // UI State
  filtersCollapsed = true;
  searchable = '';
  isCriticalFilter = false;
  selectedImage: string | null = null;

  // Bulk Selection
  selectedIds: number[] = [];

  constructor(
    private productService: ProductService,
    private receiptService: ReceiptService,
    private supplierService: SupplierService,
    private categoryService: CategoryService,
    private authService: AuthService,
    private fileService: FileService,
    private storeService: StoreService,
    private router: Router,
    private route: ActivatedRoute,
    private queryService: QueryService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.route.queryParams.subscribe(params => {
      this.isCriticalFilter = params['filter'] === 'critical';
      this.loadInitialData();
    });
  }

  loadInitialData() {
    this.isLoading = true;
    this.getSuppliers();
    this.getCategories();
    this.queryService.buildQuery(this.nameFilter, this.descriptionFilter, this.supplierFilter, this.minBuyingPriceFilter, this.maxBuyingPriceFilter);
    this.getProducts(this.currentPage, this.currentSize);
    this.countProducts();
  }

  toggleFilters() {
    this.filtersCollapsed = !this.filtersCollapsed;
  }

  buildQuery() {
    let query = "";
    if (this.nameFilter)
      query += query ? ",name ~ '" + this.nameFilter + "'" : "name ~ '" + this.nameFilter + "'";
    if (this.descriptionFilter)
      query += query ? ",description ~ '" + this.descriptionFilter + "'" : "description ~ '" + this.descriptionFilter + "'";
    if (this.supplierFilter)
      query += query ? ",supplierId = '" + this.supplierFilter + "'" : "supplierId = '" + this.supplierFilter + "'";
    if (this.categoryFilter)
      query += query ? ",categoryId = '" + this.categoryFilter + "'" : "categoryId = '" + this.categoryFilter + "'";
    if (this.minQuantityFilter != null)
      query += query ? ",quantity > '" + this.minQuantityFilter + "'" : "quantity > '" + this.minQuantityFilter + "'";
    if (this.maxQuantityFilter != null)
      query += query ? ",quantity < '" + this.maxQuantityFilter + "'" : "quantity < '" + this.maxQuantityFilter + "'";
    if (this.minBuyingPriceFilter != null)
      query += query ? ",buyingPrice > '" + this.minBuyingPriceFilter + "'" : "buyingPrice > '" + this.minBuyingPriceFilter + "'";
    if (this.maxBuyingPriceFilter != null)
      query += query ? ",buyingPrice < '" + this.maxBuyingPriceFilter + "'" : "buyingPrice < '" + this.maxBuyingPriceFilter + "'";
    if (this.minSellingPriceFilter != null)
      query += query ? ",sellingPrice > '" + this.minSellingPriceFilter + "'" : "sellingPrice > '" + this.minSellingPriceFilter + "'";
    if (this.maxSellingPriceFilter != null)
      query += query ? ",sellingPrice < '" + this.maxSellingPriceFilter + "'" : "sellingPrice < '" + this.maxSellingPriceFilter + "'";
    if (this.codeFilter)
      query += query ? ",code = '" + this.codeFilter + "'" : "code = '" + this.codeFilter + "'";
    return query;
  }

  getSuppliers() {
    this.supplierService.getAllSuppliersByStoreId(this.authService.getConnectedUser()?.store).subscribe(
      response => {
        this.suppliers = response;
      }
    );
  }

  getCategories() {
    this.categoryService.getFlatCategoriesByStoreId(this.authService.getConnectedUser()?.store).subscribe(
      response => {
        this.categories = response;
      }
    );
  }

  getProducts(page: number, size: number) {
    this.productService.getProductsByStoreId(this.authService.getConnectedUser()?.store, {
      page,
      size,
      query: this.buildQuery(),
      critical: this.isCriticalFilter
    }).subscribe(
      response => {
        this.products = response;
        this.isLoading = false;
      },
      error => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Erreur lors du chargement des produits',
          showConfirmButton: false,
          timer: 2000
        });
      }
    );
  }

  countProducts() {
    this.productService.countProductsByStoreId(this.authService.getConnectedUser()?.store, {
      query: this.buildQuery(),
      critical: this.isCriticalFilter
    }).subscribe(response => {
      this.count = response;
    });
  }

  create() {
    this.router.navigate(['/products/add']);
  }

  reset() {
    this.nameFilter = '';
    this.descriptionFilter = '';
    this.supplierFilter = null;
    this.categoryFilter = null;
    this.minQuantityFilter = null;
    this.maxQuantityFilter = null;
    this.minBuyingPriceFilter = null;
    this.maxBuyingPriceFilter = null;
    this.minSellingPriceFilter = null;
    this.maxSellingPriceFilter = null;
    this.searchable = '';
    this.codeFilter = '';
    this.filter();
  }

  filter() {
    this.isLoading = true;
    this.getProducts(this.currentPage, this.currentSize);
    this.countProducts();
  }

  handlePageEvent(event: any) {
    this.currentPage = event.pageIndex;
    this.currentSize = event.pageSize;
    this.isLoading = true;
    this.getProducts(this.currentPage, this.currentSize);
  }

  consulter(id: number) {
    this.router.navigate(['/products/view/' + id]);
  }

  sell(product: any) {
    const dialogRef = this.dialog.open(SellProductComponent, {
      data: {
        product,
        operationType: "SOLD"
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result?.success) {
        product.quantity -= result.amount;
      }
    });
  }

  load(product: any) {
    const dialogRef = this.dialog.open(SellProductComponent, {
      data: {
        product,
        operationType: "LOADED"
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result?.success) {
        product.quantity += result.amount;
      }
    });
  }

  navigateTo(link: string) {
    this.router.navigate([link]);
  }

  deleteProduct(product: any) {
    Swal.fire({
      title: 'Etes vous sûr de vouloir supprimer le produit ' + product.name + '?',
      denyButtonText: `Annuler`,
      showDenyButton: true,
      confirmButtonText: 'Supprimer',
      confirmButtonColor: '#c62828',
    }).then((result) => {
      if (result.isConfirmed) {
        this.isActionLoading = true;
        this.productService.deleteProduct(product.id).subscribe(
          response => {
            // Delete images and thumbnails from R2 and update storage
            this.cleanupProductImages(product);

            this.isActionLoading = false;
            Swal.fire({
              icon: 'success',
              title: 'Produit supprimé !',
              showConfirmButton: false,
              timer: 1500
            });
            this.getProducts(this.currentPage, this.currentSize);
            this.countProducts();
          },
          error => {
            this.isActionLoading = false;
            Swal.fire({
              icon: 'error',
              title: 'Erreur lors de la suppression',
              showConfirmButton: false,
              timer: 1500
            });
          }
        );
      }
    });
  }

  // Clean up product images from R2 and update storage tracking
  private cleanupProductImages(product: any) {
    const storeId = this.authService.getConnectedUser()?.store;
    const images = product.images || [];
    const thumbnails = product.thumbnails || [];
    const allFiles = [...images, ...thumbnails];

    if (allFiles.length === 0) return;

    console.log('Cleaning up', allFiles.length, 'files from deleted product');

    for (const filename of allFiles) {
      // Get file size and delete from R2
      this.fileService.getFileInfo(filename).subscribe({
        next: (info) => {
          const fileSize = info?.size || 0;
          this.fileService.deleteFile(filename).subscribe({
            next: () => {
              console.log('File deleted from R2:', filename);
              // Update storage tracking
              if (fileSize > 0 && storeId) {
                this.storeService.updateStorageUsage(storeId, fileSize, 'subtract').subscribe({
                  next: () => console.log('Storage updated for:', filename),
                  error: (err) => console.error('Failed to update storage:', err)
                });
              }
            },
            error: (err) => console.error('Failed to delete file from R2:', err)
          });
        },
        error: () => {
          // Still try to delete even if we can't get size
          this.fileService.deleteFile(filename).subscribe();
        }
      });
    }
  }

  openImage(image: string) {
    this.selectedImage = image;
  }

  closeImage() {
    this.selectedImage = null;
  }

  getDiscountedPrice(product: any): number {
    if (!product?.discount || product.discount <= 0) {
      return product?.sellingPrice || 0;
    }
    return product.sellingPrice * (1 - product.discount / 100);
  }

  search() {
    this.isLoading = true;
    this.productService.getProductsByStoreId(this.authService.getConnectedUser()?.store, {
      page: this.currentPage,
      size: this.currentSize,
      searchable: this.searchable,
    }).subscribe(
      response => {
        this.products = response;
        this.isLoading = false;
      },
      error => {
        this.isLoading = false;
      }
    );

    this.productService.countProductsByStoreId(this.authService.getConnectedUser()?.store, {
      searchable: this.searchable,
    }).subscribe(response => {
      this.count = response;
    });
  }

  // ========================================
  // Bulk Visibility Actions
  // ========================================
  toggleSelection(id: number) {
    const index = this.selectedIds.indexOf(id);
    if (index === -1) {
      this.selectedIds.push(id);
    } else {
      this.selectedIds.splice(index, 1);
    }
  }

  isSelected(id: number): boolean {
    return this.selectedIds.includes(id);
  }

  toggleSelectAll(checked: boolean) {
    if (checked) {
      this.selectedIds = this.products.map(p => p.id);
    } else {
      this.selectedIds = [];
    }
  }

  get isAllSelected(): boolean {
    return this.products.length > 0 && this.selectedIds.length === this.products.length;
  }

  bulkUpdateDisplay(toDisplay: boolean, updateAll: boolean = false) {
    if (!updateAll && this.selectedIds.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Aucun produit sélectionné',
        text: 'Veuillez sélectionner au moins un produit.'
      });
      return;
    }

    const action = toDisplay ? 'afficher' : 'masquer';
    const scope = updateAll ? 'TOUS les produits' : `${this.selectedIds.length} produit(s) sélectionné(s)`;

    Swal.fire({
      title: `${toDisplay ? 'Afficher' : 'Masquer'} les produits`,
      text: `Voulez-vous ${action} ${scope} sur le marketplace ?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, confirmer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: toDisplay ? '#28a745' : '#dc3545'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isActionLoading = true;
        this.productService.bulkUpdateVisibility({
          ids: this.selectedIds,
          toDisplay: toDisplay,
          updateAll: updateAll,
          storeId: this.authService.getConnectedUser()?.store
        }).subscribe(
          response => {
            this.isActionLoading = false;
            Swal.fire({
              icon: 'success',
              title: response.message || 'Mise à jour réussie!',
              showConfirmButton: false,
              timer: 1500
            });
            this.selectedIds = [];
            this.getProducts(this.currentPage, this.currentSize);
          },
          error => {
            this.isActionLoading = false;
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: error?.error?.message || 'Une erreur est survenue'
            });
          }
        );
      }
    });
  }

  // Barcode Scanner Methods
  startScanner() {
    this.scannerActive = true;
    this.scannerError = '';
  }

  stopScanner() {
    this.scannerActive = false;
  }

  handleScanSuccess(result: string) {
    if (result) {
      this.codeFilter = result;
      this.stopScanner();
      this.filter();
      Swal.fire({
        icon: 'success',
        title: 'Code-barres détecté !',
        text: result,
        showConfirmButton: false,
        timer: 1500
      });
    }
  }

  onCamerasFound(devices: MediaDeviceInfo[]): void {
    if (!devices || devices.length === 0) {
      this.scannerError = 'Aucune caméra trouvée';
    }
  }

  onScanError(error: any): void {
    console.error('Scanner error:', error);
  }

  searchByBarcode() {
    if (this.codeFilter) {
      this.filter();
    }
  }
}
