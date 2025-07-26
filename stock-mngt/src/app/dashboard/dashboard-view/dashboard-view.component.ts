import { Component, OnInit } from '@angular/core';
import { faArrowDown, faBox, faBoxes, faBoxOpen, faHandHolding, faHandHoldingUsd, faMoneyBill } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/services/auth.service';
import { StatService } from 'src/app/services/stat.service';
import { ChartModule } from 'primeng/chart';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
    selector: 'app-dashboard-view',
    templateUrl: './dashboard-view.component.html',
    styleUrls: ['./dashboard-view.component.scss']
})
export class DashboardViewComponent implements OnInit {
    faBoxOpen = faBoxOpen
    faArrowDown = faArrowDown
    faBill = faMoneyBill
    faHand = faHandHoldingUsd
    user;
    widgets
    widgetsList
    constructor(
        private authService: AuthService,
        private statService: StatService,
        private loadingService: LoadingService
    ) { }

    ngOnInit(): void {
        this.user = this.authService.getConnectedUser();
        this.getWidgets()
    }

    getWidgets() {
        this.loadingService.screenLoading()
        this.statService.getWidgets(this.user.store).subscribe(
            response => {
                this.widgets = response
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
                this.loadingService.screenLoaded()
                console.log(response)
            }
        )
    }

}
