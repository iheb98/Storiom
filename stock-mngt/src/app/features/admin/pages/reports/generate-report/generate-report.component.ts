import { Component, OnInit } from '@angular/core';
import {
  faDownload, faFileDownload, faChartBar, faCalendarAlt, faArrowRight,
  faSearch, faSpinner, faExclamationTriangle, faChartPie, faCoins,
  faReceipt, faBox, faList, faFilePdf, faChartLine
} from '@fortawesome/free-solid-svg-icons';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AuthService } from 'src/app/core/services/auth.service';
import { StatService } from 'src/app/core/services/stat.service';

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

  // Icons
  downloadIcon = faFileDownload;
  chartBarIcon = faChartBar;
  calendarIcon = faCalendarAlt;
  arrowRightIcon = faArrowRight;
  searchIcon = faSearch;
  spinnerIcon = faSpinner;
  warningIcon = faExclamationTriangle;
  chartPieIcon = faChartPie;
  coinsIcon = faCoins;
  receiptIcon = faReceipt;
  boxIcon = faBox;
  listIcon = faList;
  pdfIcon = faFilePdf;
  chartLineIcon = faChartLine;
  constructor(
    private statService: StatService,
    private authService: AuthService
  ) {
    const today = new Date();
    this.fromDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]; // First day of the month
    this.toDate = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0]; // Last day of the month
  }
  ngOnInit(): void {
    window.scrollTo(0, 0);
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
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let yPos = 0;

    // Colors
    const primaryColor: [number, number, number] = [63, 81, 181];    // Blue
    const successColor: [number, number, number] = [46, 125, 50];    // Green
    const warningColor: [number, number, number] = [245, 124, 0];    // Orange
    const purpleColor: [number, number, number] = [124, 58, 237];    // Purple
    const textPrimary: [number, number, number] = [44, 62, 80];
    const textSecondary: [number, number, number] = [127, 140, 141];
    const bgLight: [number, number, number] = [245, 247, 250];

    // ============================================
    // HEADER WITH GRADIENT EFFECT
    // ============================================
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 45, 'F');

    // Header title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text("Rapport de Ventes", margin, 22);

    // Header subtitle
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(220, 220, 255);
    doc.text(`Periode: ${this.formatDate(this.fromDate)} - ${this.formatDate(this.toDate)}`, margin, 33);

    // Generated date on the right
    doc.setFontSize(9);
    doc.text(`Genere le: ${this.formatDate(new Date().toISOString().split('T')[0])}`, pageWidth - margin - 50, 33);

    yPos = 60;

    // ============================================
    // SUMMARY CARDS SECTION
    // ============================================
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...textPrimary);
    doc.text("Resume de la Periode", margin, yPos);
    yPos += 10;

    const cardWidth = (pageWidth - margin * 2 - 10) / 3;
    const cardHeight = 35;
    const cardY = yPos;

    // Card 1 - Total Earnings (Green)
    doc.setFillColor(232, 245, 233);
    doc.roundedRect(margin, cardY, cardWidth, cardHeight, 3, 3, 'F');
    doc.setFillColor(...successColor);
    doc.roundedRect(margin, cardY, 5, cardHeight, 2, 2, 'F');

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...successColor);
    doc.text(`${this.reportData.totalEarnings.toFixed(2)} DT`, margin + 12, cardY + 15);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...textSecondary);
    doc.text("Gains Totaux", margin + 12, cardY + 26);

    // Card 2 - Number of Receipts (Orange)
    const card2X = margin + cardWidth + 5;
    doc.setFillColor(255, 243, 224);
    doc.roundedRect(card2X, cardY, cardWidth, cardHeight, 3, 3, 'F');
    doc.setFillColor(...warningColor);
    doc.roundedRect(card2X, cardY, 5, cardHeight, 2, 2, 'F');

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...warningColor);
    doc.text(`${this.reportData.numberOfReceipts}`, card2X + 12, cardY + 15);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...textSecondary);
    doc.text("Nombre de Recus", card2X + 12, cardY + 26);

    // Card 3 - Products Sold (Purple)
    const card3X = margin + (cardWidth + 5) * 2;
    doc.setFillColor(237, 231, 246);
    doc.roundedRect(card3X, cardY, cardWidth, cardHeight, 3, 3, 'F');
    doc.setFillColor(...purpleColor);
    doc.roundedRect(card3X, cardY, 5, cardHeight, 2, 2, 'F');

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...purpleColor);
    doc.text(`${this.reportData.numberOfProductsSold}`, card3X + 12, cardY + 15);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...textSecondary);
    doc.text("Produits Vendus", card3X + 12, cardY + 26);

    yPos = cardY + cardHeight + 20;

    // ============================================
    // PRODUCTS TABLE SECTION
    // ============================================
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...textPrimary);
    doc.text("Details par Produit", margin, yPos);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...textSecondary);
    doc.text(`${this.reportData.products?.length || 0} produits`, pageWidth - margin - 25, yPos);

    yPos += 8;

    // Table
    autoTable(doc, {
      startY: yPos,
      head: [["Produit", "Prix Achat", "Prix Vente", "Quantite", "Benefices"]],
      body: this.reportData.products.map((product: any) => [
        product.productName,
        `${product.buyingPrice.toFixed(2)} DT`,
        `${product.sellingPrice.toFixed(2)} DT`,
        product.quantitySold.toString(),
        `+${product.earnings.toFixed(2)} DT`
      ]),
      theme: "plain",
      styles: {
        fontSize: 9,
        cellPadding: 6,
        textColor: textPrimary,
        lineColor: [232, 236, 239],
        lineWidth: 0.5
      },
      headStyles: {
        fillColor: bgLight,
        textColor: textSecondary,
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'left'
      },
      bodyStyles: {
        halign: 'left'
      },
      columnStyles: {
        0: { cellWidth: 'auto', fontStyle: 'bold' },
        1: { cellWidth: 30, halign: 'right' },
        2: { cellWidth: 30, halign: 'right', textColor: primaryColor },
        3: { cellWidth: 25, halign: 'center' },
        4: { cellWidth: 35, halign: 'right' }
      },
      alternateRowStyles: {
        fillColor: [250, 251, 252]
      },
      didParseCell: (data) => {
        // Style the earnings column as green
        if (data.column.index === 4 && data.section === 'body') {
          data.cell.styles.textColor = successColor;
          data.cell.styles.fontStyle = 'bold';
        }
      },
      margin: { left: margin, right: margin }
    });

    // ============================================
    // FOOTER
    // ============================================
    const footerY = pageHeight - 20;
    doc.setDrawColor(232, 236, 239);
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

    doc.setFontSize(8);
    doc.setTextColor(...textSecondary);
    doc.text("Ce rapport a ete genere automatiquement par le systeme de gestion de stock.", margin, footerY);
    doc.text(`Page 1/1`, pageWidth - margin - 15, footerY);

    // Save PDF
    doc.save(`rapport_ventes_${this.fromDate}_${this.toDate}.pdf`);
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}