import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkersMngtComponent } from './workers-mngt.component';

describe('WorkersMngtComponent', () => {
  let component: WorkersMngtComponent;
  let fixture: ComponentFixture<WorkersMngtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkersMngtComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkersMngtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
