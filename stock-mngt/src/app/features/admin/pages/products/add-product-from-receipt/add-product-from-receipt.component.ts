import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { faArrowLeft, faEdit, faTimes, faChartLine, faAlignLeft } from '@fortawesome/free-solid-svg-icons';
import { EMPTY } from 'rxjs';
import { expand, map } from 'rxjs/operators';
import { AuthService } from 'src/app/core/services/auth.service';
import { BrandService } from 'src/app/core/services/brand.service';
import { CategoryService } from 'src/app/core/services/category.service';
import { CompressorService } from 'src/app/core/services/compressor.service';
import { FileService } from 'src/app/core/services/file.service';

import { ProductService } from 'src/app/core/services/product.service';
import { SupplierService } from 'src/app/core/services/supplier.service';
import { UserSettingsService } from 'src/app/core/services/user-settings.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-add-product-from-receipt',
  templateUrl: './add-product-from-receipt.component.html',
  styleUrls: ['./add-product-from-receipt.component.scss']
})
export class AddProductFromReceiptComponent implements OnInit {
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
  images;
  compressedImages;
  data;
  selectedCategory = ''
  arrowLeftIcon = faArrowLeft;

  editIcon = faEdit
  timesIcon = faTimes
  faChartLine = faChartLine;
  faAlignLeft = faAlignLeft;


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

    private fileService: FileService,
    private brandService: BrandService,
    public dialogRef: MatDialogRef<AddProductFromReceiptComponent>,
    public compressor: CompressorService,
    private userSettingsService: UserSettingsService
  ) { }

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
          this.form.get('sellingPrice').setValue(response?.sellingPrice)
          this.form.get('quantity').setValue(response?.quantity)
          this.form.get('color').setValue(response?.color)
          this.form.get('supplierId').setValue(response?.supplier?.id)
          this.form.get('size').setValue(response?.size)
          this.findParentCategories(response?.category?.id)

          this.images = response?.images
        })
    }

  }

  getSuppliers() {

    this.supplierService.getAllSuppliersByStoreId(this.authService.getConnectedUser()?.store).subscribe(
      response => {

        this.suppliers = response
      }
    )
  }


  getBrands() {

    this.brandService.getBrandsByStoreId(this.authService.getConnectedUser()?.store).subscribe(
      response => {

        this.brands = response
      }
    )
  }

  getCategories() {

    this.categoryService.getCategoriesByStoreId(this.authService.getConnectedUser()?.store).subscribe(
      response => {

        this.categories = response
      }
    )
  }

  initForm() {
    // Get default visibility from user settings
    const defaultVisibility = this.userSettingsService.currentSettings?.defaults?.productVisibleToPublic ?? true;

    this.form = this.formBuilder.group({
      name: [null, Validators.required],
      supplierId: [null],
      brandId: [null],
      quantity: [0],
      unit: [null],
      size: [null],
      color: [null],
      description: [null],
      buyingPrice: [null],
      sellingPrice: [null],
      toDisplay: [defaultVisibility],
      criticalStockIndicator: [0],
      activateCriticalStockIndicator: [false],
      images: [null]
    });
  }

  create() {
    this.submitted = true;
    this.emailError = false;
    let fileName = null;
    const images = [];
    let counter = 1;
    if (this.images?.length + this.fileInput.nativeElement.files.length > 3) {
      Swal.fire({
        icon: 'error',
        title: 'Vous pouvez selectionnez seulement 3 images',
        showConfirmButton: false,
        timer: 1500
      })
      return
    }
    if (this.fileInput.nativeElement.files)
      for (let item of this.fileInput.nativeElement.files) {
        fileName = this.authService.getConnectedUser().id + '-' + new Date().getTime() + (counter++) + item?.name.substring(item.name.lastIndexOf('.'))
        images.push(fileName)
      }

    if (this.form.valid) {

      this.uploadImages(this.fileInput.nativeElement.files, images).subscribe(
        response => {
          const filenames = response.files.map(file => file.location.split('/').pop());
          this.form.get('images').setValue(filenames)
          this.productService.addProduct({ ...this.form.getRawValue(), categoryId: this.getLastCategory()?.id, storeId: this.user?.store })
            .subscribe(response => {

              Swal.fire({
                icon: 'success',
                title: 'Produit ajouté !',
                showConfirmButton: false,
                timer: 1500
              })
              this.dialogRef.close()
              //this.router.navigate(['products'])
            }, error => {

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
    const images = []
    for (let item of this.images) {
      images.push(item)
    }
    const newImages = []
    let counter = 1;
    let fileName = null;
    if (this.images?.length + this.fileInput.nativeElement.files.length > 3) {
      Swal.fire({
        icon: 'error',
        title: 'Vous pouvez selectionnez seulement 3 images',
        showConfirmButton: false,
        timer: 1500
      })
      return
    }
    if (this.fileInput.nativeElement.files)
      for (let item of this.fileInput.nativeElement.files) {
        fileName = this.authService.getConnectedUser().id + '-' + new Date().getTime() + (counter++) + item?.name.substring(item.name.lastIndexOf('.'))
        images.push(fileName)
        newImages.push(fileName)
      }
    if (this.form.valid) {

      this.uploadImages(this.fileInput.nativeElement.files, newImages).subscribe(
        response => {
          const filenames = response.files.map(file => file.location.split('/').pop());
          this.form.get('images').setValue(filenames)
          console.log(filenames)

          this.productService.updateProduct({ ...this.form.getRawValue(), categoryId: (this.editCategory ? this.getLastCategory()?.id : this.product?.category?.id), storeId: this.user?.store, id: this.product?.id })
            .subscribe(response => {
              Swal.fire({
                icon: 'success',
                title: 'Produit modifié !',
                showConfirmButton: false,
                timer: 1500
              })
            }, error => {

              Swal.fire({
                icon: 'error',
                title: 'Une erreur est survenue ! Merci de réessayer plus tard',
                showConfirmButton: false,
                timer: 1500
              })
            })
          this.router.navigate(['products'])
        }
      )

    }
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
    const compress = this.recursiveCompress(this.data[0], 0, this.data).pipe(
      expand(res => {
        return res.index > res.array.length - 1
          ? EMPTY
          : this.recursiveCompress(this.data[res.index], res.index, this.data);
      }),
    );
    compress.subscribe(res => {
      if (res.index > res.array.length - 1) {


        //Code block after completing all compression
        console.log('Compression successful ' + this.compressedImages);
      }
    });
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

  uploadImages(FilesToUpload, images) {
    const files = new FormData();
    for (let i = 0; i < FilesToUpload?.length; i++) {
      files.append('file', FilesToUpload[i], images[i])
    }
    return this.fileService.uploadMultiple(files)
  }

  navigateTo(link) {
    this.router.navigate([link])
  }
}
