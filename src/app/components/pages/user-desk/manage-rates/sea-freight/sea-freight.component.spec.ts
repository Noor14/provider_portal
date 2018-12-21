import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SeaFreightComponent } from './sea-freight.component';

describe('SeaFreightComponent', () => {
  let component: SeaFreightComponent;
  let fixture: ComponentFixture<SeaFreightComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SeaFreightComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SeaFreightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
