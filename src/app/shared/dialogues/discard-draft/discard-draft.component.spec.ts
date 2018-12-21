import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscardDraftComponent } from './discard-draft.component';

describe('DiscardDraftComponent', () => {
  let component: DiscardDraftComponent;
  let fixture: ComponentFixture<DiscardDraftComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiscardDraftComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiscardDraftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
