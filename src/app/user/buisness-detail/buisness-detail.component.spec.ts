import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuisnessDetailComponent } from './buisness-detail.component';

describe('BuisnessDetailComponent', () => {
  let component: BuisnessDetailComponent;
  let fixture: ComponentFixture<BuisnessDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuisnessDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuisnessDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
