import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReUploadDocComponent } from './re-upload-doc.component';

describe('ReUploadDocComponent', () => {
  let component: ReUploadDocComponent;
  let fixture: ComponentFixture<ReUploadDocComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReUploadDocComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReUploadDocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
