import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilecompletionComponent } from './profilecompletion.component';

describe('ProfilecompletionComponent', () => {
  let component: ProfilecompletionComponent;
  let fixture: ComponentFixture<ProfilecompletionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfilecompletionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfilecompletionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
