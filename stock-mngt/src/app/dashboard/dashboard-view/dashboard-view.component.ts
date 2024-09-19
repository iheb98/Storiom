import { Component, OnInit } from '@angular/core';
import { faArrowDown, faBox, faBoxOpen, faHandHolding, faHandHoldingUsd, faMoneyBill } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/services/auth.service';
import { StatService } from 'src/app/services/stat.service';
import { ChartModule } from 'primeng/chart';

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
    constructor(
        private authService: AuthService,
        private statService: StatService
    ) { }

    ngOnInit(): void {
        this.user = this.authService.getConnectedUser();
        this.getWidgets()
    }

    getWidgets() {
        this.statService.getWidgets(this.user.store).subscribe(
            response => {
                this.widgets = response
                console.log(response)
            }
        )
    }

}
