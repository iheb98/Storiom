import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationsMngtComponent } from './operations-mngt.component';

describe('OperationsMngtComponent', () => {
  let component: OperationsMngtComponent;
  let fixture: ComponentFixture<OperationsMngtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OperationsMngtComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OperationsMngtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
