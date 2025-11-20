import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductResultTableComponent } from './product-result-table.component';

describe('ProductResultTableComponent', () => {
  let component: ProductResultTableComponent;
  let fixture: ComponentFixture<ProductResultTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductResultTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductResultTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
