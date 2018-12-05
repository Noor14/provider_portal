import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-warehouse-info',
  templateUrl: './warehouse-info.component.html',
  styleUrls: ['./warehouse-info.component.scss']
})
export class WarehouseInfoComponent implements OnInit {
  @ViewChild('stepper') public stepper: ElementRef;
  constructor() { }

  ngOnInit() {
    // console.log(this.stepper);
  }

}
