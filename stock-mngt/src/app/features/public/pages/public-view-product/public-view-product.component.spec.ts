import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicViewProductComponent } from './public-view-product.component';

describe('PublicViewProductComponent', () => {
  let component: PublicViewProductComponent;
  let fixture: ComponentFixture<PublicViewProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PublicViewProductComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicViewProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
