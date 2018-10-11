import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../../../services/shared.service';

@Component({
  selector: 'app-leftsidebar',
  templateUrl: './leftsidebar.component.html',
  styleUrls: ['./leftsidebar.component.scss']
})
export class LeftsidebarComponent implements OnInit {


  public percentProgress: number = 0;
  constructor(
    private _sharedService: SharedService,
  ) { }

  ngOnInit() {
    this._sharedService.formProgress.subscribe(state => {
        this.percentProgress = state;
    })
  }

  getClass(type) {
    if(type == 'My Profile'){
      if(location.pathname == '/registration' || location.pathname.indexOf('/otp/') > -1 || location.pathname.indexOf('/password') > -1){
        return "active";
      }
    }

   else if(type == 'My Orgnization'){
      if(location.pathname == '/business-profile' || location.pathname == '/profile-completion'){
        return "active";
      }
    }
 
  };

  formatSubtitle = (percent: number): string => {
    return percent + "%";
    // if(percent >= 100){
    //   return "Congratulations!"
    // }else if(percent >= 50){
    //   return "Half"
    // }else if(percent > 0){
    //   return percent + "%";
    // }else {
    //   return "Not started"
    // }
  }
}
