import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WarehouseAddRatesComponent } from './warehouse-add-rates.component';

describe('WarehouseAddRatesComponent', () => {
  let component: WarehouseAddRatesComponent;
  let fixture: ComponentFixture<WarehouseAddRatesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WarehouseAddRatesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WarehouseAddRatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
