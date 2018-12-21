import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AirFreightComponent } from './air-freight.component';

describe('AirFreightComponent', () => {
  let component: AirFreightComponent;
  let fixture: ComponentFixture<AirFreightComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AirFreightComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AirFreightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
