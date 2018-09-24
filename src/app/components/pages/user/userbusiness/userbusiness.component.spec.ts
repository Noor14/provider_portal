import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserbusinessComponent } from './userbusiness.component';

describe('UserbusinessComponent', () => {
  let component: UserbusinessComponent;
  let fixture: ComponentFixture<UserbusinessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserbusinessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserbusinessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
