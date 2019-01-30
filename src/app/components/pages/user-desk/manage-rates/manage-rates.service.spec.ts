import { TestBed, inject } from '@angular/core/testing';

import { ManageRatesService } from './manage-rates.service';

describe('ManageRatesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ManageRatesService]
    });
  });

  it('should be created', inject([ManageRatesService], (service: ManageRatesService) => {
    expect(service).toBeTruthy();
  }));
});
