import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import {
  faEdit, faTrash, faEye, faArrowUp, faArrowDown, faPlus, faSearch,
  faFilter, faUndo, faTag, faAlignLeft, faTruck, faFolder, faCubes,
  faEyeSlash, faGlobe, faLock, faLockOpen, faSearchPlus, faShoppingCart, faTimes, faBox,
  faBarcode, faCamera, faImages, faStar, faStore, faChevronDown
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
import { UserSettingsService } from 'src/app/core/services/user-settings.service';
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
  faLockOpen = faLockOpen;
  faSearchPlus = faSearchPlus;
  faShoppingCart = faShoppingCart;
  faTimes = faTimes;
  faBox = faBox;
  faBarcode = faBarcode;
  faCamera = faCamera;
  faImages = faImages;
  faStar = faStar;
  faStore = faStore;
  faChevronDown = faChevronDown;

  // Loading States
  isLoading = true;
  isActionLoading = false;

  // Image Selector Modal
  imageSelectProduct: any = null;

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
  categoryFilter: any = null;
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
  bulkActionsCollapsed = true;

  // Display Settings
  showBuyingPrice = false;

  // Edit Lock
  lockPassword = '';

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
    private userSettingsService: UserSettingsService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'auto' });
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    }, 0);
    this.restoreFiltersState();
    this.userSettingsService.settings$.subscribe(settings => {
      this.showBuyingPrice = settings?.defaults?.showBuyingPrice ?? false;
      this.lockPassword = settings?.defaults?.lockPassword || '';
    });
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
    if (this.categoryFilter === 'none')
      query += query ? ",categoryId isnull 'true'" : "categoryId isnull 'true'";
    else if (this.categoryFilter)
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
    this.saveFiltersState();
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
    this.clearFiltersState();
    this.filter();
  }

  filter() {
    this.currentPage = 0
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
    this.saveFiltersState();
    this.router.navigate(['/products/view/' + id]);
  }

  sell(product: any) {
    const dialogRef = this.dialog.open(SellProductComponent, {
      panelClass: 'sell-product-dialog',
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
      panelClass: 'sell-product-dialog',
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
    this.saveFiltersState();
    this.router.navigate([link]);
  }

  // ========================================
  // Filter State Persistence
  // ========================================
  private readonly STORAGE_KEY = 'products_filters_state';

  private saveFiltersState() {
    const state = {
      nameFilter: this.nameFilter,
      descriptionFilter: this.descriptionFilter,
      colorFilter: this.colorFilter,
      supplierFilter: this.supplierFilter,
      categoryFilter: this.categoryFilter,
      codeFilter: this.codeFilter,
      minBuyingPriceFilter: this.minBuyingPriceFilter,
      maxBuyingPriceFilter: this.maxBuyingPriceFilter,
      minSellingPriceFilter: this.minSellingPriceFilter,
      maxSellingPriceFilter: this.maxSellingPriceFilter,
      minQuantityFilter: this.minQuantityFilter,
      maxQuantityFilter: this.maxQuantityFilter,
      searchable: this.searchable,
      currentPage: this.currentPage,
      currentSize: this.currentSize,
      filtersCollapsed: this.filtersCollapsed,
      isCriticalFilter: this.isCriticalFilter
    };
    sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
  }

  private restoreFiltersState() {
    const saved = sessionStorage.getItem(this.STORAGE_KEY);
    if (!saved) return;

    try {
      const state = JSON.parse(saved);
      this.nameFilter = state.nameFilter || '';
      this.descriptionFilter = state.descriptionFilter || '';
      this.colorFilter = state.colorFilter || '';
      this.supplierFilter = state.supplierFilter ?? null;
      this.categoryFilter = state.categoryFilter ?? null;
      this.codeFilter = state.codeFilter || '';
      this.minBuyingPriceFilter = state.minBuyingPriceFilter ?? null;
      this.maxBuyingPriceFilter = state.maxBuyingPriceFilter ?? null;
      this.minSellingPriceFilter = state.minSellingPriceFilter ?? null;
      this.maxSellingPriceFilter = state.maxSellingPriceFilter ?? null;
      this.minQuantityFilter = state.minQuantityFilter ?? null;
      this.maxQuantityFilter = state.maxQuantityFilter ?? null;
      this.searchable = state.searchable || '';
      this.currentPage = state.currentPage ?? 0;
      this.currentSize = state.currentSize ?? 24;
      this.filtersCollapsed = state.filtersCollapsed ?? true;
      this.isCriticalFilter = state.isCriticalFilter ?? false;

      // Clear after restoring so it doesn't persist forever
      sessionStorage.removeItem(this.STORAGE_KEY);
    } catch (e) {
      sessionStorage.removeItem(this.STORAGE_KEY);
    }
  }

  private clearFiltersState() {
    sessionStorage.removeItem(this.STORAGE_KEY);
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

  // Image Selector Modal Methods
  openImageSelector(product: any) {
    this.imageSelectProduct = product;
  }

  closeImageSelector() {
    this.imageSelectProduct = null;
  }

  setProductMainImage(product: any, index: number) {
    // Update locally first for immediate feedback
    product.mainImageIndex = index;

    // Then update via API
    this.productService.updateProduct({
      id: product.id,
      mainImageIndex: index,
      // Include other required fields from product
      name: product.name,
      code: product.code,
      color: product.color,
      quantity: product.quantity,
      unit: product.unit,
      images: product.images,
      thumbnails: product.thumbnails,
      sellingPrice: product.sellingPrice,
      description: product.description,
      buyingPrice: product.buyingPrice,
      size: product.size,
      supplierId: product.supplier?.id,
      categoryId: product.category?.id,
      brandId: product.brand?.id,
      criticalStockIndicator: product.criticalStockIndicator,
      toDisplay: product.toDisplay,
      toDisplayStore: product.toDisplayStore,
      activateCriticalStockIndicator: product.activateCriticalStockIndicator,
      discount: product.discount
    }).subscribe(
      () => {
        Swal.fire({
          icon: 'success',
          title: 'Image principale mise à jour',
          showConfirmButton: false,
          timer: 1500
        });
      },
      (error) => {
        console.error('Failed to update main image:', error);
        Swal.fire({
          icon: 'error',
          title: 'Erreur lors de la mise à jour',
          showConfirmButton: false,
          timer: 1500
        });
      }
    );
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

    // If trying to display products, check for products without images
    if (toDisplay) {
      let productsWithoutImages: any[] = [];
      let validProductIds: number[] = [];

      if (updateAll) {
        // Check all products on current page (API will handle all products)
        productsWithoutImages = this.products.filter(p => !p.images || p.images.length === 0);
        validProductIds = this.products.filter(p => p.images && p.images.length > 0).map(p => p.id);
      } else {
        // Check only selected products
        const selectedProducts = this.products.filter(p => this.selectedIds.includes(p.id));
        productsWithoutImages = selectedProducts.filter(p => !p.images || p.images.length === 0);
        validProductIds = selectedProducts.filter(p => p.images && p.images.length > 0).map(p => p.id);
      }

      if (productsWithoutImages.length > 0) {
        const productNames = productsWithoutImages.slice(0, 5).map(p => p.name).join(', ');
        const moreText = productsWithoutImages.length > 5 ? ` et ${productsWithoutImages.length - 5} autre(s)` : '';

        if (validProductIds.length === 0) {
          // All selected products have no images
          Swal.fire({
            icon: 'error',
            title: 'Aucune image disponible',
            html: `<p>Les produits suivants n'ont pas d'images et ne peuvent pas être affichés sur le marketplace :</p>
                   <p><strong>${productNames}${moreText}</strong></p>
                   <p>Veuillez ajouter au moins une image à chaque produit avant de l'afficher.</p>`,
            confirmButtonText: 'Compris'
          });
          return;
        }

        // Some products have images, some don't - ask user what to do
        Swal.fire({
          icon: 'warning',
          title: 'Certains produits sans images',
          html: `<p>${productsWithoutImages.length} produit(s) n'ont pas d'images et seront ignorés :</p>
                 <p><strong>${productNames}${moreText}</strong></p>
                 <p>Voulez-vous continuer avec les ${validProductIds.length} produit(s) valide(s) ?</p>`,
          showCancelButton: true,
          confirmButtonText: 'Continuer',
          cancelButtonText: 'Annuler',
          confirmButtonColor: '#28a745'
        }).then((result) => {
          if (result.isConfirmed) {
            // Proceed with only valid products
            this.executeDisplayUpdate(validProductIds, true, false);
          }
        });
        return;
      }
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
        this.executeDisplayUpdate(this.selectedIds, toDisplay, updateAll);
      }
    });
  }

  private executeDisplayUpdate(ids: number[], toDisplay: boolean, updateAll: boolean) {
    this.isActionLoading = true;
    this.productService.bulkUpdateVisibility({
      ids: ids,
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

  // ========================================
  // Bulk Store Visibility Actions
  // ========================================
  bulkUpdateStoreDisplay(toDisplayStore: boolean, updateAll: boolean = false) {
    if (!updateAll && this.selectedIds.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Aucun produit sélectionné',
        text: 'Veuillez sélectionner au moins un produit.'
      });
      return;
    }

    if (toDisplayStore) {
      let productsWithoutImages: any[] = [];
      let validProductIds: number[] = [];

      if (updateAll) {
        productsWithoutImages = this.products.filter(p => !p.images || p.images.length === 0);
        validProductIds = this.products.filter(p => p.images && p.images.length > 0).map(p => p.id);
      } else {
        const selectedProducts = this.products.filter(p => this.selectedIds.includes(p.id));
        productsWithoutImages = selectedProducts.filter(p => !p.images || p.images.length === 0);
        validProductIds = selectedProducts.filter(p => p.images && p.images.length > 0).map(p => p.id);
      }

      if (productsWithoutImages.length > 0) {
        const productNames = productsWithoutImages.slice(0, 5).map(p => p.name).join(', ');
        const moreText = productsWithoutImages.length > 5 ? ` et ${productsWithoutImages.length - 5} autre(s)` : '';

        if (validProductIds.length === 0) {
          Swal.fire({
            icon: 'error',
            title: 'Aucune image disponible',
            html: `<p>Les produits suivants n'ont pas d'images et ne peuvent pas être affichés sur la boutique :</p>
                   <p><strong>${productNames}${moreText}</strong></p>
                   <p>Veuillez ajouter au moins une image à chaque produit avant de l'afficher.</p>`,
            confirmButtonText: 'Compris'
          });
          return;
        }

        Swal.fire({
          icon: 'warning',
          title: 'Certains produits sans images',
          html: `<p>${productsWithoutImages.length} produit(s) n'ont pas d'images et seront ignorés :</p>
                 <p><strong>${productNames}${moreText}</strong></p>
                 <p>Voulez-vous continuer avec les ${validProductIds.length} produit(s) valide(s) ?</p>`,
          showCancelButton: true,
          confirmButtonText: 'Continuer',
          cancelButtonText: 'Annuler',
          confirmButtonColor: '#5c6bc0'
        }).then((result) => {
          if (result.isConfirmed) {
            this.executeStoreDisplayUpdate(validProductIds, true, false);
          }
        });
        return;
      }
    }

    const action = toDisplayStore ? 'afficher' : 'masquer';
    const scope = updateAll ? 'TOUS les produits' : `${this.selectedIds.length} produit(s) sélectionné(s)`;

    Swal.fire({
      title: `${toDisplayStore ? 'Afficher' : 'Masquer'} sur la boutique`,
      text: `Voulez-vous ${action} ${scope} sur la boutique en ligne ?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, confirmer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: toDisplayStore ? '#5c6bc0' : '#dc3545'
    }).then((result) => {
      if (result.isConfirmed) {
        this.executeStoreDisplayUpdate(this.selectedIds, toDisplayStore, updateAll);
      }
    });
  }

  private executeStoreDisplayUpdate(ids: number[], toDisplayStore: boolean, updateAll: boolean) {
    this.isActionLoading = true;
    this.productService.bulkUpdateStoreVisibility({
      ids: ids,
      toDisplayStore: toDisplayStore,
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

  // ========================================
  // Edit Lock
  // ========================================
  toggleEditLock(product: any) {
    // If no password is configured, toggle directly
    if (!this.lockPassword) {
      this.productService.toggleProductLock(product.id).subscribe({
        next: (res) => {
          product.locked = res.locked;
        },
        error: () => {
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Impossible de modifier le verrouillage.',
            confirmButtonColor: '#c62828'
          });
        }
      });
      return;
    }

    // Prompt for password
    const isLocking = !product.locked;
    Swal.fire({
      title: isLocking ? 'Verrouiller la modification' : 'Déverrouiller la modification',
      input: 'password',
      inputPlaceholder: 'Entrez le mot de passe...',
      inputAttributes: {
        autocapitalize: 'off',
        autocorrect: 'off'
      },
      showCancelButton: true,
      confirmButtonText: isLocking ? 'Verrouiller' : 'Déverrouiller',
      cancelButtonText: 'Annuler',
      confirmButtonColor: isLocking ? '#c62828' : '#3f51b5',
      inputValidator: (value) => {
        if (!value) {
          return 'Veuillez entrer le mot de passe';
        }
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        if (result.value === this.lockPassword) {
          this.productService.toggleProductLock(product.id).subscribe({
            next: (res) => {
              product.locked = res.locked;
              Swal.fire({
                icon: 'success',
                title: res.locked ? 'Verrouillé !' : 'Déverrouillé !',
                text: res.locked ? 'Le bouton de modification est maintenant protégé.' : 'Le bouton de modification est maintenant accessible.',
                showConfirmButton: false,
                timer: 1500
              });
            },
            error: () => {
              Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: 'Impossible de modifier le verrouillage.',
                confirmButtonColor: '#c62828'
              });
            }
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Mot de passe incorrect',
            text: 'Le mot de passe saisi est incorrect.',
            confirmButtonColor: '#c62828'
          });
        }
      }
    });
  }
}
