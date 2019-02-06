import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RateValidityComponent } from './rate-validity.component';

describe('RateValidityComponent', () => {
  let component: RateValidityComponent;
  let fixture: ComponentFixture<RateValidityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RateValidityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RateValidityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
