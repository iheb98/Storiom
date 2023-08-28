import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkerAddComponent } from './worker-add.component';

describe('WorkerAddComponent', () => {
  let component: WorkerAddComponent;
  let fixture: ComponentFixture<WorkerAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkerAddComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkerAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
