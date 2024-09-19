import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { faPagelines } from '@fortawesome/free-brands-svg-icons';
import { faChartBar } from '@fortawesome/free-regular-svg-icons';
import { faFile, faGripLines, faInfo, faInfoCircle, faTextWidth, faTimes } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/services/auth.service';
import { ProductService } from 'src/app/services/product.service';
import { StatService } from 'src/app/services/stat.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-product-view',
  templateUrl: './product-view.component.html',
  styleUrls: ['./product-view.component.scss']
})
export class ProductViewComponent implements OnInit {
  environment = environment
  years = [];
  operationsData;
  soldOperationsData: any = []
  loadedOperationsData: any = []
  operationsLabels: any = [];
  operationsOptions: any;

  operations: any;
  typesOfDate = ["DAILY", "WEEKLY", "MONTHLY", "ANNUALLY"]
  selectedDateType = 'MONTHLY'

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
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

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

  getMonthly() {
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
  getDaily() {
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
  getAnnually() {
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
          backgroundColor: ['rgba(75, 192, 192, 0.2)'],
          borderColor: ['rgb(75, 192, 192)'],
          borderWidth: 1
        },
        {
          label: 'Chargé',
          data: this.loadedOperationsData,
          backgroundColor: ['rgba(255, 159, 64, 0.2)'],
          borderColor: ['rgb(255, 159, 64)'],
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
      case 'DAILY':
        day = new Date(this.dayFilter).getDate();
        month = new Date(this.dayFilter).getMonth() + 1;
        year = new Date(this.dayFilter).getFullYear();
        filterValue = year + '-' + (month < 10 ? '0' + month : month) + '-' + day
        break;
      case 'ANNUALLY':
        year = new Date(this.dayFilter).getFullYear();
        filterValue = year
        break;
      default:
        month = new Date(this.monthFilter).getMonth() + 1;
        year = new Date(this.monthFilter).getFullYear();
        filterValue = year + '-' + month
        break;
    }
    this.statService.getOperationStatsPerProduct(this.user.id, this.selectedDateType, filterValue, this.id).subscribe(
      response => {
        this.operations = response;
        if (this.selectedDateType == "DAILY") {
          this.getDaily();
        } else if (this.selectedDateType == "ANNUALLY") {
          this.getAnnually();
        } else {
          this.getMonthly();
        }
      }
    )
  }

  lastDay(y, m) {
    return new Date(y, m + 1, 0).getDate();
  }
}
