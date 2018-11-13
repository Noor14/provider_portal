import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectorinfoComponent } from './directorinfo.component';

describe('DirectorinfoComponent', () => {
  let component: DirectorinfoComponent;
  let fixture: ComponentFixture<DirectorinfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DirectorinfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DirectorinfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
