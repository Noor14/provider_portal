import { TestBed, inject } from '@angular/core/testing';

import { ViewBookingService } from './view-booking.service';

describe('ViewBookingService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ViewBookingService]
    });
  });

  it('should be created', inject([ViewBookingService], (service: ViewBookingService) => {
    expect(service).toBeTruthy();
  }));
});
