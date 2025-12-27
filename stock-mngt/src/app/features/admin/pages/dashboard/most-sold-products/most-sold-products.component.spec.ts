import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MostSoldProductsComponent } from './most-sold-products.component';

describe('MostSoldProductsComponent', () => {
  let component: MostSoldProductsComponent;
  let fixture: ComponentFixture<MostSoldProductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MostSoldProductsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MostSoldProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
