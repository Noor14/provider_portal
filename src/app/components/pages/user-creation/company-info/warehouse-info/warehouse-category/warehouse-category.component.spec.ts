import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WarehouseCategoryComponent } from './warehouse-category.component';

describe('WarehouseCategoryComponent', () => {
  let component: WarehouseCategoryComponent;
  let fixture: ComponentFixture<WarehouseCategoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WarehouseCategoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WarehouseCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
