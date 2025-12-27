import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceiptResultTableComponent } from './receipt-result-table.component';

describe('ReceiptResultTableComponent', () => {
  let component: ReceiptResultTableComponent;
  let fixture: ComponentFixture<ReceiptResultTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReceiptResultTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReceiptResultTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
