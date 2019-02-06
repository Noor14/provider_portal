import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RateHistoryComponent } from './rate-history.component';

describe('RateHistoryComponent', () => {
  let component: RateHistoryComponent;
  let fixture: ComponentFixture<RateHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RateHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RateHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
