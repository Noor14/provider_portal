import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OtpconfirmationComponent } from './otpconfirmation.component';

describe('OtpconfirmationComponent', () => {
  let component: OtpconfirmationComponent;
  let fixture: ComponentFixture<OtpconfirmationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OtpconfirmationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OtpconfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
