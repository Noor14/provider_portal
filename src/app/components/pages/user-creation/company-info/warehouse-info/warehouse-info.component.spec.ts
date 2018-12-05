import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WarehouseInfoComponent } from './warehouse-info.component';

describe('WarehouseInfoComponent', () => {
  let component: WarehouseInfoComponent;
  let fixture: ComponentFixture<WarehouseInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WarehouseInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WarehouseInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
