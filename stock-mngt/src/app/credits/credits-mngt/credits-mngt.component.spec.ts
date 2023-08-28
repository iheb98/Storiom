import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditsMngtComponent } from './credits-mngt.component';

describe('CreditsMngtComponent', () => {
  let component: CreditsMngtComponent;
  let fixture: ComponentFixture<CreditsMngtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreditsMngtComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreditsMngtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
