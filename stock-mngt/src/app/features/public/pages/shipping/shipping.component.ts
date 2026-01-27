import { Component, OnInit } from '@angular/core';
import {
    faTruck, faBox, faClock, faMapMarkerAlt, faCheckCircle,
    faQuestionCircle, faShippingFast
} from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-shipping',
    templateUrl: './shipping.component.html',
    styleUrls: ['./shipping.component.scss']
})
export class ShippingComponent implements OnInit {

    // Icons
    faTruck = faTruck;
    faBox = faBox;
    faClock = faClock;
    faMapMarkerAlt = faMapMarkerAlt;
    faCheckCircle = faCheckCircle;
    faQuestionCircle = faQuestionCircle;
    faShippingFast = faShippingFast;

    deliveryOptions = [
        {
            icon: this.faShippingFast,
            name: 'Livraison Express',
            time: '24-48h',
            price: '7.00 DT',
            description: 'Livraison prioritaire pour les commandes urgentes'
        },
        {
            icon: this.faTruck,
            name: 'Livraison Standard',
            time: '3-5 jours',
            price: '4.00 DT',
            description: 'Option économique pour les commandes régulières'
        },
        {
            icon: this.faMapMarkerAlt,
            name: 'Retrait en Magasin',
            time: 'Sous 24h',
            price: 'Gratuit',
            description: 'Récupérez votre commande directement en boutique'
        }
    ];

    steps = [
        { number: 1, title: 'Commande passée', description: 'Votre commande est confirmée et en cours de préparation' },
        { number: 2, title: 'Colis préparé', description: 'Le vendeur emballe soigneusement vos produits' },
        { number: 3, title: 'Expédition', description: 'Votre colis est remis au transporteur' },
        { number: 4, title: 'Livraison', description: 'Réception de votre commande à l\'adresse indiquée' }
    ];

    zones = [
        { region: 'Grand Tunis', standard: '3-4 jours', express: '24h' },
        { region: 'Nord (Bizerte, Béja...)', standard: '3-5 jours', express: '24-48h' },
        { region: 'Centre (Sousse, Sfax...)', standard: '4-5 jours', express: '48h' },
        { region: 'Sud (Gabès, Médenine...)', standard: '5-7 jours', express: '48-72h' }
    ];

    constructor() { }

    ngOnInit(): void {
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'auto' });
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
        }, 0);
    }
}
