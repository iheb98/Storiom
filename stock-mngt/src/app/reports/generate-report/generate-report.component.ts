import { Component, OnInit } from '@angular/core';
import { faDownload, faFileDownload } from '@fortawesome/free-solid-svg-icons';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AuthService } from 'src/app/services/auth.service';
import { StatService } from 'src/app/services/stat.service';

@Component({
  selector: 'app-generate-report',
  templateUrl: './generate-report.component.html',
  styleUrls: ['./generate-report.component.scss']
})
export class GenerateReportComponent implements OnInit {

  fromDate: string;
  toDate: string;
  reportData: any = null;
  loading = false;
  errorMessage: string | null = null;
  downloadIcon = faFileDownload
  constructor(
    private statService: StatService,
    private authService: AuthService
  ) {
    const today = new Date();
    this.fromDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]; // First day of the month
    this.toDate = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0]; // Last day of the month
  }
  ngOnInit(): void {
  }

  generateReport() {
    this.loading = true;
    this.errorMessage = null;
    this.reportData = null;

    this.statService.generateReport(this.authService.getConnectedUser()?.store, this.fromDate, this.toDate).subscribe(response => {
      this.reportData = response;
      this.loading = false;
    },
      (error) => {
        this.errorMessage = error.error.message || "Erreur lors de la génération du rapport.";
        this.loading = false;
      }
    )
  }

  downloadPDF() {
    if (!this.reportData) return;

    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");

    // Title
    doc.setFontSize(18);
    doc.text("Rapport de Vente", 15, 15);

    // Dates
    doc.setFontSize(12);
    doc.text(`Période : ${this.fromDate} - ${this.toDate}`, 15, 25);

    // Summary
    doc.text(`Gains totaux: ${this.reportData.totalEarnings} TND`, 15, 35);
    doc.text(`Nombre de reçus: ${this.reportData.numberOfReceipts}`, 15, 45);
    doc.text(`Nombre de produits vendus: ${this.reportData.numberOfProductsSold}`, 15, 55);

    // Table
    autoTable(doc, {
      startY: 65,
      head: [["Produit", "Prix Achat", "Prix Vente", "Quantité Vendue", "Bénéfices"]],
      body: this.reportData.products.map((product: any) => [
        product.productName,
        `${product.buyingPrice} TND`,
        `${product.sellingPrice} TND`,
        product.quantitySold,
        `${product.earnings} TND`
      ]),
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [0, 123, 255], textColor: 255, fontSize: 12 }
    });

    // Save PDF
    doc.save(`rapport_${this.fromDate}_to_${this.toDate}.pdf`);
  }

}