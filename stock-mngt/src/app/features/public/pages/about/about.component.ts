import { Component, OnInit } from '@angular/core';
import {
    faUsers, faStore, faHandshake, faHeart, faRocket, faShieldAlt,
    faGlobe, faChartLine, faHeadset, faBoxes, faTags
} from '@fortawesome/free-solid-svg-icons';
import { PublicService } from 'src/app/core/services/public.service';

@Component({
    selector: 'app-about',
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {

    // Icons
    faUsers = faUsers;
    faStore = faStore;
    faHandshake = faHandshake;
    faHeart = faHeart;
    faRocket = faRocket;
    faShieldAlt = faShieldAlt;
    faGlobe = faGlobe;
    faChartLine = faChartLine;
    faHeadset = faHeadset;
    faBoxes = faBoxes;
    faTags = faTags;

    isLoadingStats = true;

    stats = [
        { value: '...', label: 'Boutiques Partenaires', icon: this.faStore },
        { value: '...', label: 'Produits Disponibles', icon: this.faBoxes },
        { value: '...', label: 'Catégories', icon: this.faTags }
    ];

    values = [
        { icon: this.faHeart, title: 'Passion', description: 'Nous sommes passionnés par le commerce local et la qualité des produits.' },
        { icon: this.faHandshake, title: 'Confiance', description: 'Nous construisons des relations durables avec nos partenaires et clients.' },
        { icon: this.faRocket, title: 'Innovation', description: 'Nous innovons constamment pour améliorer votre expérience d\'achat.' },
        { icon: this.faShieldAlt, title: 'Qualité', description: 'Nous garantissons la qualité de tous les produits sur notre plateforme.' }
    ];

    constructor(private publicService: PublicService) { }

    ngOnInit(): void {
        window.scrollTo(0, 0);
        this.loadStats();
    }

    loadStats() {
        this.isLoadingStats = true;
        this.publicService.getPlatformStats().subscribe({
            next: (data) => {
                this.stats = [
                    { value: data.stores.toString(), label: 'Boutiques Partenaires', icon: this.faStore },
                    { value: data.products.toString(), label: 'Produits Disponibles', icon: this.faBoxes },
                    { value: data.categories.toString(), label: 'Catégories', icon: this.faTags }
                ];
                this.isLoadingStats = false;
            },
            error: (err) => {
                console.error('Error loading stats:', err);
                this.isLoadingStats = false;
            }
        });
    }
}
