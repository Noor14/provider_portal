import { TestBed, async, inject } from '@angular/core/testing';

import { ServiceGuard } from './service.guard';

describe('ServiceGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ServiceGuard]
    });
  });

  it('should ...', inject([ServiceGuard], (guard: ServiceGuard) => {
    expect(guard).toBeTruthy();
  }));
});
