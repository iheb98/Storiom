import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReceiptService } from 'src/app/core/services/receipt.service';
import { ElementRef, ViewChild } from '@angular/core';

import * as html2pdf from 'html2pdf.js';
import { faAngleDoubleLeft, faFilePdf, faPrint } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/core/services/auth.service';
import { StoreService } from 'src/app/core/services/store.service';
import { environment } from 'src/environments/environment.prod';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-receipt-view',
  templateUrl: './receipt-view.component.html',
  styleUrls: ['./receipt-view.component.scss']
})
export class ReceiptViewComponent implements OnInit {
  @ViewChild('receiptSection')
  receiptSection!: ElementRef;

  // Hidden invoice for PDF generation
  @ViewChild('printingInvoice') printingInvoice!: ElementRef;

  // Icons
  pdfIcon = faFilePdf;
  printIcon = faPrint;
  backIcon = faAngleDoubleLeft;

  environment = environment;
  store;
  receiptId;
  receipt;

  // Loading States
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private receiptService: ReceiptService,
    private storeService: StoreService,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'auto' });
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    }, 0);
    this.receiptId = this.route.snapshot.paramMap.get('id');
    this.loadData();
  }

  loadData() {
    this.isLoading = true;

    // Load store
    this.storeService.getStore(this.authService.getConnectedUser()?.store).subscribe(
      response => {
        this.store = response;
      }
    );

    // Load receipt
    this.receiptService.getReceipt(this.receiptId).subscribe(
      response => {
        this.receipt = response;
        this.isLoading = false;
      },
      error => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Erreur lors du chargement de la facture',
          showConfirmButton: false,
          timer: 2000
        });
      }
    );
  }

  print() {
    window.print();
  }

  downloadAsPDF() {
    // Use the hidden invoice component for PDF generation (same approach as receipts-mngt)
    setTimeout(() => {
      try {
        const content = this.printingInvoice.nativeElement;
        const storeName = this.store?.name || '';
        const storePhone = this.store?.phone || '';
        const storeEmail = this.store?.email || '';
        const footerText = `${storeName} | Tél: ${storePhone} | ${storeEmail}`;

        const options = {
          margin: 0,
          filename: this.receipt?.code + '.pdf',
          image: { type: 'png', quality: 0.98 },
          html2canvas: { scale: 2, windowWidth: 1200 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf()
          .from(content)
          .set(options)
          .toPdf()
          .get('pdf')
          .then((pdf) => {
            const totalPages = pdf.internal.getNumberOfPages();
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            for (let i = 1; i <= totalPages; i++) {
              pdf.setPage(i);
              pdf.setFontSize(8);
              pdf.setTextColor(128, 128, 128); // Gray color

              // Add footer text centered at bottom
              pdf.text(footerText, pageWidth / 2, pageHeight - 8, { align: 'center' });

              // Add page number
              pdf.text(`Page ${i} / ${totalPages}`, pageWidth - 15, pageHeight - 8, { align: 'right' });
            }
          })
          .save()
          .catch((err) => {
            console.error("PDF Generation Error:", err);
            Swal.fire('Erreur', 'Erreur lors de la génération du PDF.', 'error');
          });
      } catch (e) {
        console.error("PDF Setup Error:", e);
        Swal.fire('Erreur', 'Erreur lors de la préparation du PDF.', 'error');
      }
    }, 100);
  }

  back() {
    this.router.navigate(['/receipts']);
  }
}
