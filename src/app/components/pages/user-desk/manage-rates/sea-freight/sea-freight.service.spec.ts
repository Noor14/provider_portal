import { TestBed, inject } from '@angular/core/testing';

import { SeaFreightService } from './sea-freight.service';

describe('SeaFreightService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SeaFreightService]
    });
  });

  it('should be created', inject([SeaFreightService], (service: SeaFreightService) => {
    expect(service).toBeTruthy();
  }));
});
