import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
  animal: string;
  name: string;
}
@Component({
  selector: 'app-brand-add',
  templateUrl: './brand-add.component.html',
  styleUrls: ['./brand-add.component.scss']
})
export class BrandAddComponent {

  brandName = this.data;
  constructor(
    public dialogRef: MatDialogRef<BrandAddComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {}



  onNoClick(): void {
    this.dialogRef.close();
  }


}
