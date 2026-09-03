import { Component, OnInit } from '@angular/core';
import {
  faDownload, faFileDownload, faChartBar, faCalendarAlt, faArrowRight,
  faSearch, faSpinner, faExclamationTriangle, faChartPie, faCoins,
  faReceipt, faBox, faList, faFilePdf, faChartLine, faTruck, faExchangeAlt,
  faWarehouse, faBoxOpen
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
  reportType: 'sales' | 'load' | 'both' = 'sales';
  includeDeleted = false;
  reportData: any = null;
  loading = false;
  errorMessage: string | null = null;

  // Stock export
  stockData: any = null;
  stockLoading = false;
  stockIncludeDeleted = false;
  stockErrorMessage: string | null = null;

  // Profit report
  profitData: any = null;
  profitLoading = false;
  profitFromDate: string;
  profitToDate: string;
  profitErrorMessage: string | null = null;
  profitIncludeDeleted = false;

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
  truckIcon = faTruck;
  exchangeIcon = faExchangeAlt;
  warehouseIcon = faWarehouse;
  boxOpenIcon = faBoxOpen;
  constructor(
    private statService: StatService,
    private authService: AuthService
  ) {
    const today = new Date();
    this.fromDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    this.toDate = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
    this.profitFromDate = this.fromDate;
    this.profitToDate = this.toDate;
  }
  ngOnInit(): void {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'auto' });
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    }, 0);
  }

  generateReport() {
    this.loading = true;
    this.errorMessage = null;
    this.reportData = null;

    this.statService.generateReport(this.authService.getConnectedUser()?.store, this.fromDate, this.toDate, this.reportType, this.includeDeleted).subscribe(response => {
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
    const dangerColor: [number, number, number] = [198, 40, 40];     // Red
    const textPrimary: [number, number, number] = [44, 62, 80];
    const textSecondary: [number, number, number] = [127, 140, 141];
    const bgLight: [number, number, number] = [245, 247, 250];

    const rt = this.reportData.reportType || 'sales';
    const titleMap = { sales: 'Rapport de Ventes', load: 'Rapport de Chargement', both: 'Rapport Complet (Ventes & Chargement)' };
    const fileMap = { sales: 'ventes', load: 'chargement', both: 'complet' };

    // ============================================
    // HEADER WITH GRADIENT EFFECT
    // ============================================
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 45, 'F');

    // Header title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text(titleMap[rt] || titleMap.sales, margin, 22);

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

    const showSales = rt === 'sales' || rt === 'both';
    const showLoad = rt === 'load' || rt === 'both';
    const cardCount = (showSales ? 2 : 0) + (showLoad ? 1 : 0) + 1; // +1 for receipts
    const cardWidth = (pageWidth - margin * 2 - (cardCount - 1) * 5) / cardCount;
    const cardHeight = 35;
    const cardY = yPos;
    let cardIdx = 0;

    const drawCard = (label: string, value: string, bgRgb: [number,number,number], accentRgb: [number,number,number]) => {
      const x = margin + cardIdx * (cardWidth + 5);
      doc.setFillColor(...bgRgb);
      doc.roundedRect(x, cardY, cardWidth, cardHeight, 3, 3, 'F');
      doc.setFillColor(...accentRgb);
      doc.roundedRect(x, cardY, 5, cardHeight, 2, 2, 'F');
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(...accentRgb);
      doc.text(value, x + 12, cardY + 15);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...textSecondary);
      doc.text(label, x + 12, cardY + 26);
      cardIdx++;
    };

    if (showSales) {
      drawCard('Gains Totaux', `${this.reportData.totalEarnings.toFixed(2)} DT`, [232, 245, 233], successColor);
      drawCard('Produits Vendus', `${this.reportData.numberOfProductsSold}`, [237, 231, 246], purpleColor);
    }
    if (showLoad) {
      drawCard('Cout Chargement', `${this.reportData.totalCost.toFixed(2)} DT`, [255, 235, 238], dangerColor);
    }
    drawCard('Nombre de Recus', `${this.reportData.numberOfReceipts}`, [255, 243, 224], warningColor);

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

    // Dynamic table headers and rows based on reportType
    let head: string[][] = [];
    let body: string[][] = [];
    let colStyles: any = {};
    let earningsColIdx = -1;
    let costColIdx = -1;

    if (rt === 'sales') {
      head = [["Produit", "Prix Achat", "Prix Vente", "Qte Vendue", "Benefices"]];
      body = this.reportData.products.map((p: any) => [
        p.productName, `${p.buyingPrice.toFixed(2)} DT`, `${p.sellingPrice.toFixed(2)} DT`,
        p.quantitySold.toString(), `+${p.earnings.toFixed(2)} DT`
      ]);
      earningsColIdx = 4;
      colStyles = { 0: { cellWidth: 'auto', fontStyle: 'bold' }, 1: { cellWidth: 30, halign: 'right' }, 2: { cellWidth: 30, halign: 'right', textColor: primaryColor }, 3: { cellWidth: 25, halign: 'center' }, 4: { cellWidth: 35, halign: 'right' } };
    } else if (rt === 'load') {
      head = [["Produit", "Prix Achat", "Qte Chargee", "Cout Total"]];
      body = this.reportData.products.map((p: any) => [
        p.productName, `${p.buyingPrice.toFixed(2)} DT`,
        p.quantityLoaded.toString(), `${p.loadCost.toFixed(2)} DT`
      ]);
      costColIdx = 3;
      colStyles = { 0: { cellWidth: 'auto', fontStyle: 'bold' }, 1: { cellWidth: 30, halign: 'right' }, 2: { cellWidth: 30, halign: 'center' }, 3: { cellWidth: 35, halign: 'right' } };
    } else {
      head = [["Produit", "Prix Achat", "Prix Vente", "Vendu", "Charge", "Benefices", "Cout"]];
      body = this.reportData.products.map((p: any) => [
        p.productName, `${p.buyingPrice.toFixed(2)} DT`, `${p.sellingPrice.toFixed(2)} DT`,
        p.quantitySold.toString(), p.quantityLoaded.toString(),
        `+${p.earnings.toFixed(2)} DT`, `${p.loadCost.toFixed(2)} DT`
      ]);
      earningsColIdx = 5;
      costColIdx = 6;
      colStyles = { 0: { cellWidth: 'auto', fontStyle: 'bold' }, 1: { cellWidth: 25, halign: 'right' }, 2: { cellWidth: 25, halign: 'right', textColor: primaryColor }, 3: { cellWidth: 18, halign: 'center' }, 4: { cellWidth: 18, halign: 'center' }, 5: { cellWidth: 30, halign: 'right' }, 6: { cellWidth: 28, halign: 'right' } };
    }

    // Table
    autoTable(doc, {
      startY: yPos,
      head,
      body,
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
      columnStyles: colStyles,
      alternateRowStyles: {
        fillColor: [250, 251, 252]
      },
      didParseCell: (data) => {
        if (data.section === 'body') {
          if (earningsColIdx >= 0 && data.column.index === earningsColIdx) {
            data.cell.styles.textColor = successColor;
            data.cell.styles.fontStyle = 'bold';
          }
          if (costColIdx >= 0 && data.column.index === costColIdx) {
            data.cell.styles.textColor = dangerColor;
            data.cell.styles.fontStyle = 'bold';
          }
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
    doc.save(`rapport_${fileMap[rt] || 'ventes'}_${this.fromDate}_${this.toDate}.pdf`);
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  // ============================================
  // STOCK EXPORT
  // ============================================
  exportStock() {
    this.stockLoading = true;
    this.stockErrorMessage = null;
    this.stockData = null;

    this.statService.exportStock(this.authService.getConnectedUser()?.store, this.stockIncludeDeleted).subscribe(response => {
      this.stockData = response;
      this.stockLoading = false;
    },
      (error) => {
        this.stockErrorMessage = error.error.message || "Erreur lors de l'export du stock.";
        this.stockLoading = false;
      }
    );
  }

  downloadStockPDF() {
    if (!this.stockData) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let yPos = 0;

    // Colors
    const primaryColor: [number, number, number] = [63, 81, 181];
    const primaryDark: [number, number, number] = [48, 63, 159];
    const successColor: [number, number, number] = [46, 125, 50];
    const warningColor: [number, number, number] = [245, 124, 0];
    const purpleColor: [number, number, number] = [124, 58, 237];
    const infoColor: [number, number, number] = [2, 136, 209];
    const textPrimary: [number, number, number] = [44, 62, 80];
    const textSecondary: [number, number, number] = [127, 140, 141];
    const bgLight: [number, number, number] = [245, 247, 250];

    // ============================================
    // HEADER
    // ============================================
    doc.setFillColor(...primaryDark);
    doc.rect(0, 0, pageWidth, 45, 'F');

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text("Export du Stock", margin, 22);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(220, 220, 255);
    doc.text(`Genere le: ${this.formatDate(new Date().toISOString().split('T')[0])}`, margin, 33);

    doc.setFontSize(9);
    doc.text(`${this.stockData.totalProducts} produits | ${this.stockIncludeDeleted ? 'Inclut supprimés' : 'Actifs uniquement'}`, pageWidth - margin - 70, 33);

    yPos = 60;

    // ============================================
    // SUMMARY CARDS
    // ============================================
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...textPrimary);
    doc.text("Resume du Stock", margin, yPos);
    yPos += 10;

    const cardWidth = (pageWidth - margin * 2 - 15) / 4;
    const cardHeight = 35;
    const cardY = yPos;

    const drawCard = (idx: number, label: string, value: string, bgRgb: [number,number,number], accentRgb: [number,number,number]) => {
      const x = margin + idx * (cardWidth + 5);
      doc.setFillColor(...bgRgb);
      doc.roundedRect(x, cardY, cardWidth, cardHeight, 3, 3, 'F');
      doc.setFillColor(...accentRgb);
      doc.roundedRect(x, cardY, 5, cardHeight, 2, 2, 'F');
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(...accentRgb);
      doc.text(value, x + 10, cardY + 15);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...textSecondary);
      doc.text(label, x + 10, cardY + 26);
    };

    drawCard(0, 'Produits', `${this.stockData.totalProducts}`, [237, 231, 246], purpleColor);
    drawCard(1, 'Quantite Totale', `${this.stockData.totalQuantity}`, [227, 242, 253], infoColor);
    drawCard(2, 'Valeur Achat', `${this.stockData.totalBuyingValue.toFixed(2)} DT`, [255, 243, 224], warningColor);
    drawCard(3, 'Valeur Vente', `${this.stockData.totalSellingValue.toFixed(2)} DT`, [232, 245, 233], successColor);

    yPos = cardY + cardHeight + 20;

    // ============================================
    // PRODUCTS TABLE
    // ============================================
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...textPrimary);
    doc.text("Details par Produit", margin, yPos);
    yPos += 8;

    autoTable(doc, {
      startY: yPos,
      head: [["Produit", "Cat.", "P.Achat", "P.Vente", "Qte", "Total Achat", "Total Vente"]],
      body: [
        ...this.stockData.products.map((p: any) => [
          p.productName,
          p.category,
          `${p.buyingPrice.toFixed(2)}`,
          `${p.sellingPrice.toFixed(2)}`,
          p.quantity.toString(),
          `${p.totalBuying.toFixed(2)}`,
          `${p.totalSelling.toFixed(2)}`
        ]),
        // Totals row
        [
          { content: 'TOTAL', styles: { fontStyle: 'bold', fillColor: [232, 236, 239] } },
          { content: '', styles: { fillColor: [232, 236, 239] } },
          { content: '', styles: { fillColor: [232, 236, 239] } },
          { content: '', styles: { fillColor: [232, 236, 239] } },
          { content: this.stockData.totalQuantity.toString(), styles: { fontStyle: 'bold', fillColor: [232, 236, 239] } },
          { content: `${this.stockData.totalBuyingValue.toFixed(2)}`, styles: { fontStyle: 'bold', fillColor: [232, 236, 239], textColor: warningColor } },
          { content: `${this.stockData.totalSellingValue.toFixed(2)}`, styles: { fontStyle: 'bold', fillColor: [232, 236, 239], textColor: successColor } }
        ]
      ],
      theme: "plain",
      styles: {
        fontSize: 8,
        cellPadding: 5,
        textColor: textPrimary,
        lineColor: [232, 236, 239],
        lineWidth: 0.5
      },
      headStyles: {
        fillColor: bgLight,
        textColor: textSecondary,
        fontSize: 7,
        fontStyle: 'bold',
        halign: 'left'
      },
      columnStyles: {
        0: { cellWidth: 'auto', fontStyle: 'bold' },
        1: { cellWidth: 25 },
        2: { cellWidth: 20, halign: 'right' },
        3: { cellWidth: 20, halign: 'right', textColor: primaryColor },
        4: { cellWidth: 15, halign: 'center' },
        5: { cellWidth: 25, halign: 'right' },
        6: { cellWidth: 25, halign: 'right' }
      },
      alternateRowStyles: {
        fillColor: [250, 251, 252]
      },
      margin: { left: margin, right: margin }
    });

    // Footer
    const footerY = pageHeight - 20;
    doc.setDrawColor(232, 236, 239);
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
    doc.setFontSize(8);
    doc.setTextColor(...textSecondary);
    doc.text("Ce rapport a ete genere automatiquement par le systeme de gestion de stock.", margin, footerY);

    doc.save(`export_stock_${new Date().toISOString().split('T')[0]}.pdf`);
  }

  // ============================================
  // PROFIT REPORT
  // ============================================
  generateProfitReport() {
    this.profitLoading = true;
    this.profitErrorMessage = null;
    this.profitData = null;

    this.statService.profitReport(
      this.authService.getConnectedUser()?.store,
      this.profitFromDate,
      this.profitToDate,
      this.profitIncludeDeleted
    ).subscribe(
      response => {
        this.profitData = response;
        this.profitLoading = false;
      },
      error => {
        this.profitErrorMessage = error.error?.message || "Erreur lors du calcul du profit.";
        this.profitLoading = false;
      }
    );
  }

  downloadProfitPDF() {
    if (!this.profitData) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let yPos = 0;

    const successColor: [number, number, number] = [46, 125, 50];
    const dangerColor: [number, number, number] = [198, 40, 40];
    const purpleColor: [number, number, number] = [124, 58, 237];
    const warningColor: [number, number, number] = [245, 124, 0];
    const textPrimary: [number, number, number] = [44, 62, 80];
    const textSecondary: [number, number, number] = [127, 140, 141];
    const bgLight: [number, number, number] = [245, 247, 250];

    // Header
    const headerColor: [number, number, number] = this.profitData.netProfit >= 0 ? successColor : dangerColor;
    doc.setFillColor(...headerColor);
    doc.rect(0, 0, pageWidth, 45, 'F');

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text("Rapport de Profit / Pertes", margin, 22);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(220, 255, 220);
    doc.text(`Periode: ${this.formatDate(this.profitFromDate)} - ${this.formatDate(this.profitToDate)}`, margin, 33);
    doc.setFontSize(9);
    doc.text(`Genere le: ${this.formatDate(new Date().toISOString().split('T')[0])}`, pageWidth - margin - 50, 33);

    yPos = 60;

    // Summary cards
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...textPrimary);
    doc.text("Resume Financier", margin, yPos);
    yPos += 10;

    const cardWidth = (pageWidth - margin * 2 - 15) / 4;
    const cardHeight = 35;
    const cardY = yPos;

    const drawCard = (idx: number, label: string, value: string, bgRgb: [number,number,number], accentRgb: [number,number,number]) => {
      const x = margin + idx * (cardWidth + 5);
      doc.setFillColor(...bgRgb);
      doc.roundedRect(x, cardY, cardWidth, cardHeight, 3, 3, 'F');
      doc.setFillColor(...accentRgb);
      doc.roundedRect(x, cardY, 5, cardHeight, 2, 2, 'F');
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...accentRgb);
      doc.text(value, x + 10, cardY + 15);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...textSecondary);
      doc.text(label, x + 10, cardY + 26);
    };

    drawCard(0, "Chiffre d'affaires", `${this.profitData.totalRevenue.toFixed(2)} DT`, [232, 245, 233], successColor);
    drawCard(1, 'Depenses', `${this.profitData.totalExpenses.toFixed(2)} DT`, [255, 235, 238], dangerColor);
    drawCard(2, 'Profit brut', `${this.profitData.grossProfit.toFixed(2)} DT`, [237, 231, 246], purpleColor);
    const netColor = this.profitData.netProfit >= 0 ? successColor : dangerColor;
    drawCard(3, `Profit net (${this.profitData.profitMargin.toFixed(1)}%)`, `${this.profitData.netProfit.toFixed(2)} DT`, this.profitData.netProfit >= 0 ? [232, 245, 233] : [255, 235, 238], netColor);

    yPos = cardY + cardHeight + 20;

    // Products table
    if (this.profitData.products?.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(...textPrimary);
      doc.text("Profit par Produit", margin, yPos);
      yPos += 8;

      autoTable(doc, {
        startY: yPos,
        head: [["Produit", "Qte", "Revenu", "Cout", "Profit"]],
        body: this.profitData.products.map((p: any) => [
          p.productName,
          p.quantitySold.toString(),
          `${p.revenue.toFixed(2)} DT`,
          `${p.cost.toFixed(2)} DT`,
          `${p.profit >= 0 ? '+' : ''}${p.profit.toFixed(2)} DT`
        ]),
        theme: "plain",
        styles: { fontSize: 9, cellPadding: 5, textColor: textPrimary, lineColor: [232, 236, 239], lineWidth: 0.5 },
        headStyles: { fillColor: bgLight, textColor: textSecondary, fontSize: 8, fontStyle: 'bold' },
        columnStyles: {
          0: { cellWidth: 'auto', fontStyle: 'bold' },
          1: { cellWidth: 20, halign: 'center' },
          2: { cellWidth: 30, halign: 'right' },
          3: { cellWidth: 30, halign: 'right' },
          4: { cellWidth: 35, halign: 'right' }
        },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 4) {
            const val = parseFloat(data.cell.raw as string);
            data.cell.styles.textColor = val >= 0 ? successColor : dangerColor;
            data.cell.styles.fontStyle = 'bold';
          }
        },
        alternateRowStyles: { fillColor: [250, 251, 252] },
        margin: { left: margin, right: margin }
      });
    }

    // Expenses table
    if (this.profitData.expenses?.length > 0) {
      const finalY = (doc as any).lastAutoTable?.finalY || yPos + 20;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(...textPrimary);
      doc.text("Detail des Depenses", margin, finalY + 15);

      autoTable(doc, {
        startY: finalY + 23,
        head: [["Titre", "Date", "Montant"]],
        body: [
          ...this.profitData.expenses.map((e: any) => [
            e.title + (e.isRecurring ? ' (Rec.)' : ''),
            new Date(e.date).toLocaleDateString('fr-FR'),
            `${e.amount.toFixed(2)} DT`
          ]),
          [{ content: 'TOTAL', styles: { fontStyle: 'bold', fillColor: [232, 236, 239] } },
           { content: '', styles: { fillColor: [232, 236, 239] } },
           { content: `${this.profitData.totalExpenses.toFixed(2)} DT`, styles: { fontStyle: 'bold', fillColor: [232, 236, 239], textColor: dangerColor } }]
        ],
        theme: "plain",
        styles: { fontSize: 9, cellPadding: 5, textColor: textPrimary, lineColor: [232, 236, 239], lineWidth: 0.5 },
        headStyles: { fillColor: bgLight, textColor: textSecondary, fontSize: 8, fontStyle: 'bold' },
        columnStyles: {
          0: { cellWidth: 'auto', fontStyle: 'bold' },
          1: { cellWidth: 35 },
          2: { cellWidth: 35, halign: 'right' }
        },
        alternateRowStyles: { fillColor: [250, 251, 252] },
        margin: { left: margin, right: margin }
      });
    }

    // Footer
    const footerY = pageHeight - 20;
    doc.setDrawColor(232, 236, 239);
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
    doc.setFontSize(8);
    doc.setTextColor(...textSecondary);
    doc.text("Ce rapport a ete genere automatiquement par le systeme de gestion de stock.", margin, footerY);

    doc.save(`rapport_profit_${this.profitFromDate}_${this.profitToDate}.pdf`);
  }
}