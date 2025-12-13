import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { faEdit, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import { AddProductFromReceiptComponent } from 'src/app/features/admin/pages/products/add-product-from-receipt/add-product-from-receipt.component';
import { ProductAddComponent } from 'src/app/features/admin/pages/products/product-add/product-add.component';
import { ProductsSearchReceiptComponent } from 'src/app/features/admin/pages/products/products-search-receipt/products-search-receipt.component';
import { AuthService } from 'src/app/core/services/auth.service';
import { BrandService } from 'src/app/core/services/brand.service';
import { CategoryService } from 'src/app/core/services/category.service';
import { FileService } from 'src/app/core/services/file.service';
import { LoadingService } from 'src/app/core/services/loading.service';
import { ProductService } from 'src/app/core/services/product.service';
import { ReceiptService } from 'src/app/core/services/receipt.service';
import { SupplierService } from 'src/app/core/services/supplier.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-receipt-add',
  templateUrl: './receipt-add.component.html',
  styleUrls: ['./receipt-add.component.scss']
})
export class ReceiptAddComponent implements OnInit {

  types = [{ value: "LOADED", label: "Chargement" }, { value: "SOLD", label: "Vente" }, { value: "RETURNED", label: "Retour" }]
  suppliers;
  form: FormGroup;
  receiptType;
  selectedProducts = [];
  total;
  validated = false



  faTrash = faTrash;
  faEdit = faEdit;

  currentPage = 0;
  currentSize = 10;

  constructor(
    private loadingService: LoadingService,
    private authService: AuthService,
    private supplierService: SupplierService,
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    private receiptService: ReceiptService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getSuppliers();
    this.initForm();
  }




  addProducts() {
    const dialogRef = this.dialog.open(ProductsSearchReceiptComponent, { width: '80%', data: { selectedProducts: this.selectedProducts, receiptType: this.form.get('type').value } });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.selectedProducts = result?.selectedProducts
        this.calculateTotal()
        //this.loadingService.screenLoading()
      }
    });
  }

  calculateTotal() {
    this.total = 0;
    this.selectedProducts.forEach(item => {
      if (item?.price && item?.amount)
        this.total += item?.price * item?.amount
    })
  }

  addNewProduct() {
    const dialogRef = this.dialog.open(AddProductFromReceiptComponent, { width: '80%', data: { selectedProducts: this.selectedProducts, receiptType: this.form.get('type').value } });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.selectedProducts = result?.selectedProducts
        this.calculateTotal()
        //this.loadingService.screenLoading()
      }
    });
  }

  initForm() {
    let currentDate = new Date();
    this.form = this.formBuilder.group({
      type: [null, Validators.required],
      supplierId: [null],
      name: [null],
      tva: [19],
      date: [(new Date()).toISOString().substring(0, 16)]

    });
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

  create() {
    if (this.form.valid) {
      this.checkQuantity()

      if (this.form.get('type').value == 'SOLD' && this.checkQuantity())
        Swal.fire({
          title: 'Certains produits ont dépassé la quantité disponible, êtes vous sûr de continuer malgré ça ?',
          denyButtonText: `Annuler`,
          showDenyButton: true,
          confirmButtonText: 'Continuer',
        }).then((result) => {
          if (result.isConfirmed) {
            this.loadingService.screenLoading()
            let form = this.form.getRawValue();
            let newReceipt = {
              type: form.type,
              name: form.name,
              supplierId: form.supplierId,
              date: form.date,
              tva: form.tva,
              operations: this.selectedProducts,
              storeId: this.authService.getConnectedUser()?.store
            }
            this.receiptService.addReceipt(newReceipt).subscribe(response => {
              this.loadingService.screenLoaded()
              Swal.fire({
                icon: 'success',
                title: 'Facture créée !',
                showConfirmButton: false,
                timer: 1500
              })
              this.router.navigate(['receipts'])
            })
          }
        })
      else if (this.form.get('type').value == 'SOLD') {
        this.loadingService.screenLoading()
        let form = this.form.getRawValue();
        let newReceipt = {
          type: form.type,
          name: form.name,
          supplierId: form.supplierId,
          date: form.date,
          tva: form.tva,
          operations: this.selectedProducts,
          storeId: this.authService.getConnectedUser()?.store
        }
        this.receiptService.addReceipt(newReceipt).subscribe(response => {
          this.loadingService.screenLoaded()
          Swal.fire({
            icon: 'success',
            title: 'Facture créée !',
            showConfirmButton: false,
            timer: 1500
          })
          this.router.navigate(['receipts'])
        })
      }
      else {
        this.loadingService.screenLoading()
        let form = this.form.getRawValue();
        let newReceipt = {
          type: form.type,
          name: form.name,
          supplierId: form.supplierId,
          date: form.date,
          tva: form.tva,
          operations: this.selectedProducts,
          storeId: this.authService.getConnectedUser()?.store
        }
        this.receiptService.addReceipt(newReceipt).subscribe(response => {
          this.loadingService.screenLoaded()
          Swal.fire({
            icon: 'success',
            title: 'Facture créée !',
            showConfirmButton: false,
            timer: 1500
          })
          this.router.navigate(['receipts'])
        })
      }
    }
    else {
      Swal.fire({
        icon: 'error',
        title: 'Veuillez remplir les champs obligatoirs !',
        showConfirmButton: false,
        timer: 1500
      })
      this.validated = true
    }
  }

  handlePageEvent(event) {
    this.currentPage = event.pageIndex;
    this.currentSize = event.pageSize;
  }

  deleteProduct(id) {

  }
  viewProduct(id) {

  }

  checkQuantity() {
    let test = false
    this.selectedProducts.forEach(item => {
      if (item.amount > item.quantity)
        test = true
    })
    return test
  }

  navigateTo(link: string) {
    this.router.navigate([link])
  }

}
