
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { ProductService } from 'src/app/core/services/product.service';
import { PublicService } from 'src/app/core/services/public.service';
import { LoadingService } from 'src/app/core/services/loading.service';

@Component({
  selector: 'app-public-view-product',
  templateUrl: './public-view-product.component.html',
  styleUrls: ['./public-view-product.component.scss']
})
export class PublicViewProductComponent implements OnInit {

  environment = environment;
  product: any;
  id: string | null = null;

  selectedImage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private publicService: PublicService,
    private loadingService: LoadingService
    //private cartService: CartService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.id = params.get('id');

      if (this.id) {
        this.loadProduct(this.id);
      }
    });
  }

  loadProduct(id: string) {
    this.loadingService.screenLoading()
    this.publicService.getPublicProduct(id).subscribe(res => {
      this.product = res;
      this.loadingService.screenLoaded()
    }, (error) => {
      this.loadingService.screenLoaded()
    });
  }

  addToCart(product: any) {
    //this.cartService.add(product);
  }

  openImage(image: string) {
    this.selectedImage = image;
  }

  closeImage() {
    this.selectedImage = null;
  }
}
