import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddProductFromReceiptComponent } from './add-product-from-receipt.component';

describe('AddProductFromReceiptComponent', () => {
  let component: AddProductFromReceiptComponent;
  let fixture: ComponentFixture<AddProductFromReceiptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddProductFromReceiptComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddProductFromReceiptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
