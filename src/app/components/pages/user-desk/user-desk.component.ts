import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { DashboardService } from './dashboard/dashboard.service';
import { SharedService } from '../../../services/shared.service';

@Component({
  selector: 'app-user-desk',
  templateUrl: './user-desk.component.html',
  styleUrls: ['./user-desk.component.scss']
})
export class UserDeskComponent implements OnInit {

  constructor(
    private _dashboardService: DashboardService,
    private _sharedService: SharedService
    ) { }

  ngOnInit() {
    let userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo && userInfo.returnText) {
      let userProfile = JSON.parse(userInfo.returnText);
      this.getDashboardData(userProfile.UserID);

    }
  }

  getDashboardData(id){
    this._dashboardService.getdashboardDetails(id).subscribe((res: any) => {
      if (res.returnStatus == 'Success') {
        this._sharedService.dashboardDetail.next(res.returnObject);
      }
    }, (err: HttpErrorResponse) => {
      console.log(err);
    })
  }

}
