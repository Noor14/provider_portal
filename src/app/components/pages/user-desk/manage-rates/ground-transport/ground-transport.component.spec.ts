import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroundTransportComponent } from './ground-transport.component';

describe('GroundTransportComponent', () => {
  let component: GroundTransportComponent;
  let fixture: ComponentFixture<GroundTransportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroundTransportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroundTransportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
