import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { faClipboardList, faCog, faCheckCircle, faClock, faSpinner, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/core/services/auth.service';
import { StatService } from 'src/app/core/services/stat.service';

@Component({
    selector: 'app-service-requests-stats',
    templateUrl: './service-requests-stats.component.html',
    styleUrls: ['./service-requests-stats.component.scss']
})
export class ServiceRequestsStatsComponent implements OnInit, OnChanges {
    // Input from parent for global date filter
    @Input() dateFilter: { type: string; value: string };

    // Icons
    faClipboardList = faClipboardList;
    faCog = faCog;
    faCheckCircle = faCheckCircle;
    faClock = faClock;
    faSpinner = faSpinner;
    faTimesCircle = faTimesCircle;

    user: any;

    // Local filter values
    selectedDateType = 'Mensuel';
    filterValue: string;

    // Chart Data
    revenueChartData: any;
    statusChartData: any;

    // Chart Options
    pieChartOptions: any;

    // Loading States
    isLoadingRevenue = true;
    isLoadingStatus = true;

    constructor(
        private statService: StatService,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.user = this.authService.getConnectedUser();

        // Initialize default filter value
        const now = new Date();
        this.filterValue = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        this.pieChartOptions = {
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 15
                    }
                }
            },
            responsive: true,
            maintainAspectRatio: false
        };

        this.loadCharts();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['dateFilter'] && changes['dateFilter'].currentValue) {
            const filter = changes['dateFilter'].currentValue;
            this.selectedDateType = filter.type;
            this.filterValue = filter.value;

            // Only reload if not the first change (ngOnInit handles initial load)
            if (!changes['dateFilter'].firstChange) {
                this.loadCharts();
            }
        }
    }

    loadCharts() {
        this.loadRevenueChart();
        this.loadStatusChart();
    }

    loadRevenueChart() {
        this.isLoadingRevenue = true;
        this.statService.getServiceRequestsCompletedRevenue(this.user.store, this.selectedDateType, this.filterValue).subscribe(
            (data) => {
                this.revenueChartData = data;
                this.isLoadingRevenue = false;
            },
            (error) => {
                console.error('Error loading revenue chart:', error);
                this.isLoadingRevenue = false;
            }
        );
    }

    loadStatusChart() {
        this.isLoadingStatus = true;
        this.statService.getServiceRequestsByStatus(this.user.store, this.selectedDateType, this.filterValue).subscribe(
            (data) => {
                this.statusChartData = data;
                this.isLoadingStatus = false;
            },
            (error) => {
                console.error('Error loading status chart:', error);
                this.isLoadingStatus = false;
            }
        );
    }

    hasData(chartData: any): boolean {
        return chartData?.datasets?.[0]?.data?.some(v => v > 0);
    }
}
