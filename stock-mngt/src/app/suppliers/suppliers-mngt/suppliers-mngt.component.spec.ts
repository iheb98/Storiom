import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuppliersMngtComponent } from './suppliers-mngt.component';

describe('SuppliersMngtComponent', () => {
  let component: SuppliersMngtComponent;
  let fixture: ComponentFixture<SuppliersMngtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SuppliersMngtComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SuppliersMngtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
