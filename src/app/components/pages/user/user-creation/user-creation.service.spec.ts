import { TestBed, inject } from '@angular/core/testing';

import { UserCreationService } from './user-creation.service';

describe('UserCreationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserCreationService]
    });
  });

  it('should be created', inject([UserCreationService], (service: UserCreationService) => {
    expect(service).toBeTruthy();
  }));
});
