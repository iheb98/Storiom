import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParentCategoriesStatsComponent } from './parent-categories-stats.component';

describe('ParentCategoriesStatsComponent', () => {
  let component: ParentCategoriesStatsComponent;
  let fixture: ComponentFixture<ParentCategoriesStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ParentCategoriesStatsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ParentCategoriesStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
