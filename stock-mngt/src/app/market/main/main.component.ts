import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  products: any[] = [
    { title: 'Product 1', price: 29.99, image: 'path/to/image1.jpg', reviews: 10 },
    { title: 'Product 2', price: 49.99, image: 'path/to/image2.jpg', reviews: 5 },
    // Add more products
  ];
  
  searchTerm: string = '';
  filteredProducts: any[] = [];
  
  ngOnInit() {
    this.filteredProducts = this.products;
  }
  
  onSearch() {
    this.filteredProducts = this.products.filter(product =>
      product.title.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}  