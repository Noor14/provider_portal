import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../../../services/shared.service';

@Component({
  selector: 'app-business-detail',
  templateUrl: './business-detail.component.html',
  styleUrls: ['./business-detail.component.scss']
})
export class BusinessDetailComponent implements OnInit {

  constructor(
    private _sharedService: SharedService
  ) { }

  ngOnInit() {

    this._sharedService.formProgress.next(30);
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
