import { TestBed, inject } from '@angular/core/testing';

import { GroundTransportService } from './ground-transport.service';

describe('GroundTransportService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GroundTransportService]
    });
  });

  it('should be created', inject([GroundTransportService], (service: GroundTransportService) => {
    expect(service).toBeTruthy();
  }));
});
