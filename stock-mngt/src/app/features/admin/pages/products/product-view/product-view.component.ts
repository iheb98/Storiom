import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { faChartBar } from '@fortawesome/free-regular-svg-icons';
import {
  faEdit, faFile, faTimes, faArrowDown, faArrowUp, faCoins, faExclamationTriangle,
  faImages, faSearchPlus, faImage, faArrowLeft, faCube, faTag, faAlignLeft,
  faCalendarAlt, faClock, faBox
} from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/core/services/auth.service';
import { ProductService } from 'src/app/core/services/product.service';
import { StatService } from 'src/app/core/services/stat.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-product-view',
  templateUrl: './product-view.component.html',
  styleUrls: ['./product-view.component.scss']
})
export class ProductViewComponent implements OnInit {

  // Icons
  faEdit = faEdit;
  faArrowDown = faArrowDown;
  faArrowUp = faArrowUp;
  faCoins = faCoins;
  faExclamationTriangle = faExclamationTriangle;
  faImages = faImages;
  faSearchPlus = faSearchPlus;
  faImage = faImage;
  faArrowLeft = faArrowLeft;
  faCube = faCube;
  faTag = faTag;
  faAlignLeft = faAlignLeft;
  faCalendarAlt = faCalendarAlt;
  faClock = faClock;
  faTimes = faTimes;
  faBox = faBox;
  textIcon = faFile;
  chartIcon = faChartBar;

  environment = environment;

  // Loading States
  isLoading = true;
  isStatsLoading = false;

  // Data
  years: number[] = [];
  operationsData: any;
  soldOperationsData: any[] = [];
  loadedOperationsData: any[] = [];
  operationsLabels: any[] = [];
  operationsOptions: any;
  operations: any[] = [];

  // Filters
  typesOfDate = ["Quotidien", "Mensuel", "Annuel"];
  selectedDateType = 'Mensuel';
  dayFilter: string;
  weekFilter: string;
  monthFilter: string;
  yearFilter: number;

  // Product
  user: any;
  id: string;
  product: any;
  selectedImage: string | null = null;

  hoursLabels = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];

  constructor(
    private productService: ProductService,
    private statService: StatService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.user = this.authService.getConnectedUser();

    this.route.paramMap.subscribe(paramMap => {
      this.id = paramMap.get('id');
      this.initializeFilters();
      this.getProduct(this.id);
    });
  }

  initializeFilters() {
    // Build years array
    for (let i = 2000; i <= new Date().getFullYear(); i++) {
      this.years.push(i);
    }

    // Set default filters
    const now = new Date();
    const month = (now.getMonth() + 1) < 10 ? "0" + (now.getMonth() + 1) : (now.getMonth() + 1);
    const day = now.getDate() < 10 ? "0" + now.getDate() : now.getDate();

    this.dayFilter = `${now.getFullYear()}-${month}-${day}`;
    this.monthFilter = `${now.getFullYear()}-${month}`;
    this.yearFilter = now.getFullYear();

    // Initialize chart options
    this.initChartOptions();
  }

  initChartOptions() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color') || '#2c3e50';
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary') || '#7f8c8d';
    const surfaceBorder = 'lightgray';

    this.operationsOptions = {
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        },
        x: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        }
      }
    };
  }

  getProduct(id: string) {
    this.isLoading = true;
    this.productService.getProduct(id).subscribe(
      response => {
        this.product = response;
        this.isLoading = false;
        this.getOperationStats();
      },
      error => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Erreur lors du chargement du produit',
          showConfirmButton: false,
          timer: 2000
        });
      }
    );
  }

  navigateTo(link: string) {
    this.router.navigate([link]);
  }

  getMensuel() {
    let days = [];
    this.soldOperationsData = [];
    this.loadedOperationsData = [];
    for (let i = 0; i < this.lastDay(new Date(this.monthFilter).getFullYear(), new Date(this.monthFilter).getMonth()); i++) {
      this.soldOperationsData.push(0);
      this.loadedOperationsData.push(0);
      days.push(i + 1);
    }
    this.operationsLabels = days;
    if (this.operations) {
      for (let operation of this.operations) {
        if (operation.type == "SOLD") {
          this.soldOperationsData[new Date(operation.date).getDate() - 1] +=
            (operation?.price && operation?.amount) ? operation?.price * operation?.amount : 0;
        } else if (operation.type == "LOADED") {
          this.loadedOperationsData[new Date(operation.date).getDate() - 1] +=
            (operation?.price && operation?.amount) ? operation?.price * operation?.amount : 0;
        }
      }
    }
    this.updateChart();
  }

  getQuotidien() {
    this.soldOperationsData = [];
    this.loadedOperationsData = [];
    this.operationsLabels = this.hoursLabels;
    for (let i = 0; i < 24; i++) {
      this.soldOperationsData.push(0);
      this.loadedOperationsData.push(0);
    }
    if (this.operations) {
      for (let operation of this.operations) {
        if (operation.type == "SOLD") {
          this.soldOperationsData[new Date(operation.date).getHours()] +=
            (operation?.price && operation?.amount) ? operation?.price * operation?.amount : 0;
        } else if (operation.type == "LOADED") {
          this.loadedOperationsData[new Date(operation.date).getHours()] +=
            (operation?.price && operation?.amount) ? operation?.price * operation?.amount : 0;
        }
      }
    }
    this.updateChart();
  }

  getAnnuel() {
    let months = [];
    this.soldOperationsData = [];
    this.loadedOperationsData = [];
    for (let i = 1; i <= 12; i++) {
      this.soldOperationsData.push(0);
      this.loadedOperationsData.push(0);
      months.push(i);
    }
    this.operationsLabels = months;
    if (this.operations) {
      for (let operation of this.operations) {
        if (operation.type == "SOLD") {
          this.soldOperationsData[new Date(operation.date).getMonth()] +=
            (operation?.price && operation?.amount) ? operation?.price * operation?.amount : 0;
        } else if (operation.type == "LOADED") {
          this.loadedOperationsData[new Date(operation.date).getMonth()] +=
            (operation?.price && operation?.amount) ? operation?.price * operation?.amount : 0;
        }
      }
    }
    this.updateChart();
  }

  updateChart() {
    this.operationsData = {
      labels: this.operationsLabels,
      datasets: [
        {
          label: 'Vendu',
          data: this.soldOperationsData,
          backgroundColor: ['#42A5F5'],
          borderWidth: 1
        },
        {
          label: 'Chargé',
          data: this.loadedOperationsData,
          backgroundColor: ['#ff9f40'],
          borderWidth: 1
        }
      ]
    };
    this.isStatsLoading = false;
  }

  getOperationStats() {
    let filterValue: string;
    let month: number;
    let year: number;
    let day: number;

    switch (this.selectedDateType) {
      case 'Quotidien':
        day = new Date(this.dayFilter).getDate();
        month = new Date(this.dayFilter).getMonth() + 1;
        year = new Date(this.dayFilter).getFullYear();
        filterValue = year + '-' + (month < 10 ? '0' + month : month) + '-' + day;
        break;
      case 'Annuel':
        year = this.yearFilter;
        filterValue = String(year);
        break;
      default:
        month = new Date(this.monthFilter).getMonth() + 1;
        year = new Date(this.monthFilter).getFullYear();
        filterValue = year + '-' + month;
        break;
    }

    this.isStatsLoading = true;
    this.statService.getOperationStatsPerProduct(this.user?.store, this.selectedDateType, filterValue, this.id).subscribe(
      response => {
        this.operations = response;
        if (this.selectedDateType == "Quotidien") {
          this.getQuotidien();
        } else if (this.selectedDateType == "Annuel") {
          this.getAnnuel();
        } else {
          this.getMensuel();
        }
      },
      error => {
        this.isStatsLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Une erreur est survenue ! Merci de réessayer plus tard',
          showConfirmButton: false,
          timer: 1500
        });
      }
    );
  }

  lastDay(y: number, m: number): number {
    return new Date(y, m + 1, 0).getDate();
  }

  openImage(image: string) {
    this.selectedImage = image;
  }

  closeImage() {
    this.selectedImage = null;
  }
}
