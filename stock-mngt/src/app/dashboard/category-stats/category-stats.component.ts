import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { StatService } from 'src/app/services/stat.service';

@Component({
  selector: 'app-category-stats',
  templateUrl: './category-stats.component.html',
  styleUrls: ['./category-stats.component.scss']
})
export class CategoryStatsComponent implements OnInit {
  user;
  years = [];

  operationsData;
  operationsItemsData;
  soldOperationsData: any = []
  loadedOperationsData: any = []
  operationsLabels: any = [];
  operationsOptions: any;

  operations: any = [];
  typesOfDate = ["DAILY", "WEEKLY", "MONTHLY", "ANNUALLY"]
  selectedDateType = 'MONTHLY'

  dayFilter;
  weekFilter;
  monthFilter;
  yearFilter;


  hoursLabels = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];

  constructor(private statService: StatService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.user = this.authService.getConnectedUser()

    for (let i = 2000; i <= new Date().getFullYear(); i++) {
      this.years.push(i)
    }
    this.dayFilter = new Date().getFullYear() + "-" +
      ((new Date().getMonth() + 1) < 10 ? "0" + (new Date().getMonth() + 1) : (new Date().getMonth() + 1)) + "-" +
      ((new Date().getDate()) < 10 ? "0" + (new Date().getDate()) : (new Date().getDate()));

    this.monthFilter = new Date().getFullYear() + "-" +
      ((new Date().getMonth() + 1) < 10 ? "0" + (new Date().getMonth() + 1) : (new Date().getMonth() + 1));

    this.yearFilter = new Date().getFullYear();


    /// ------------ Chart init ------------------
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
            drawBorder: true
          }
        },
        x: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: true
          }
        }
      }
    };

    this.updateOperationStats()
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
    this.statService.getOperationStatsByCategory(this.user.id, this.selectedDateType, filterValue).subscribe(
      response => {
        this.operationsData = response
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

  getOperationItemsStats() {
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
    this.statService.getOperationStatsByCategoryItems(this.user.id, this.selectedDateType, filterValue).subscribe(
      response => {
        this.operationsItemsData = response
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

  round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
  }

  updateOperationStats() {
    this.getOperationStats();
    this.getOperationItemsStats()
  }

}
