import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpensesMngtComponent } from './expenses-mngt.component';

describe('ExpensesMngtComponent', () => {
  let component: ExpensesMngtComponent;
  let fixture: ComponentFixture<ExpensesMngtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExpensesMngtComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpensesMngtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
