import { TestBed, inject } from '@angular/core/testing';

import { AirFreightService } from './air-freight.service';

describe('AirFreightService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AirFreightService]
    });
  });

  it('should be created', inject([AirFreightService], (service: AirFreightService) => {
    expect(service).toBeTruthy();
  }));
});
