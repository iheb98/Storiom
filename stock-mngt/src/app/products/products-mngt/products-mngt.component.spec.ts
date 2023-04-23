import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductsMngtComponent } from './products-mngt.component';

describe('ProductsMngtComponent', () => {
  let component: ProductsMngtComponent;
  let fixture: ComponentFixture<ProductsMngtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductsMngtComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductsMngtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
