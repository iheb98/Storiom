import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import {
  faCalendarAlt, faClock, faChartPie, faCoins, faFire
} from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/core/services/auth.service';
import { StatService } from 'src/app/core/services/stat.service';

@Component({
  selector: 'app-category-stats',
  templateUrl: './category-stats.component.html',
  styleUrls: ['./category-stats.component.scss']
})
export class CategoryStatsComponent implements OnInit, OnChanges {
  // Input from parent for global date filter
  @Input() dateFilter: { type: string; value: string };

  // Icons
  faCalendarAlt = faCalendarAlt;
  faClock = faClock;
  faChartPie = faChartPie;
  faCoins = faCoins;
  faFire = faFire;

  user;
  years = [];

  operationsData;
  operationsItemsData;
  soldOperationsData: any = [];
  loadedOperationsData: any = [];
  operationsLabels: any = [];
  operationsOptions: any;

  pieChartOptions;

  operations: any = [];
  // Local filter values (used when no parent filter is provided)
  typesOfDate = ["Quotidien", "Mensuel", "Annuel"];
  selectedDateType = 'Mensuel';

  dayFilter;
  weekFilter;
  monthFilter;
  yearFilter;

  totalSoldData;
  totalSoldNetData;

  // Loading States
  isLoading = true;

  hoursLabels = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];

  constructor(
    private statService: StatService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.user = this.authService.getConnectedUser();

    for (let i = 2000; i <= new Date().getFullYear(); i++) {
      this.years.push(i);
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
    const surfaceBorder = 'lightgray';
    this.operationsOptions = {
      plugins: {
        legend: {
          display: false
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
            drawBorder: true,
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

    this.pieChartOptions = {
      plugins: {
        datalabels: {
          align: 'end',
          anchor: 'end',
          borderRadius: 4,
          backgroundColor: 'teal',
          color: 'white',
          font: {
            weight: 'bold',
          },
        },
        title: {
          display: true,
          fontSize: 10,
        },
        legend: {
          position: 'bottom',
        },
      },
    };

    this.updateOperationStats();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dateFilter'] && changes['dateFilter'].currentValue) {
      const filter = changes['dateFilter'].currentValue;
      this.selectedDateType = filter.type;

      // Update local filter values based on parent filter
      switch (filter.type) {
        case 'Quotidien':
          this.dayFilter = filter.value;
          break;
        case 'Mensuel':
          this.monthFilter = filter.value;
          break;
        case 'Annuel':
          this.yearFilter = parseInt(filter.value);
          break;
      }

      // Only update if not the first change (ngOnInit handles initial load)
      if (!changes['dateFilter'].firstChange) {
        this.updateOperationStats();
      }
    }
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

  getOperationStats(): Promise<void> {
    return new Promise((resolve) => {
      let filterValue;
      let month;
      let year;
      let day;
      switch (this.selectedDateType) {
        case 'Quotidien':
          day = new Date(this.dayFilter).getDate();
          month = new Date(this.dayFilter).getMonth() + 1;
          year = new Date(this.dayFilter).getFullYear();
          filterValue = year + '-' + (month < 10 ? '0' + month : month) + '-' + day;
          break;
        case 'Annuel':
          year = this.yearFilter;
          filterValue = year;
          break;
        default:
          month = new Date(this.monthFilter).getMonth() + 1;
          year = new Date(this.monthFilter).getFullYear();
          filterValue = year + '-' + month;
          break;
      }
      this.statService.getOperationStatsByCategory(this.user.id, this.selectedDateType, filterValue).subscribe(
        response => {
          this.operationsData = response;
          resolve();
        },
        error => {
          resolve();
        }
      );
    });
  }

  getCategoriesTotalNetSold(): Promise<void> {
    return new Promise((resolve) => {
      let filterValue;
      let month;
      let year;
      let day;
      switch (this.selectedDateType) {
        case 'Quotidien':
          day = new Date(this.dayFilter).getDate();
          month = new Date(this.dayFilter).getMonth() + 1;
          year = new Date(this.dayFilter).getFullYear();
          filterValue = year + '-' + (month < 10 ? '0' + month : month) + '-' + day;
          break;
        case 'Annuel':
          year = this.yearFilter;
          filterValue = year;
          break;
        default:
          month = new Date(this.monthFilter).getMonth() + 1;
          year = new Date(this.monthFilter).getFullYear();
          filterValue = year + '-' + month;
          break;
      }
      this.statService.getCategoriesTotalNetSold(this.user.id, this.selectedDateType, filterValue).subscribe(
        response => {
          this.totalSoldNetData = response;
          resolve();
        },
        error => {
          resolve();
        }
      );
    });
  }

  getCategoriesTotalSold(): Promise<void> {
    return new Promise((resolve) => {
      let filterValue;
      let month;
      let year;
      let day;
      switch (this.selectedDateType) {
        case 'Quotidien':
          day = new Date(this.dayFilter).getDate();
          month = new Date(this.dayFilter).getMonth() + 1;
          year = new Date(this.dayFilter).getFullYear();
          filterValue = year + '-' + (month < 10 ? '0' + month : month) + '-' + day;
          break;
        case 'Annuel':
          year = this.yearFilter;
          filterValue = year;
          break;
        default:
          month = new Date(this.monthFilter).getMonth() + 1;
          year = new Date(this.monthFilter).getFullYear();
          filterValue = year + '-' + month;
          break;
      }
      this.statService.getCategoriesTotalSold(this.user.id, this.selectedDateType, filterValue).subscribe(
        response => {
          this.totalSoldData = response;
          resolve();
        },
        error => {
          resolve();
        }
      );
    });
  }

  getOperationItemsStats(): Promise<void> {
    return new Promise((resolve) => {
      let filterValue;
      let month;
      let year;
      let day;
      switch (this.selectedDateType) {
        case 'Quotidien':
          day = new Date(this.dayFilter).getDate();
          month = new Date(this.dayFilter).getMonth() + 1;
          year = new Date(this.dayFilter).getFullYear();
          filterValue = year + '-' + (month < 10 ? '0' + month : month) + '-' + day;
          break;
        case 'Annuel':
          year = this.yearFilter;
          filterValue = year;
          break;
        default:
          month = new Date(this.monthFilter).getMonth() + 1;
          year = new Date(this.monthFilter).getFullYear();
          filterValue = year + '-' + month;
          break;
      }
      this.statService.getOperationStatsByCategoryItems(this.user.id, this.selectedDateType, filterValue).subscribe(
        response => {
          this.operationsItemsData = response;
          resolve();
        },
        error => {
          resolve();
        }
      );
    });
  }

  lastDay(y, m) {
    return new Date(y, m + 1, 0).getDate();
  }

  round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
  }

  updateOperationStats() {
    this.isLoading = true;
    Promise.all([
      this.getOperationStats(),
      this.getOperationItemsStats(),
      this.getCategoriesTotalNetSold(),
      this.getCategoriesTotalSold()
    ]).then(() => {
      this.isLoading = false;
    });
  }
}
