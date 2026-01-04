import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { ReceiptService } from 'src/app/core/services/receipt.service';
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
  operationDate: string = this.formatDateTimeLocal(new Date());
  constructor(
    public dialogRef: MatDialogRef<SellProductComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private receiptService: ReceiptService,

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
      price: this.price,
      date: this.operationDate ? new Date(this.operationDate).toISOString() : new Date().toISOString()
    };
    if (this.data?.operationType == "SOLD") {
      this.receiptService.sellProduct(body).subscribe(response => {

        Swal.fire({
          icon: 'success',
          title: 'Produit vendu !',
          showConfirmButton: false,
          timer: 1500
        })
        this.dialogRef.close({ ...body, success: true });
      }, error => {

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

        Swal.fire({
          icon: 'success',
          title: 'Produit chargé !',
          showConfirmButton: false,
          timer: 1500
        })
        this.dialogRef.close({ ...body, success: true });
      }, error => {

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

  formatDateTimeLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
}
