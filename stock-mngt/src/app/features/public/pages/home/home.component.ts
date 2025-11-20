import { Component, OnInit } from '@angular/core';
import { faSearch, faShoppingCart, faUser, faStore, faBoxOpen, faShieldAlt } from '@fortawesome/free-solid-svg-icons';
import { CategoryService } from 'src/app/core/services/category.service';
import { ProductService } from 'src/app/core/services/product.service';
import { PublicService } from 'src/app/core/services/public.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  categories: any[] = [];
  isLoading = true;
  featuredProducts = []

  constructor(private categoryService: CategoryService,
    private productService: ProductService,
    private publicSerivce: PublicService
  ) {
    
  }
  ngOnInit(): void {
    this.isLoading = true;
    this.publicSerivce.getCategoryTree().subscribe(response => {
      this.categories = response;
      this.isLoading = false;
      console.log(this.categories);
    }, error => {
      console.error('Error fetching categories:', error);
      this.isLoading = false;
    })

    this.publicSerivce.getRandomProducts().subscribe(response => {
      this.featuredProducts = response;
    })

  }
  // Make icons available to the template
  searchIcon = faSearch;
  cartIcon = faShoppingCart;
  userIcon = faUser;
  storeIcon = faStore;
  boxOpenIcon = faBoxOpen;
  shieldIcon = faShieldAlt;
}