import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserSettingsService } from 'src/app/core/services/user-settings.service';
import { DomainService, DomainStore } from 'src/app/core/services/domain.service';

@Component({
  selector: 'app-public-layout',
  templateUrl: './public-layout.component.html',
  styleUrls: ['./public-layout.component.scss']
})
export class PublicLayoutComponent implements OnInit {
  isCustomDomain = false;
  domainStore: DomainStore | null = null;
  currentYear = new Date().getFullYear();

  constructor(
    private router: Router,
    private userSettingsService: UserSettingsService,
    private domainService: DomainService
  ) { }

  categories: any[] = [
    {
      name: 'Electronics',
      subcategories: [
        {
          name: 'Phones',
          subcategories: [
            { id: 111, name: 'Smartphones' },
            { id: 112, name: 'Feature Phones' }
          ]
        },
        {
          name: 'Laptops',
          subcategories: [
            { id: 121, name: 'Gaming Laptops' },
            { id: 122, name: 'Ultrabooks' }
          ]
        }
      ]
    },
    {
      name: 'Fashion',
      subcategories: [
        {
          name: 'Men',
          subcategories: [
            { id: 211, name: 'Shirts' },
            { id: 212, name: 'Shoes' }
          ]
        },
        {
          name: 'Women',
          subcategories: [
            { id: 221, name: 'Dresses' },
            { id: 222, name: 'Bags' }
          ]
        }
      ]
    }
  ];

  ngOnInit() {
    // Domain detection
    this.isCustomDomain = this.domainService.isCustomDomain;
    this.domainStore = this.domainService.currentStore;

    // Clear redirect flag when tab is closed
    window.addEventListener('beforeunload', () => {
      sessionStorage.removeItem('defaultScreenRedirected');
    });

    // Redirect to default screen on first load of session (only in marketplace mode)
    if (!this.isCustomDomain) {
      this.userSettingsService.settingsLoaded$.subscribe(isLoaded => {
        if (isLoaded) {
          const hasRedirected = sessionStorage.getItem('defaultScreenRedirected');
          const settings = this.userSettingsService.currentSettings;
          const defaultScreen = settings.navigation?.defaultScreen;

          if (!hasRedirected && defaultScreen && defaultScreen !== 'none') {
            sessionStorage.setItem('defaultScreenRedirected', 'true');
            const screenMap = {
              'dashboard': '/admin/dashboard',
              'products': '/admin/products',
              'orders': '/admin/orders',
              'stats': '/admin/dashboard'
            };
            const targetPath = screenMap[defaultScreen] || '/admin/dashboard';
            this.router.navigate([targetPath]);
          }
        }
      });
    }
  }
}

