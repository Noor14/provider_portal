import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoDialogueComponent } from './video-dialogue.component';

describe('VideoDialogueComponent', () => {
  let component: VideoDialogueComponent;
  let fixture: ComponentFixture<VideoDialogueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VideoDialogueComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoDialogueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
