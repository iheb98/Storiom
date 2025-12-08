import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { LoadingService } from 'src/app/core/services/loading.service';
import { OrderService } from 'src/app/core/services/order.service';
import { StoreService } from 'src/app/core/services/store.service';
import { faBox, faCheckCircle, faClock, faTimesCircle, faTruck } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-orders-mngt',
    templateUrl: './orders-mngt.component.html',
    styleUrls: ['./orders-mngt.component.scss']
})
export class OrdersMngtComponent implements OnInit {

    orders: any[] = [];
    store: any;

    faBox = faBox;
    faClock = faClock;
    faCheckCircle = faCheckCircle;
    faTruck = faTruck;
    faTimesCircle = faTimesCircle;

    constructor(
        private orderService: OrderService,
        private authService: AuthService,
        private storeService: StoreService,
        private loadingService: LoadingService
    ) { }

    ngOnInit(): void {
        this.loadingService.screenLoading();
        const user = this.authService.getConnectedUser();

        if (user?.store) {
            this.storeService.getStore(user.store).subscribe(store => {
                this.store = store;
                this.loadOrders();
            });
        } else {
            this.loadingService.screenLoaded();
        }
    }

    loadOrders() {
        this.orderService.getStoreOrders(this.store.id).subscribe(
            (res) => {
                this.orders = res;
                this.loadingService.screenLoaded();
            },
            (err) => {
                console.error(err);
                this.loadingService.screenLoaded();
            }
        );
    }

    updateStatus(order: any, status: string) {
        this.loadingService.screenLoading();
        this.orderService.updateOrderStatus(order.id, status).subscribe(
            (res) => {
                if (res.success) {
                    order.status = res.order.status;
                }
                this.loadingService.screenLoaded();
            },
            (err) => {
                console.error(err);
                this.loadingService.screenLoaded();
            }
        );
    }

    getStatusColor(status: string): string {
        switch (status) {
            case 'PENDING': return 'orange';
            case 'CONFIRMED': return 'blue';
            case 'SHIPPED': return 'purple';
            case 'DELIVERED': return 'green';
            case 'CANCELLED': return 'red';
            default: return 'black';
        }
    }

    getStatusIcon(status: string) {
        switch (status) {
            case 'PENDING': return this.faClock;
            case 'CONFIRMED': return this.faCheckCircle;
            case 'SHIPPED': return this.faTruck;
            case 'DELIVERED': return this.faBox;
            case 'CANCELLED': return this.faTimesCircle;
            default: return this.faClock;
        }
    }
}
