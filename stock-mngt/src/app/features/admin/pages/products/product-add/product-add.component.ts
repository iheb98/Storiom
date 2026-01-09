import { ChangeDetectorRef, Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  faArrowLeft, faEdit, faTimes, faChartLine, faCubes, faExclamationTriangle,
  faEye, faInfoCircle, faTag, faFolder, faTruck, faCoins, faArrowDown,
  faArrowUp, faAlignLeft, faImages, faCloudUploadAlt, faPlus, faSave, faBox, faBarcode, faCamera, faPercent, faStar, faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarOutline } from '@fortawesome/free-regular-svg-icons';
import { BarcodeFormat } from '@zxing/library';
import { EMPTY, forkJoin } from 'rxjs';
import { expand, map } from 'rxjs/operators';
import { AuthService } from 'src/app/core/services/auth.service';
import { BrandService } from 'src/app/core/services/brand.service';
import { CategoryService } from 'src/app/core/services/category.service';
import { CompressorService } from 'src/app/core/services/compressor.service';
import { FileService } from 'src/app/core/services/file.service';
import { ProductService } from 'src/app/core/services/product.service';
import { SupplierService } from 'src/app/core/services/supplier.service';
import { StoreService } from 'src/app/core/services/store.service';
import { UserSettingsService } from 'src/app/core/services/user-settings.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-product-add',
  templateUrl: './product-add.component.html',
  styleUrls: ['./product-add.component.scss']
})
export class ProductAddComponent implements OnInit {
  environment = environment;

  // Icons
  faArrowLeft = faArrowLeft;
  faEdit = faEdit;
  faTimes = faTimes;
  faChartLine = faChartLine;
  faCubes = faCubes;
  faExclamationTriangle = faExclamationTriangle;
  faEye = faEye;
  faInfoCircle = faInfoCircle;
  faTag = faTag;
  faFolder = faFolder;
  faTruck = faTruck;
  faCoins = faCoins;
  faArrowDown = faArrowDown;
  faArrowUp = faArrowUp;
  faAlignLeft = faAlignLeft;
  faImages = faImages;
  faCloudUploadAlt = faCloudUploadAlt;
  faPlus = faPlus;
  faSave = faSave;
  faBox = faBox;
  faBarcode = faBarcode;
  faCamera = faCamera;
  faPercent = faPercent;
  faStar = faStar;
  faStarOutline = faStarOutline;
  faCheckCircle = faCheckCircle;

  // Barcode Scanner
  scannerActive = false;
  scannerError = '';

  // Loading States
  isLoading = true;
  isSubmitting = false;

  // Form
  form: FormGroup;
  submitted = false;
  emailError = false;

  // Data
  user: any;
  productId: string;
  product: any;
  suppliers: any[] = [];
  brands: any[] = [];
  colors: any[] = [];
  categories: any[] = [];

  // Category hierarchy
  parentCategory: any;
  subCategory: any;
  subCategory2: any;
  subCategory3: any;
  subCategory4: any;

  // Images
  images: string[] = [];
  thumbnails: string[] = [];
  compressedImages: any[] = [];
  mainImageIndex: number = 0;
  data: any;
  selectedCategory = '';
  selectedFiles: { file: File, preview: string }[] = [];
  pendingDeletions: { image: string, thumbnail: string | null }[] = []; // Queue for deletions on update

  // Edit mode
  edit = false;
  editCategory = false;

  // Quill Editor Config
  quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'align': [] }],
      ['link'],
      ['clean']
    ]
  };

  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private supplierService: SupplierService,
    private categoryService: CategoryService,
    private productService: ProductService,
    private route: ActivatedRoute,
    private fileService: FileService,
    private brandService: BrandService,
    private compressor: CompressorService,
    private userSettingsService: UserSettingsService,
    private storeService: StoreService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) { }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.editCategory = false;
    this.initForm();
    this.colors = environment.couleurs;
    this.user = this.authService.getConnectedUser();

    this.route.paramMap.subscribe(paramMap => {
      this.productId = paramMap.get('id');
      this.loadInitialData();
    });
  }

  loadInitialData() {
    this.isLoading = true;

    // Load all required data
    Promise.all([
      this.getSuppliers(),
      this.getBrands(),
      this.getCategories()
    ]).then(() => {
      if (this.productId) {
        this.edit = true;
        this.loadProduct();
      } else {
        this.isLoading = false;
      }
    });
  }

  getSuppliers(): Promise<void> {
    return new Promise((resolve) => {
      this.supplierService.getAllSuppliersByStoreId(this.authService.getConnectedUser()?.store).subscribe(
        response => {
          this.suppliers = response;
          resolve();
        },
        error => resolve()
      );
    });
  }

  getBrands(): Promise<void> {
    return new Promise((resolve) => {
      this.brandService.getBrandsByStoreId(this.authService.getConnectedUser()?.store).subscribe(
        response => {
          this.brands = response;
          resolve();
        },
        error => resolve()
      );
    });
  }

  getCategories(): Promise<void> {
    return new Promise((resolve) => {
      this.categoryService.getFlatCategoriesByStoreId(this.authService.getConnectedUser()?.store).subscribe(
        response => {
          this.categories = response;
          resolve();
        },
        error => resolve()
      );
    });
  }

  loadProduct() {
    this.productService.getProduct(this.productId).subscribe(
      response => {
        this.product = response;
        this.form.get('name').setValue(response?.name);
        this.form.get('description').setValue(response?.description);
        this.form.get('buyingPrice').setValue(response?.buyingPrice);
        this.form.get('brandId').setValue(response?.brand?.id);
        this.form.get('categoryId').setValue(response?.category?.id);
        this.form.get('sellingPrice').setValue(response?.sellingPrice);
        this.form.get('discount').setValue(response?.discount);
        this.form.get('quantity').setValue(response?.quantity);
        this.form.get('color').setValue(response?.color);
        this.form.get('supplierId').setValue(response?.supplier?.id);
        this.form.get('size').setValue(response?.size);
        this.form.get('toDisplay').setValue(response?.toDisplay);
        this.form.get('criticalStockIndicator').setValue(response?.criticalStockIndicator);
        this.form.get('activateCriticalStockIndicator').setValue(response?.activateCriticalStockIndicator || false);
        this.form.get('code').setValue(response?.code);
        this.form.get('mainImageIndex').setValue(response?.mainImageIndex || 0);
        this.form.get('condition').setValue(response?.condition || 'NEW');
        this.mainImageIndex = response?.mainImageIndex || 0;
        this.images = response?.images || [];
        this.thumbnails = response?.thumbnails || [];
        this.isLoading = false;
      },
      error => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Erreur lors du chargement du produit',
          showConfirmButton: false,
          timer: 2000
        });
      }
    );
  }

  initForm() {
    // Get default visibility from user settings
    const defaultVisibility = this.userSettingsService.currentSettings?.defaults?.productVisibleToPublic ?? true;

    this.form = this.formBuilder.group({
      name: [null, Validators.required],
      code: [null],
      criticalStockIndicator: [0],
      activateCriticalStockIndicator: [false],
      supplierId: [null],
      brandId: [null],
      categoryId: [null],
      quantity: [0],
      unit: [null],
      size: [null],
      color: [null],
      description: [''],
      buyingPrice: [null],
      sellingPrice: [null],
      discount: [0],
      toDisplay: [defaultVisibility],
      mainImageIndex: [0],
      images: [null],
      condition: ['NEW'],
      date: [(new Date()).toISOString().substring(0, 16)]
    });
  }

  create() {
    this.submitted = true;
    this.emailError = false;

    const originalFiles = this.selectedFiles.map(sf => sf.file);

    if ((this.images?.length || 0) + originalFiles.length > 10) {
      Swal.fire({
        icon: 'error',
        title: 'Vous pouvez selectionnez seulement 10 images',
        showConfirmButton: false,
        timer: 1500
      });
      return;
    }

    if (this.form.valid) {
      this.isSubmitting = true;

      if (originalFiles.length > 0) {
        const timestamp = new Date().getTime();
        const userId = this.authService.getConnectedUser().id;

        // Generate filenames for originals (keep extension)
        const originalNames = originalFiles.map((file, index) => {
          const ext = file.name.substring(file.name.lastIndexOf('.'));
          return `${userId}-${timestamp}${index + 1}${ext}`;
        });

        // Generate filenames for WebP thumbnails
        const thumbnailNames = originalFiles.map((file, index) =>
          `${userId}-${timestamp}${index + 1}-thumb.webp`
        );

        // Create WebP thumbnails
        const compressionObservables = originalFiles.map(file =>
          this.compressor.compress(file, 800, 0.8)
        );

        forkJoin(compressionObservables).subscribe({
          next: (thumbnailFiles: File[]) => {
            // Upload both originals and thumbnails
            this.uploadDualImages(originalFiles, originalNames, thumbnailFiles, thumbnailNames);
          },
          error: (err) => {
            this.isSubmitting = false;
            console.error('Compression error:', err);
            Swal.fire({
              icon: 'error',
              title: 'Erreur lors de la création des miniatures',
              showConfirmButton: false,
              timer: 1500
            });
          }
        });
      } else {
        // No images to upload
        this.uploadAndSaveProduct([], [], [], []);
      }
    }
  }

  private uploadDualImages(
    originalFiles: File[],
    originalNames: string[],
    thumbnailFiles: File[],
    thumbnailNames: string[]
  ) {
    // Combine all files for upload
    const allFiles = [...originalFiles, ...thumbnailFiles];
    const allNames = [...originalNames, ...thumbnailNames];
    const originalCount = originalFiles.length;

    this.uploadFilesFromArray(allFiles, allNames).subscribe(
      response => {
        // Extract filenames from upload response (backend adds timestamp prefix)
        const allFilenames = response.files.map(file => file.location.split('/').pop());

        // Calculate total uploaded bytes for storage tracking
        const totalUploadedBytes = response.files.reduce((sum, file) => sum + (file.size || 0), 0);

        // Split response back into originals and thumbnails
        const uploadedOriginals = allFilenames.slice(0, originalCount);
        const uploadedThumbnails = allFilenames.slice(originalCount);

        this.form.get('images').setValue(uploadedOriginals);
        this.form.addControl('thumbnails', this.formBuilder.control(uploadedThumbnails));

        this.productService.addProduct({
          ...this.form.getRawValue(),
          storeId: this.user?.store
        }).subscribe(
          response => {
            // Update storage usage after successful product creation
            if (totalUploadedBytes > 0 && this.user?.store) {
              this.storeService.updateStorageUsage(this.user.store, totalUploadedBytes, 'add').subscribe();
            }

            this.isSubmitting = false;
            this.cdr.detectChanges();
            Swal.fire({
              icon: 'success',
              title: 'Produit ajouté !',
              showConfirmButton: false,
              timer: 1500
            });
            this.ngZone.run(() => {
              this.router.navigateByUrl('/admin/products', { replaceUrl: true });
            });
          },
          error => {
            this.isSubmitting = false;
            this.cdr.detectChanges();
            Swal.fire({
              icon: 'error',
              title: 'Une erreur est survenue ! Merci de réessayer plus tard',
              showConfirmButton: false,
              timer: 1500
            });
          }
        );
      },
      error => {
        this.isSubmitting = false;
        Swal.fire({
          icon: 'error',
          title: 'Erreur lors du téléchargement des images',
          showConfirmButton: false,
          timer: 1500
        });
      }
    );
  }

  private uploadAndSaveProduct(
    originalFiles: File[],
    originalNames: string[],
    thumbnailFiles: File[],
    thumbnailNames: string[]
  ) {
    if (originalFiles.length === 0) {
      // No new images to upload, just save the product
      this.productService.addProduct({ ...this.form.getRawValue(), storeId: this.user?.store })
        .subscribe(
          response => {
            this.isSubmitting = false;
            Swal.fire({
              icon: 'success',
              title: 'Produit ajouté !',
              showConfirmButton: false,
              timer: 1500
            });
            this.ngZone.run(() => {
              this.router.navigateByUrl('/admin/products', { replaceUrl: true });
            });
          },
          error => {
            this.isSubmitting = false;
            Swal.fire({
              icon: 'error',
              title: 'Une erreur est survenue ! Merci de réessayer plus tard',
              showConfirmButton: false,
              timer: 1500
            });
          }
        );
      return;
    }

    // Use uploadDualImages for file uploads
    this.uploadDualImages(originalFiles, originalNames, thumbnailFiles, thumbnailNames);
  }

  update() {
    this.submitted = true;
    this.emailError = false;

    const originalFiles = this.selectedFiles.map(sf => sf.file);

    if ((this.images?.length || 0) + originalFiles.length > 10) {
      Swal.fire({
        icon: 'error',
        title: 'Vous pouvez selectionnez seulement 10 images',
        showConfirmButton: false,
        timer: 1500
      });
      return;
    }

    if (this.form.valid) {
      this.isSubmitting = true;

      if (originalFiles.length > 0) {
        const timestamp = new Date().getTime();
        const userId = this.authService.getConnectedUser().id;

        // Generate filenames for originals (keep extension)
        const originalNames = originalFiles.map((file, index) => {
          const ext = file.name.substring(file.name.lastIndexOf('.'));
          return `${userId}-${timestamp}${index + 1}${ext}`;
        });

        // Generate filenames for WebP thumbnails
        const thumbnailNames = originalFiles.map((file, index) =>
          `${userId}-${timestamp}${index + 1}-thumb.webp`
        );

        // Create WebP thumbnails
        const compressionObservables = originalFiles.map(file =>
          this.compressor.compress(file, 800, 0.8)
        );

        forkJoin(compressionObservables).subscribe({
          next: (thumbnailFiles: File[]) => {
            this.uploadDualImagesForUpdate(originalFiles, originalNames, thumbnailFiles, thumbnailNames);
          },
          error: (err) => {
            this.isSubmitting = false;
            console.error('Compression error:', err);
            Swal.fire({
              icon: 'error',
              title: 'Erreur lors de la création des miniatures',
              showConfirmButton: false,
              timer: 1500
            });
          }
        });
      } else {
        // No new images, just update the product
        this.form.get('images').setValue(this.images);
        this.form.addControl('thumbnails', this.formBuilder.control(this.thumbnails));
        this.productService.updateProduct({ ...this.form.getRawValue(), storeId: this.user?.store, id: this.product?.id })
          .subscribe(
            response => {
              // Process queued image deletions
              this.processPendingDeletions();

              this.isSubmitting = false;
              Swal.fire({
                icon: 'success',
                title: 'Produit modifié !',
                showConfirmButton: false,
                timer: 1500
              });
              this.ngZone.run(() => {
                this.router.navigateByUrl('/admin/products', { replaceUrl: true });
              });
            },
            error => {
              this.isSubmitting = false;
              Swal.fire({
                icon: 'error',
                title: 'Une erreur est survenue ! Merci de réessayer plus tard',
                showConfirmButton: false,
                timer: 1500
              });
            }
          );
      }
    }
  }

  private uploadDualImagesForUpdate(
    originalFiles: File[],
    originalNames: string[],
    thumbnailFiles: File[],
    thumbnailNames: string[]
  ) {
    const allFiles = [...originalFiles, ...thumbnailFiles];
    const allNames = [...originalNames, ...thumbnailNames];
    const originalCount = originalFiles.length;

    this.uploadFilesFromArray(allFiles, allNames).subscribe(
      response => {
        const allFilenames = response.files.map(file => file.location.split('/').pop());
        const uploadedOriginals = allFilenames.slice(0, originalCount);
        const uploadedThumbnails = allFilenames.slice(originalCount);

        // Calculate total uploaded bytes for storage tracking
        const totalUploadedBytes = response.files.reduce((sum, file) => sum + (file.size || 0), 0);

        // Merge with existing images and thumbnails
        this.form.get('images').setValue([...this.images, ...uploadedOriginals]);
        this.form.addControl('thumbnails', this.formBuilder.control([...this.thumbnails, ...uploadedThumbnails]));

        this.productService.updateProduct({ ...this.form.getRawValue(), storeId: this.user?.store, id: this.product?.id })
          .subscribe(
            response => {
              // Update storage usage after successful product update
              if (totalUploadedBytes > 0 && this.user?.store) {
                this.storeService.updateStorageUsage(this.user.store, totalUploadedBytes, 'add').subscribe();
              }

              // Process queued image deletions
              this.processPendingDeletions();

              this.isSubmitting = false;
              Swal.fire({
                icon: 'success',
                title: 'Produit modifié !',
                showConfirmButton: false,
                timer: 1500
              });
              this.ngZone.run(() => {
                this.router.navigateByUrl('/admin/products', { replaceUrl: true });
              });
            },
            error => {
              this.isSubmitting = false;
              Swal.fire({
                icon: 'error',
                title: 'Une erreur est survenue ! Merci de réessayer plus tard',
                showConfirmButton: false,
                timer: 1500
              });
            }
          );
      },
      error => {
        this.isSubmitting = false;
        Swal.fire({
          icon: 'error',
          title: 'Erreur lors du téléchargement des images',
          showConfirmButton: false,
          timer: 1500
        });
      }
    );
  }

  getLastCategory() {
    if (this.subCategory4) return this.subCategory4;
    if (this.subCategory3) return this.subCategory3;
    if (this.subCategory2) return this.subCategory2;
    if (this.subCategory) return this.subCategory;
    if (this.parentCategory) return this.parentCategory;
  }

  findParentCategories(id: number) {
    this.categoryService.getParentCategory(id).subscribe(response => {
      this.getSelectedCategory(response);
      return response;
    });
  }

  getSelectedCategory(category: any) {
    this.selectedCategory = category?.name;
    if (category?.parentCategory) {
      this.selectedCategory = category?.parentCategory?.name + ' > ' + this.selectedCategory;
      if (category?.parentCategory?.parentCategory) {
        this.selectedCategory = category?.parentCategory?.parentCategory?.name + ' > ' + this.selectedCategory;
        if (category?.parentCategory?.parentCategory?.parentCategory) {
          this.selectedCategory = category?.parentCategory?.parentCategory?.parentCategory?.name + ' > ' + this.selectedCategory;
          if (category?.parentCategory?.parentCategory?.parentCategory?.parentCategory) {
            this.selectedCategory = category?.parentCategory?.parentCategory?.parentCategory?.parentCategory?.name + ' > ' + this.selectedCategory;
          }
        }
      }
    }
  }

  categoryChanged(categoryDepth: number) {
    if (categoryDepth == 0) {
      this.subCategory = null;
      this.subCategory2 = null;
      this.subCategory3 = null;
      this.subCategory4 = null;
    } else if (categoryDepth == 1) {
      this.subCategory2 = null;
      this.subCategory3 = null;
      this.subCategory4 = null;
    } else if (categoryDepth == 2) {
      this.subCategory3 = null;
      this.subCategory4 = null;
    } else if (categoryDepth == 3) {
      this.subCategory4 = null;
    }
  }

  deleteImage(item: string) {
    // Find the index of the image to delete
    const index = this.images.indexOf(item);
    if (index > -1) {
      // Get the corresponding thumbnail before removing
      const thumbnailToDelete = this.thumbnails && this.thumbnails.length > index ? this.thumbnails[index] : null;

      // Remove from local arrays (UI only)
      this.images = this.images.filter(element => element != item);
      if (this.thumbnails && this.thumbnails.length > index) {
        this.thumbnails.splice(index, 1);
      }

      // Adjust mainImageIndex when an image is deleted
      if (index < this.mainImageIndex) {
        // Deleted image was before main image, shift index down
        this.mainImageIndex--;
        this.form.get('mainImageIndex').setValue(this.mainImageIndex);
      } else if (index === this.mainImageIndex) {
        // Deleted image was the main image, reset to first image
        this.mainImageIndex = 0;
        this.form.get('mainImageIndex').setValue(0);
      }

      // Queue for deletion when user clicks Update (only in edit mode)
      if (this.edit) {
        this.pendingDeletions.push({ image: item, thumbnail: thumbnailToDelete });
        console.log('Queued for deletion:', item, thumbnailToDelete ? 'with thumbnail' : 'no thumbnail');
      }
    }
  }

  // Process queued deletions after successful product update
  private processPendingDeletions() {
    if (this.pendingDeletions.length === 0) return;

    const storeId = this.user?.store;
    console.log('Processing', this.pendingDeletions.length, 'pending deletions');

    for (const deletion of this.pendingDeletions) {
      // Delete image from R2 and update storage
      this.fileService.getFileInfo(deletion.image).subscribe({
        next: (info) => {
          const fileSize = info?.size || 0;
          this.fileService.deleteFile(deletion.image).subscribe({
            next: () => {
              console.log('Image deleted from R2:', deletion.image);
              if (fileSize > 0 && storeId) {
                this.storeService.updateStorageUsage(storeId, fileSize, 'subtract').subscribe({
                  next: (res) => console.log('Storage updated:', res),
                  error: (err) => console.error('Failed to update storage:', err)
                });
              }
            },
            error: (err) => console.error('Failed to delete image from R2:', err)
          });
        },
        error: () => {
          // Still try to delete even if we can't get size
          this.fileService.deleteFile(deletion.image).subscribe();
        }
      });

      // Delete thumbnail from R2 and update storage
      if (deletion.thumbnail) {
        this.fileService.getFileInfo(deletion.thumbnail).subscribe({
          next: (info) => {
            const thumbSize = info?.size || 0;
            this.fileService.deleteFile(deletion.thumbnail).subscribe({
              next: () => {
                console.log('Thumbnail deleted from R2:', deletion.thumbnail);
                if (thumbSize > 0 && storeId) {
                  this.storeService.updateStorageUsage(storeId, thumbSize, 'subtract').subscribe({
                    next: (res) => console.log('Thumbnail storage updated:', res),
                    error: (err) => console.error('Failed to update thumbnail storage:', err)
                  });
                }
              },
              error: (err) => console.error('Failed to delete thumbnail from R2:', err)
            });
          },
          error: () => {
            this.fileService.deleteFile(deletion.thumbnail).subscribe();
          }
        });
      }
    }

    // Clear the queue
    this.pendingDeletions = [];
  }

  removeSelectedFile(index: number) {
    this.selectedFiles.splice(index, 1);
  }

  // Set the main display image
  setMainImage(index: number) {
    this.mainImageIndex = index;
    this.form.get('mainImageIndex').setValue(index);
  }

  uploadImages(FilesToUpload: File[], images: string[]) {
    const files = new FormData();
    for (let i = 0; i < FilesToUpload?.length; i++) {
      files.append('file', FilesToUpload[i], images[i]);
    }
    return this.fileService.uploadMultiple(files);
  }

  uploadFilesFromArray(filesToUpload: File[], imageNames: string[]) {
    const formData = new FormData();
    for (let i = 0; i < filesToUpload.length; i++) {
      formData.append('file', filesToUpload[i], imageNames[i]);
    }
    return this.fileService.uploadMultiple(formData);
  }

  navigateTo(link: string) {
    this.router.navigate([link]);
  }

  recursiveCompress = (image: File, index: number, array: File[]) => {
    return this.compressor.compress(image).pipe(
      map(response => {
        this.compressedImages.push(response);
        return {
          data: response,
          index: index + 1,
          array: array,
        };
      }),
    );
  }

  public process(event: any) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const currentCount = (this.images?.length || 0) + this.selectedFiles.length;
    const maxImages = 10;
    const maxAllowed = maxImages - currentCount;

    for (let i = 0; i < Math.min(files.length, maxAllowed); i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedFiles.push({
          file: file,
          preview: e.target.result
        });
      };
      reader.readAsDataURL(file);
    }

    if (files.length > maxAllowed) {
      Swal.fire({
        icon: 'warning',
        title: `Seulement ${maxAllowed} image(s) ajoutée(s). Maximum ${maxImages} au total.`,
        showConfirmButton: false,
        timer: 2000
      });
    }

    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  // Barcode Scanner Methods
  // Barcode Scanner Methods
  allowedFormats = [
    BarcodeFormat.EAN_13,
    BarcodeFormat.EAN_8,
    BarcodeFormat.CODE_128,
    BarcodeFormat.CODE_39,
    BarcodeFormat.UPC_A,
    BarcodeFormat.UPC_E,
    BarcodeFormat.ITF
  ];

  startScanner() {
    this.scannerActive = true;
    this.scannerError = '';
  }

  stopScanner() {
    this.scannerActive = false;
  }

  handleScanSuccess(result: string) {
    if (result) {
      this.ngZone.run(() => {
        this.form.get('code').setValue(result);
        this.stopScanner();
        Swal.fire({
          icon: 'success',
          title: 'Code-barres détecté !',
          text: result,
          showConfirmButton: false,
          timer: 1500
        });
      });
    }
  }

  onCamerasFound(devices: MediaDeviceInfo[]): void {
    if (!devices || devices.length === 0) {
      this.scannerError = 'Aucune caméra trouvée';
    }
  }

  onDeviceChange(device: MediaDeviceInfo): void {
    // Handle device change if needed
  }

  onScanError(error: any): void {
    console.error(error);
    // this.scannerError = 'Erreur lors du scan';
  }
}
