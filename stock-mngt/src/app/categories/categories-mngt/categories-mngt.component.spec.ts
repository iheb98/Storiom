import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoriesMngtComponent } from './categories-mngt.component';

describe('CategoriesMngtComponent', () => {
  let component: CategoriesMngtComponent;
  let fixture: ComponentFixture<CategoriesMngtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CategoriesMngtComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoriesMngtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
