import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SeaRateDialogComponent } from './sea-rate-dialog.component';

describe('SeaRateDialogComponent', () => {
  let component: SeaRateDialogComponent;
  let fixture: ComponentFixture<SeaRateDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SeaRateDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SeaRateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
