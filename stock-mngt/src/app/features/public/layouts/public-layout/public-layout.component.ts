import { Component } from '@angular/core';

@Component({
  selector: 'app-public-layout',
  templateUrl: './public-layout.component.html',
  styleUrls: ['./public-layout.component.scss']
})
export class PublicLayoutComponent {
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

  ngOnInit() {}
}
