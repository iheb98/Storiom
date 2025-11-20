import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceiptsMngtComponent } from './receipts-mngt.component';

describe('ReceiptsMngtComponent', () => {
  let component: ReceiptsMngtComponent;
  let fixture: ComponentFixture<ReceiptsMngtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReceiptsMngtComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReceiptsMngtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
