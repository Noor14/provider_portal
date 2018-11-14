import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComapnyInfoComponent } from './comapny-info.component';

describe('ComapnyInfoComponent', () => {
  let component: ComapnyInfoComponent;
  let fixture: ComponentFixture<ComapnyInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComapnyInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComapnyInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
