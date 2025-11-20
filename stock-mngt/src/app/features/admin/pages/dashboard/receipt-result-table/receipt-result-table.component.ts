import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { ProductService } from 'src/app/core/services/product.service';
import { ReceiptService } from 'src/app/core/services/receipt.service';

@Component({
  selector: 'app-receipt-result-table',
  templateUrl: './receipt-result-table.component.html',
  styleUrls: ['./receipt-result-table.component.scss']
})
export class ReceiptResultTableComponent implements OnInit {
  user;
  receipts = []
  constructor(
    private receiptService: ReceiptService,
    private productService: ProductService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.user = this.authService.getConnectedUser()
    this.getLastOperations()
  }


  getLastOperations() {
    this.receiptService.getLastOperationsByStoreId(this.user?.store).subscribe(
      response => {
        this.receipts = response.slice(0, 5)
      }
    )
  }

}
