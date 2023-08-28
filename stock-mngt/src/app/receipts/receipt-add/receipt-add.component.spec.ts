import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceiptAddComponent } from './receipt-add.component';

describe('ReceiptAddComponent', () => {
  let component: ReceiptAddComponent;
  let fixture: ComponentFixture<ReceiptAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReceiptAddComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReceiptAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
