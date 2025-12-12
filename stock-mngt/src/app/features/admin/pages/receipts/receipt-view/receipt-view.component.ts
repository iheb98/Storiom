import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReceiptService } from 'src/app/core/services/receipt.service';
import { ElementRef, ViewChild } from '@angular/core';

declare var require: any;
import * as html2pdf from 'html2pdf.js';

import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { faAngleDoubleLeft, faBackward, faFilePdf, faPrint } from '@fortawesome/free-solid-svg-icons';
import { LoadingService } from 'src/app/core/services/loading.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { StoreService } from 'src/app/core/services/store.service';
import { environment } from 'src/environments/environment.prod';
const htmlToPdfmake = require("html-to-pdfmake");
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-receipt-view',
  templateUrl: './receipt-view.component.html',
  styleUrls: ['./receipt-view.component.scss']
})
export class ReceiptViewComponent implements OnInit {
  @ViewChild('receiptSection')
  receiptSection!: ElementRef;
  pdfIcon = faFilePdf
  printIcon = faPrint
  backIcon = faAngleDoubleLeft
  environment = environment
  store;
  receiptId;
  receipt;
  constructor(
    private route: ActivatedRoute,
    private receiptService: ReceiptService,
    private storeService: StoreService,
    private router: Router,
    private loadingService: LoadingService,
    private authService: AuthService
  ) { }


  ngOnInit(): void {
    this.receiptId = this.route.snapshot.paramMap.get('id');
    this.storeService.getStore(this.authService.getConnectedUser()?.store).subscribe(
      response => {
        this.store = response
        console.log(this.store)

      }
    );


    this.loadingService.screenLoading()
    this.receiptService.getReceipt(this.receiptId).subscribe(response => {
      this.receipt = response
      console.log(this.receipt)
      this.loadingService.screenLoaded()
    })
  }



  print() {
    window.print();
  }

  downloadAsPDF() {
    const content = this.receiptSection.nativeElement;
    const options = {
      margin: [0, 0, 0, 0],
      filename: this.receipt?.code + '.pdf',
      image: { type: 'png', quality: 0.98 },
      html2canvas: { scale: 2, windowWidth: 1200 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    console.log(content)
    html2pdf().from(content).set(options).save();
  }

  back() {
    this.router.navigate(['/receipts'])
  }
}
