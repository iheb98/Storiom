import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { faArrowLeft, faEdit, faTimes, faChartLine, faCubes, faExclamationTriangle, faEye, faInfoCircle, faTag } from '@fortawesome/free-solid-svg-icons';
import { EMPTY } from 'rxjs';
import { expand, map } from 'rxjs/operators';
import { AuthService } from 'src/app/core/services/auth.service';
import { BrandService } from 'src/app/core/services/brand.service';
import { CategoryService } from 'src/app/core/services/category.service';
import { CompressorService } from 'src/app/core/services/compressor.service';
import { FileService } from 'src/app/core/services/file.service';
import { LoadingService } from 'src/app/core/services/loading.service';
import { ProductService } from 'src/app/core/services/product.service';
import { SupplierService } from 'src/app/core/services/supplier.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-product-add',
  templateUrl: './product-add.component.html',
  styleUrls: ['./product-add.component.scss']
})
export class ProductAddComponent implements OnInit {
  environment = environment
  form: FormGroup
  submitted: boolean
  emailError: boolean
  user;
  productId
  loading;
  supplier;
  suppliers = []
  brands = []
  colors = []
  categories = []
  parentCategory
  subCategory
  subCategory2
  subCategory3
  subCategory4
  images
  compressedImages;
  data;
  selectedCategory = ''
  selectedFiles: { file: File, preview: string }[] = []
  arrowLeftIcon = faArrowLeft;

  editIcon = faEdit
  timesIcon = faTimes
  faChartLine = faChartLine;
  faCubes = faCubes;
  faExclamationTriangle = faExclamationTriangle;
  faEye = faEye;
  faInfoCircle = faInfoCircle;
  faTag = faTag;


  edit
  editCategory
  product
  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;


  constructor(private router: Router,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private supplierService: SupplierService,
    private categoryService: CategoryService,
    private productService: ProductService,
    private route: ActivatedRoute,
    private loadingService: LoadingService,
    private fileService: FileService,
    private brandService: BrandService,
    private compressor: CompressorService) { }

  ngOnInit(): void {
    this.editCategory = false
    this.loading = false;
    this.initForm();
    this.colors = environment.couleurs
    this.user = this.authService.getConnectedUser();
    this.route.paramMap.subscribe(paramMap => {
      this.productId = paramMap.get('id');
    })
    this.getSuppliers();
    this.getBrands();
    this.getCategories();
    if (this.productId) {
      this.edit = true;
      this.productService.getProduct(this.productId).subscribe(
        response => {
          this.product = response
          this.form.get('name').setValue(response?.name)
          this.form.get('description').setValue(response?.description)
          this.form.get('buyingPrice').setValue(response?.buyingPrice)
          this.form.get('brandId').setValue(response?.brand?.id)
          this.form.get('categoryId').setValue(response?.category?.id)
          this.form.get('sellingPrice').setValue(response?.sellingPrice)
          this.form.get('quantity').setValue(response?.quantity)
          this.form.get('color').setValue(response?.color)
          this.form.get('supplierId').setValue(response?.supplier?.id)
          this.form.get('size').setValue(response?.size)
          this.form.get('toDisplay').setValue(response?.toDisplay)
          //this.findParentCategories(response?.category?.id)

          this.images = response?.images
        })
    }

  }

  getSuppliers() {
    this.loadingService.screenLoading()
    this.supplierService.getAllSuppliersByStoreId(this.authService.getConnectedUser()?.store).subscribe(
      response => {
        this.loadingService.screenLoaded()
        this.suppliers = response
      }
    )
  }


  getBrands() {
    this.loadingService.screenLoading()
    this.brandService.getBrandsByStoreId(this.authService.getConnectedUser()?.store).subscribe(
      response => {
        this.loadingService.screenLoaded()
        this.brands = response
      }
    )
  }

  getCategories() {
    this.loadingService.screenLoading()
    this.categoryService.getFlatCategoriesByStoreId(this.authService.getConnectedUser()?.store).subscribe(
      response => {
        this.loadingService.screenLoaded()
        this.categories = response
      }
    )
  }

  initForm() {
    this.form = this.formBuilder.group({
      name: [null, Validators.required],
      criticalStockIndicator: [0],
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
      toDisplay: [true],
      images: [null],
      date: [(new Date()).toISOString().substring(0, 16)]
    });
  }

  create() {
    this.submitted = true;
    this.emailError = false;
    let fileName = null;
    const imageNames = [];
    let counter = 1;

    // Get files from selectedFiles array
    const filesToUpload = this.selectedFiles.map(sf => sf.file);

    if ((this.images?.length || 0) + filesToUpload.length > 3) {
      Swal.fire({
        icon: 'error',
        title: 'Vous pouvez selectionnez seulement 3 images',
        showConfirmButton: false,
        timer: 1500
      })
      return
    }

    for (let item of filesToUpload) {
      fileName = this.authService.getConnectedUser().id + '-' + new Date().getTime() + (counter++) + item?.name.substring(item.name.lastIndexOf('.'))
      imageNames.push(fileName)
    }

    if (this.form.valid) {
      this.loadingService.screenLoading()
      this.uploadFilesFromArray(filesToUpload, imageNames).subscribe(
        response => {
          const filenames = response.files.map(file => file.location.split('/').pop());
          this.form.get('images').setValue(filenames)
          this.productService.addProduct({ ...this.form.getRawValue(), storeId: this.user?.store })
            .subscribe(response => {
              this.loadingService.screenLoaded()
              Swal.fire({
                icon: 'success',
                title: 'Produit ajouté !',
                showConfirmButton: false,
                timer: 1500
              })
              this.router.navigate(['products'])
            }, error => {
              this.loadingService.screenLoaded()
              Swal.fire({
                icon: 'error',
                title: 'Une erreur est survenue ! Merci de réessayer plus tard',
                showConfirmButton: false,
                timer: 1500
              })
            })
        }
      )
    }
  }

  update() {
    this.submitted = true;
    this.emailError = false;

    // Get files from selectedFiles array
    const filesToUpload = this.selectedFiles.map(sf => sf.file);
    const newImageNames = []
    let counter = 1;
    let fileName = null;

    if ((this.images?.length || 0) + filesToUpload.length > 3) {
      Swal.fire({
        icon: 'error',
        title: 'Vous pouvez selectionnez seulement 3 images',
        showConfirmButton: false,
        timer: 1500
      })
      return
    }

    for (let item of filesToUpload) {
      fileName = this.authService.getConnectedUser().id + '-' + new Date().getTime() + (counter++) + item?.name.substring(item.name.lastIndexOf('.'))
      newImageNames.push(fileName)
    }

    if (this.form.valid) {
      this.loadingService.screenLoading()
      this.uploadFilesFromArray(filesToUpload, newImageNames).subscribe(
        response => {
          const filenames = response.files.map(file => file.location.split('/').pop());
          this.form.get('images').setValue([...this.images, ...filenames])
          this.productService.updateProduct({ ...this.form.getRawValue(), storeId: this.user?.store, id: this.product?.id })
            .subscribe(response => {
              this.loadingService.screenLoaded()
              Swal.fire({
                icon: 'success',
                title: 'Produit modifié !',
                showConfirmButton: false,
                timer: 1500
              })
              this.router.navigate(['products'])
            }, error => {
              this.loadingService.screenLoaded()
              Swal.fire({
                icon: 'error',
                title: 'Une erreur est survenue ! Merci de réessayer plus tard',
                showConfirmButton: false,
                timer: 1500
              })
            })
        }
      )
    }
  }

  getLastCategory() {
    if (this.subCategory4)
      return this.subCategory4
    if (this.subCategory3)
      return this.subCategory3
    if (this.subCategory2)
      return this.subCategory2
    if (this.subCategory)
      return this.subCategory
    if (this.parentCategory)
      return this.parentCategory
  }

  findParentCategories(id) {
    this.categoryService.getParentCategory(id).subscribe(response => {
      this.getSelectedCategory(response)
      return response
    })
  }

  getSelectedCategory(category) {
    this.selectedCategory = category?.name
    if (category?.parentCategory) {
      this.selectedCategory = category?.parentCategory?.name + ' > ' + this.selectedCategory
      if (category?.parentCategory?.parentCategory) {
        this.selectedCategory = category?.parentCategory?.parentCategory?.name + ' > ' + this.selectedCategory
        if (category?.parentCategory?.parentCategory?.parentCategory) {
          this.selectedCategory = category?.parentCategory?.parentCategory?.parentCategory?.name + ' > ' + this.selectedCategory
          if (category?.parentCategory?.parentCategory?.parentCategory?.parentCategory) {
            this.selectedCategory = category?.parentCategory?.parentCategory?.parentCategory?.parentCategory?.name + ' > ' + this.selectedCategory
          }
        }
      }
    }
  }


  categoryChanged(categoryDepth) {
    if (categoryDepth == 0) {
      this.subCategory = null
      this.subCategory2 = null
      this.subCategory3 = null
      this.subCategory4 = null
    } else if (categoryDepth == 1) {
      this.subCategory2 = null
      this.subCategory3 = null
      this.subCategory4 = null
    } else if (categoryDepth == 2) {
      this.subCategory3 = null
      this.subCategory4 = null
    } else if (categoryDepth == 3) {
      this.subCategory4 = null
    }

  }


  deleteImage(item) {
    this.images = this.images.filter(element => element != item)
  }

  removeSelectedFile(index: number) {
    this.selectedFiles.splice(index, 1)
  }

  uploadImages(FilesToUpload, images) {
    const files = new FormData();
    for (let i = 0; i < FilesToUpload?.length; i++) {
      files.append('file', FilesToUpload[i], images[i])
    }
    return this.fileService.uploadMultiple(files)
  }

  uploadFilesFromArray(filesToUpload: File[], imageNames: string[]) {
    const formData = new FormData();
    for (let i = 0; i < filesToUpload.length; i++) {
      formData.append('file', filesToUpload[i], imageNames[i])
    }
    return this.fileService.uploadMultiple(formData)
  }

  navigateTo(link) {
    this.router.navigate([link])
  }

  recursiveCompress = (image: File, index, array) => {
    return this.compressor.compress(image).pipe(
      map(response => {
        console.log('compressed ' + index + image.name);
        this.compressedImages.push(response);
        return {
          data: response,
          index: index + 1,
          array: array,
        };
      }),
    );
  }

  public process(event) {
    this.data = event.target.files;
    this.compressedImages = [];
    console.log('input: ' + this.data);

    // Add files to selectedFiles array with previews
    const currentCount = (this.images?.length || 0) + this.selectedFiles.length;
    const maxAllowed = 3 - currentCount;

    for (let i = 0; i < Math.min(this.data.length, maxAllowed); i++) {
      const file = this.data[i];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedFiles.push({
          file: file,
          preview: e.target.result
        });
      };
      reader.readAsDataURL(file);
    }

    if (this.data.length > maxAllowed) {
      Swal.fire({
        icon: 'warning',
        title: `Seulement ${maxAllowed} image(s) ajoutée(s). Maximum 3 au total.`,
        showConfirmButton: false,
        timer: 2000
      });
    }

    // Reset file input
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }

    const compress = this.recursiveCompress(this.data[0], 0, this.data).pipe(
      expand(res => {
        return res.index > res.array.length - 1
          ? EMPTY
          : this.recursiveCompress(this.data[res.index], res.index, this.data);
      }),
    );
    compress.subscribe(res => {
      if (res.index > res.array.length - 1) {
        console.log('Compression successful ' + this.compressedImages);
      }
    });
  }
}
