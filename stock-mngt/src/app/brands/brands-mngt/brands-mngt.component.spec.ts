import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrandsMngtComponent } from './brands-mngt.component';

describe('BrandsMngtComponent', () => {
  let component: BrandsMngtComponent;
  let fixture: ComponentFixture<BrandsMngtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BrandsMngtComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BrandsMngtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
