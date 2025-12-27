import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-receipt-invoice',
    templateUrl: './receipt-invoice.component.html',
    styleUrls: ['./receipt-invoice.component.scss']
})
export class ReceiptInvoiceComponent implements OnInit {

    @Input() receipt: any;
    @Input() store: any;

    constructor() { }

    ngOnInit(): void {
    }

}
