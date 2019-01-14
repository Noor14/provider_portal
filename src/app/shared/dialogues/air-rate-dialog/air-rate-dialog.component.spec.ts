import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AirRateDialogComponent } from './air-rate-dialog.component';

describe('AirRateDialogComponent', () => {
  let component: AirRateDialogComponent;
  let fixture: ComponentFixture<AirRateDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AirRateDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AirRateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
