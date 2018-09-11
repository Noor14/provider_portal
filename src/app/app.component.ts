import { Component, OnInit } from '@angular/core';
import { CommonService } from './services/common.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(private _commonService : CommonService){}
  ngOnInit() {
    this._commonService.getCountry().subscribe((res:any) => {
      if(res.returnStatus == 'Success'){
         let countryList= JSON.parse(res.returnObject);
         console.log(countryList);
      }
    })
  }
}
