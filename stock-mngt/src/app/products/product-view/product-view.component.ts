import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { faPagelines } from '@fortawesome/free-brands-svg-icons';
import { faChartBar } from '@fortawesome/free-regular-svg-icons';
import { faEdit, faFile, faGripLines, faInfo, faInfoCircle, faTextWidth, faTimes } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/services/auth.service';
import { LoadingService } from 'src/app/services/loading.service';
import { ProductService } from 'src/app/services/product.service';
import { StatService } from 'src/app/services/stat.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-product-view',
  templateUrl: './product-view.component.html',
  styleUrls: ['./product-view.component.scss']
})
export class ProductViewComponent implements OnInit {

  // ----------- ICONS 
  faEdit = faEdit
  environment = environment
  years = [];
  operationsData;
  soldOperationsData: any = []
  loadedOperationsData: any = []
  operationsLabels: any = [];
  operationsOptions: any;

  operations: any;
  typesOfDate = ["Quotidien", "WEEKLY", "Mensuel", "Annuel"]
  selectedDateType = 'Mensuel'

  dayFilter;
  weekFilter;
  monthFilter;
  yearFilter;

  user;
  id
  product
  timesIcon = faTimes
  infoIcon = faInfoCircle
  chartIcon = faChartBar
  textIcon = faFile
  hoursLabels = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];

  basicData: any;

  basicOptions: any;
  constructor(
    private productService: ProductService,
    private statService: StatService,
    private loadingService:LoadingService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.user = this.authService.getConnectedUser()

    this.route.paramMap.subscribe(paramMap => {
      this.id = paramMap.get('id');
    })

    for (let i = 2000; i <= new Date().getFullYear(); i++) {
      this.years.push(i)
    }
    this.dayFilter = new Date().getFullYear() + "-" +
      ((new Date().getMonth() + 1) < 10 ? "0" + (new Date().getMonth() + 1) : (new Date().getMonth() + 1)) + "-" +
      ((new Date().getDate()) < 10 ? "0" + (new Date().getDate()) : (new Date().getDate()));

    this.monthFilter = new Date().getFullYear() + "-" +
      ((new Date().getMonth() + 1) < 10 ? "0" + (new Date().getMonth() + 1) : (new Date().getMonth() + 1));

    this.yearFilter = new Date().getFullYear();
    this.getProduct(this.id)

    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    // const surfaceBorder = documentStyle.getPropertyValue('--surface-border');
    const surfaceBorder = 'lightgray'

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

    this.getOperationStats()
  }

  getProduct(id) {
    console.log(id)
    this.productService.getProduct(id).subscribe(
      response => {
        this.product = response
        console.log(this.product)
      }
    )
  }

  navigateTo(link) {
    this.router.navigate([link])
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
    this.operationsLabels = days
    if (this.operations) {
      for (let operation of this.operations) {
        if (operation.type == "SOLD") {
          this.soldOperationsData[new Date(operation.date).getDate() - 1] +=
            (operation?.price && operation?.amount) ?
              operation?.price * operation?.amount : 0
        } else if (operation.type == "LOADED") {
          this.loadedOperationsData[new Date(operation.date).getDate() - 1] +=
            (operation?.price && operation?.amount) ?
              operation?.price * operation?.amount : 0
        }
      }
    }
    this.updateChart();
  }
  getQuotidien() {
    this.soldOperationsData = [];
    this.loadedOperationsData = [];
    this.operationsLabels = this.hoursLabels
    for (let i = 0; i < 24; i++) {
      this.soldOperationsData.push(0);
      this.loadedOperationsData.push(0);
    }
    if (this.operations) {
      for (let operation of this.operations) {
        if (operation.type == "SOLD") {
          this.soldOperationsData[new Date(operation.date).getHours()] +=
            (operation?.price && operation?.amount) ?
              operation?.price * operation?.amount : 0
        } else if (operation.type == "LOADED") {
          this.loadedOperationsData[new Date(operation.date).getHours()] +=
            (operation?.price && operation?.amount) ?
              operation?.price * operation?.amount : 0
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
      months.push(i + 1);
    }
    this.operationsLabels = months
    if (this.operations) {
      for (let operation of this.operations) {
        if (operation.type == "SOLD") {
          this.soldOperationsData[new Date(operation.date).getMonth() - 1] +=
            (operation?.price && operation?.amount) ?
              operation?.price * operation?.amount : 0
        } else if (operation.type == "LOADED") {
          this.loadedOperationsData[new Date(operation.date).getMonth() - 1] +=
            (operation?.price && operation?.amount) ?
              operation?.price * operation?.amount : 0
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
  }

  getOperationStats() {
    let filterValue;
    let month;
    let year;
    let day;
    switch (this.selectedDateType) {
      case 'Quotidien':
        day = new Date(this.dayFilter).getDate();
        month = new Date(this.dayFilter).getMonth() + 1;
        year = new Date(this.dayFilter).getFullYear();
        filterValue = year + '-' + (month < 10 ? '0' + month : month) + '-' + day
        break;
      case 'Annuel':
        year = this.yearFilter;
        filterValue = year
        break;
      default:
        month = new Date(this.monthFilter).getMonth() + 1;
        year = new Date(this.monthFilter).getFullYear();
        filterValue = year + '-' + month
        break;
    }
    this.loadingService.screenLoading();
    this.statService.getOperationStatsPerProduct(this.user?.store, this.selectedDateType, filterValue, this.id).subscribe(
      response => {
        this.loadingService.screenLoaded()
        this.operations = response;
        if (this.selectedDateType == "Quotidien") {
          this.getQuotidien();
        } else if (this.selectedDateType == "Annuel") {
          this.getAnnuel();
        } else {
          this.getMensuel();
        }
      }, error => {
        this.loadingService.screenLoaded()
        Swal.fire({
          icon: 'error',
          title: 'Une erreur est survenue ! Merci de réessayer plus tard',
          showConfirmButton: false,
          timer: 1500
        })
      }
    )
  }

  lastDay(y, m) {
    return new Date(y, m + 1, 0).getDate();
  }
}
