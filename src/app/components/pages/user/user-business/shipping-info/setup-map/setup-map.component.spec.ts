import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetupMapComponent } from './setup-map.component';

describe('SetupMapComponent', () => {
  let component: SetupMapComponent;
  let fixture: ComponentFixture<SetupMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetupMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetupMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
