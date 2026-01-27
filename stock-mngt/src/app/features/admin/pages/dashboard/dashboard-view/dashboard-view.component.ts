import { Component, OnInit } from '@angular/core';
import {
    faArrowDown, faBoxes, faBoxOpen, faHandHoldingUsd, faMoneyBill,
    faCalendarAlt, faChartPie, faReceipt, faArrowRight, faExclamationTriangle,
    faFire, faCoins, faChartLine, faChartBar, faTachometerAlt, faArrowUp, faClock, faSync
} from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/core/services/auth.service';
import { StatService } from 'src/app/core/services/stat.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-dashboard-view',
    templateUrl: './dashboard-view.component.html',
    styleUrls: ['./dashboard-view.component.scss']
})
export class DashboardViewComponent implements OnInit {
    // Icons
    faBoxOpen = faBoxOpen;
    faBoxes = faBoxes;
    faArrowDown = faArrowDown;
    faArrowUp = faArrowUp;
    faBill = faMoneyBill;
    faHand = faHandHoldingUsd;
    faCalendarAlt = faCalendarAlt;
    faChartPie = faChartPie;
    faReceipt = faReceipt;
    faArrowRight = faArrowRight;
    faExclamationTriangle = faExclamationTriangle;
    faFire = faFire;
    faCoins = faCoins;
    faChartLine = faChartLine;
    faChartBar = faChartBar;
    faTachometerAlt = faTachometerAlt;
    faClock = faClock;
    faSync = faSync;

    // Data
    user;
    widgets;
    widgetsList = [];
    currentDate = new Date();

    // Global Date Filter
    typesOfDate = ['Quotidien', 'Mensuel', 'Annuel'];
    selectedDateType = 'Mensuel';
    dayFilter: string;
    monthFilter: string;
    yearFilter: number;
    years: number[] = [];

    // Filter object to pass to child components
    dateFilter: { type: string; value: string } = { type: 'Mensuel', value: '' };

    // Loading States
    isLoading = true;

    constructor(
        private authService: AuthService,
        private statService: StatService,
        private router: Router
    ) { }

    ngOnInit(): void {
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'auto' });
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
        }, 0);
        this.user = this.authService.getConnectedUser();
        this.initializeDateFilters();
        this.getWidgets();
    }

    initializeDateFilters() {
        const now = new Date();

        // Generate years from 2000 to current year
        for (let i = 2000; i <= now.getFullYear(); i++) {
            this.years.push(i);
        }

        // Set default values
        this.dayFilter = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        this.monthFilter = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        this.yearFilter = now.getFullYear();

        // Initialize the date filter object
        this.updateDateFilter();
    }

    updateDateFilter() {
        let value = '';
        switch (this.selectedDateType) {
            case 'Quotidien':
                value = this.dayFilter;
                break;
            case 'Mensuel':
                value = this.monthFilter;
                break;
            case 'Annuel':
                value = String(this.yearFilter);
                break;
        }
        // Create a new object to trigger change detection
        this.dateFilter = { type: this.selectedDateType, value };
    }

    onDateTypeChange() {
        this.updateDateFilter();
    }

    onDateValueChange() {
        this.updateDateFilter();
    }

    getWidgets() {
        this.isLoading = true;
        this.statService.getWidgets(this.user.store).subscribe(
            response => {
                this.widgets = response;
                this.widgetsList = [
                    {
                        label: 'Fond de commerce',
                        value: response?.stockValue ? response.stockValue + ' DT' : '--',
                        icon: faBoxes,
                        class: 'stock-value'
                    },
                    {
                        label: 'Valeur du stock',
                        value: response?.totalValue ? response.totalValue + ' DT' : '--',
                        icon: faBoxOpen,
                        class: 'total-stock-value'
                    },
                    {
                        label: 'Produits avec stock critique',
                        value: response?.criticalStock ?? '--',
                        icon: faArrowDown,
                        class: 'critical-stock',
                        route: '/products',
                        queryParams: { filter: 'critical' }
                    },
                    {
                        label: 'Ventes du Jour',
                        value: response?.todayRevenue ? response.todayRevenue + ' DT' : '--',
                        icon: this.faBill,
                        class: 'today-revenue'
                    },
                    {
                        label: 'Total des crédits',
                        value: response?.totalCredits ? response.totalCredits + ' DT' : '--',
                        icon: this.faHand,
                        class: 'credit',
                        route: '/credits'
                    }
                ];
                this.isLoading = false;
            },
            error => {
                this.isLoading = false;
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur lors du chargement des statistiques',
                    showConfirmButton: false,
                    timer: 2000
                });
            }
        );
    }

    navigateToWidget(widget: any) {
        if (widget.route) {
            if (widget.queryParams) {
                this.router.navigate([widget.route], { queryParams: widget.queryParams });
            } else {
                this.router.navigate([widget.route]);
            }
        }
    }
}
