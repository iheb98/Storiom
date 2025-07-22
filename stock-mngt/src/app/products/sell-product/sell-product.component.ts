import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LoadingService } from 'src/app/services/loading.service';
import { ReceiptService } from 'src/app/services/receipt.service';
import Swal from 'sweetalert2';

export interface DialogData {
  product: any;
  operationType: any;
}
@Component({
  selector: 'app-sell-product',
  templateUrl: './sell-product.component.html',
  styleUrls: ['./sell-product.component.scss']
})
export class SellProductComponent {
  amountError: string | null = null;

  product = this.data?.product;
  amount
  price = this.data?.operationType == "SOLD" ? this.data?.product?.sellingPrice : this.data?.product?.buyingPrice;
  constructor(
    public dialogRef: MatDialogRef<SellProductComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private receiptService: ReceiptService,
    private loadingService: LoadingService
  ) { }



  onNoClick(): void {
    this.dialogRef.close();
  }

  confirm(): void {
    if (!this.amount || this.amount <= 0) {
      this.amountError = 'Veuillez entrer une quantité valide.';
      return;
    }

    // Clear previous error if input is now valid
    this.amountError = null;

    const body = {
      id: this.product?.id,
      amount: this.amount,
      price: this.price
    };
    if (this.data?.operationType == "SOLD") {
      this.receiptService.sellProduct(body).subscribe(response => {
        this.loadingService.screenLoaded()
        Swal.fire({
          icon: 'success',
          title: 'Produit vendu !',
          showConfirmButton: false,
          timer: 1500
        })
        this.dialogRef.close({ ...body, success: true });
      }, error => {
        this.loadingService.screenLoaded()
        Swal.fire({
          icon: 'error',
          title: 'Une erreur est survenue ! Merci de réessayer plus tard',
          showConfirmButton: false,
          timer: 1500
        })
        this.dialogRef.close({ ...body, success: false });
      })
    } else {
      this.receiptService.loadProduct(body).subscribe(response => {
        this.loadingService.screenLoaded()
        Swal.fire({
          icon: 'success',
          title: 'Produit chargé !',
          showConfirmButton: false,
          timer: 1500
        })
        this.dialogRef.close({ ...body, success: true });
      }, error => {
        this.loadingService.screenLoaded()
        Swal.fire({
          icon: 'error',
          title: 'Une erreur est survenue ! Merci de réessayer plus tard',
          showConfirmButton: false,
          timer: 1500
        })
        this.dialogRef.close({ ...body, success: false });
      })
    }


  }

}
