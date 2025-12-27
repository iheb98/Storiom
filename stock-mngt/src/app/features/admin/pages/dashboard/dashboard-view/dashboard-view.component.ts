import { Component, OnInit } from '@angular/core';
import {
    faArrowDown, faBoxes, faBoxOpen, faHandHoldingUsd, faMoneyBill,
    faCalendarAlt, faChartPie, faReceipt, faArrowRight, faExclamationTriangle,
    faFire, faCoins, faChartLine, faChartBar, faTachometerAlt, faArrowUp
} from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/core/services/auth.service';
import { StatService } from 'src/app/core/services/stat.service';
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

    // Data
    user;
    widgets;
    widgetsList = [];
    currentDate = new Date();

    // Loading States
    isLoading = true;

    constructor(
        private authService: AuthService,
        private statService: StatService,
    ) { }

    ngOnInit(): void {
        this.user = this.authService.getConnectedUser();
        this.getWidgets();
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
                        class: 'critical-stock'
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
                        class: 'credit'
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
}
