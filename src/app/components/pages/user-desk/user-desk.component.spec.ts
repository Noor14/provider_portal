import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserDeskComponent } from './user-desk.component';

describe('UserDeskComponent', () => {
  let component: UserDeskComponent;
  let fixture: ComponentFixture<UserDeskComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserDeskComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserDeskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
