import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-subscription',
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.scss']
})
export class SubscriptionComponent {
  constructor(public dialogRef: MatDialogRef<SubscriptionComponent>) { }

  closeDialog(): void {
    this.dialogRef.close();
  }

}
