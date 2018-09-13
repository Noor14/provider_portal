import { Component, OnInit } from '@angular/core';
import { CommonService } from './services/common.service';
import { SharedService } from './services/shared.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(private _commonService : CommonService, private _sharedService: SharedService){}
  ngOnInit() {
    this._commonService.getCountry().subscribe((res:any) => {
         this._sharedService.countryList = res;
    })

    this._sharedService.getBrowserlocation().subscribe((res:any)=>{
      if(res.status == "success"){
        this._sharedService.userLocation = res;
      }
    })
  }
}
