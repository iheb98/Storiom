import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductsSearchReceiptComponent } from './products-search-receipt.component';

describe('ProductsSearchReceiptComponent', () => {
  let component: ProductsSearchReceiptComponent;
  let fixture: ComponentFixture<ProductsSearchReceiptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductsSearchReceiptComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductsSearchReceiptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
