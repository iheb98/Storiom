import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { faPagelines } from '@fortawesome/free-brands-svg-icons';
import { faChartBar } from '@fortawesome/free-regular-svg-icons';
import { faFile, faGripLines, faInfo, faInfoCircle, faTextWidth, faTimes } from '@fortawesome/free-solid-svg-icons';
import { ProductService } from 'src/app/services/product.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-product-view',
  templateUrl: './product-view.component.html',
  styleUrls: ['./product-view.component.scss']
})
export class ProductViewComponent implements OnInit {
  environment = environment
  id
  product
  timesIcon = faTimes
  infoIcon = faInfoCircle
  chartIcon = faChartBar
  textIcon = faFile
  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(paramMap => {
      this.id = paramMap.get('id');
    })
    this.getProduct(this.id)
  }

  getProduct(id) {
    console.log(id)
    this.productService.getProduct(id).subscribe(
      response => {
        this.product = response
        console.log(this.product)
      }
    )
  }

  navigateTo(link) {
    this.router.navigate([link])
  }

}
