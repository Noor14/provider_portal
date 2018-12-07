import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetupWarehouseComponent } from './setup-warehouse.component';

describe('SetupWarehouseComponent', () => {
  let component: SetupWarehouseComponent;
  let fixture: ComponentFixture<SetupWarehouseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetupWarehouseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetupWarehouseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
