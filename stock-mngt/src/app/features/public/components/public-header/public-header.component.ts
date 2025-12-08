import { Component, OnInit } from '@angular/core';
import { faBars, faBoxOpen, faCartPlus, faSearch, faShieldAlt, faShoppingCart, faStore, faUser } from '@fortawesome/free-solid-svg-icons';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-public-header',
  templateUrl: './public-header.component.html',
  styleUrls: ['./public-header.component.scss']
})
export class PublicHeaderComponent implements OnInit {
  cartItemCount = 0
  opened = true
  searchIcon = faSearch;
  cartIcon = faShoppingCart;
  userIcon = faUser;
  searchText = '';
  searchable;

  filters = {
    category: null,
    minPrice: null as number | null,
    maxPrice: null as number | null,
    store: null,
    sort: null
  };

  constructor(private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService

  ) { }


  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {
      this.filters.category = Number(params['category']) || '';
      this.filters.minPrice = params['minPrice'] ? +params['minPrice'] : null;
      this.filters.maxPrice = params['maxPrice'] ? +params['maxPrice'] : null;
      this.filters.store = params['store'] || null;
      this.filters.sort = params['sort'] || null;
      this.searchable = params['searchable'] || '';
    });
  }

  onSearch() {

    const queryParams: any = {
      searchable: this.searchText || null,
      category: this.filters.category || null,
      minPrice: this.filters.minPrice || null,
      maxPrice: this.filters.maxPrice || null,
      store: this.filters.store || null,
      sort: this.filters.sort || null
    };

    if (!this.searchText.trim()) this.router.navigate(['/publicProducts'], { queryParams });

    this.router.navigate(['/publicProducts'], {
      queryParams
    });
  }

  goToCart() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/cart']);
    } else {
      // guest users also go to cart page (localStorage)
      this.router.navigate(['/cart']);
    }
  }

  goToProfile() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/profile']);
    } else {
      this.router.navigate(['/login']);
    }
  }

}
