import { TestBed, inject } from '@angular/core/testing';

import { DynamicScriptLoaderService } from './dynamic-script-loader.service';

describe('DynamicScriptLoaderService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DynamicScriptLoaderService]
    });
  });

  it('should be created', inject([DynamicScriptLoaderService], (service: DynamicScriptLoaderService) => {
    expect(service).toBeTruthy();
  }));
});
