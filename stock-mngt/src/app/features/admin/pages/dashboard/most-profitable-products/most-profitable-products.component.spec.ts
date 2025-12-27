import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MostProfitableProductsComponent } from './most-profitable-products.component';

describe('MostProfitableProductsComponent', () => {
  let component: MostProfitableProductsComponent;
  let fixture: ComponentFixture<MostProfitableProductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MostProfitableProductsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MostProfitableProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
