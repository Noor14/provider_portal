import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserBusinessComponent } from './user-business.component';

describe('UserBusinessComponent', () => {
  let component: UserBusinessComponent;
  let fixture: ComponentFixture<UserBusinessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserBusinessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserBusinessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
