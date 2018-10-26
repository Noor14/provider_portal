import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonService } from './services/common.service';
import { SharedService } from './services/shared.service';
import { ScrollbarComponent } from 'ngx-scrollbar';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { filter } from 'rxjs/operators';
import '../assets/scss/_loader.css';
import { HttpErrorResponse } from '@angular/common/http';
// import { UserService } from './components/pages/user/user.service';
// import * as moment from 'moment';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{

  @ViewChild(ScrollbarComponent) scrollRef: ScrollbarComponent;

  constructor(
    private _commonService : CommonService,
     private _sharedService: SharedService,
     private _router: Router,
    // private _auth: UserService
    ){}
  
  ngOnInit() {
    this._router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.scrollTop();
    });



    this._sharedService.formChange.subscribe((state: any) => {
      this.scrollTop();
    })

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

    // this.getGuestToken();

    
  }

  // async getGuestToken() {

  //   const toSend = {
  //     password: 'h@shMove123',
  //     loginUserID: 'support@hashmove.com',
  //     CountryCode: 'PK',
  //     LoginIpAddress: "0.0.0.0",
  //     LoginDate: moment(Date.now()).format(),
  //     LoginRemarks: ""
  //   }

  //   this._auth.userLogin(toSend).subscribe((resp: any) => {

  //     console.log(resp);
  //     if (resp.returnId > 0 && resp.returnObject) {
  //       this._auth.saveJwtToken(resp.returnObject.token)
  //       this._auth.saveRefreshToken(resp.returnObject.refreshToken)
  //     }
     
  //   }, (err: HttpErrorResponse) => {
  //     console.log(err);
  //   })

  // }


  scrollTop(){
    if (this.scrollRef) {
      setTimeout(() => {
        this.scrollRef.scrollYTo(0, 20);
      }, 0)
    }
  }
}
