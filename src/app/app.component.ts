import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonService } from './services/common.service';
import { SharedService } from './services/shared.service';
import { ScrollbarComponent } from 'ngx-scrollbar';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  @ViewChild(ScrollbarComponent) scrollRef: ScrollbarComponent;

  constructor(private _commonService : CommonService, private _sharedService: SharedService){}
  
  ngOnInit() {
    this._commonService.getCountry().subscribe((res:any) => {
         if(res && res.length){
           res.map((obj) => {
            if (typeof (obj.desc) == "string") {
              obj.desc = JSON.parse(obj.desc);
            }
          })
         this._sharedService.countryList.next(res);
        }
      });

    this._commonService.getBrowserlocation().subscribe((state:any)=>{
      if(state.status == "success"){
        this._sharedService.setMapLocation(state);
      }
    })
  }
}
