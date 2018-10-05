import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgFilesDragNUploadComponent } from './ng-files-drag-n-upload.component';

describe('NgFilesDragNUploadComponent', () => {
  let component: NgFilesDragNUploadComponent;
  let fixture: ComponentFixture<NgFilesDragNUploadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NgFilesDragNUploadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgFilesDragNUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
