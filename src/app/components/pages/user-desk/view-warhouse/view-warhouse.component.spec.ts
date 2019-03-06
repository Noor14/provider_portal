import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewWarhouseComponent } from './view-warhouse.component';

describe('ViewWarhouseComponent', () => {
  let component: ViewWarhouseComponent;
  let fixture: ComponentFixture<ViewWarhouseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewWarhouseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewWarhouseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
