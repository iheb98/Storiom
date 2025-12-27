import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoresMngtComponent } from './stores-mngt.component';

describe('StoresMngtComponent', () => {
  let component: StoresMngtComponent;
  let fixture: ComponentFixture<StoresMngtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StoresMngtComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StoresMngtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
