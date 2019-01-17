import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroundRateDialogComponent } from './ground-rate-dialog.component';

describe('GroundRateDialogComponent', () => {
  let component: GroundRateDialogComponent;
  let fixture: ComponentFixture<GroundRateDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroundRateDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroundRateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
