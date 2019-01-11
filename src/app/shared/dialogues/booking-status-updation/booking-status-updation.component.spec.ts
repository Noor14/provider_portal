import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingStatusUpdationComponent } from './booking-status-updation.component';

describe('BookingStatusUpdationComponent', () => {
  let component: BookingStatusUpdationComponent;
  let fixture: ComponentFixture<BookingStatusUpdationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BookingStatusUpdationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BookingStatusUpdationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
