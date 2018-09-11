import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-business-detail',
  templateUrl: './business-detail.component.html',
  styleUrls: ['./business-detail.component.scss']
})
export class BusinessDetailComponent implements OnInit {

  constructor() { }

  ngOnInit() {

    this.getTenYears();
  }

  getTenYears(){
    let date = new Date();
    let pastYears = [];
    let futureYears = [];
    for (var i=0; i < 11; i++){
      pastYears.push(date.getFullYear()-i);
    }
    for (var i=0; i < 11; i++){
      futureYears.push(date.getFullYear()+i);
    }
  }


}
