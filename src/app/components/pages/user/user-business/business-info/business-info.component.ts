import { Component, OnInit, ViewChild } from '@angular/core';
import { trigger, transition, animate, style } from '@angular/animations';
import { SharedService } from '../../../../../services/shared.service';
import { UserBusinessService } from '../user-business.service';
import { UserService } from '../../user.service';
import { ScrollbarComponent } from 'ngx-scrollbar';
import { HttpErrorResponse } from '@angular/common/http';


@Component({
  selector: 'app-business-info',
  templateUrl: './business-info.component.html',
  styleUrls: ['./business-info.component.scss'],
  animations: [
    trigger('slide', [
      transition(':enter', [
        style({transform: 'translateX(-100%)'}),
        animate('200ms ease-in', style({transform: 'translateX(0%)'}))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({transform: 'translateX(-100%)'}))
      ])
    ])
  ]
})
export class BusinessInfoComponent implements OnInit {

  isLeftVisible = true;


  // public dateList: Array<number> = Array(31).fill(0).map((x, i) => i + 1)
  // public monthList: Array<number> = Array(12).fill(0).map((x, i) => i + 1)
  // public yearList: Array<number> = Array(10).fill(0).map((x, i) => i + new Date().getFullYear())







  constructor(
    private _sharedService: SharedService,
    private _userbusinessService: UserBusinessService,
    private _userService: UserService,
  ) { }

  ngOnInit() {

    let userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo && userInfo.returnObject) {
      let userProfile = userInfo.returnObject;
      this.getDocType(userProfile.countryID);

    }
    this._sharedService.formChange.subscribe((state: any) => {
      this.isLeftVisible = state;
    })
    
    this._userbusinessService.getDesgTitle().subscribe((res: any) => {
      if (res.returnStatus == 'Success') {
        this._sharedService.jobTitleList.next(JSON.parse(res.returnObject));
      }
    },(err: HttpErrorResponse) => {
      console.log(err);
    })

    this._userService.getlabelsDescription('BusinessProfile').subscribe((res:any)=>{
      if (res.returnStatus == 'Success') {
        this._sharedService.businessProfileJsonLabels.next(res.returnObject);
      }
    }, (err: HttpErrorResponse) => {
      console.log(err);
    })
  }




  // onMonthChangeEvent({ target }) {
  //   if (target.value) {
  //     const selectedMonth = target.value
  //     const currentMonth = new Date().getMonth() + 1
  //     if (selectedMonth < currentMonth) {
  //       const newYears = new Date().getFullYear() + 1
  //       this.yearList = Array(10).fill(0).map((x, i) => i + newYears)
  //     } else {
  //       this.yearList = Array(10).fill(0).map((x, i) => i + new Date().getFullYear())
  //     }
  //   }
  // }








  getDocType(id) {
    this._userbusinessService.getDocByCountrytype('provider', 0 , id).subscribe((res: any) => {
      if (res.returnStatus == 'Success') {
        console.log(res.returnObject)
        this._sharedService.documentList.next(res.returnObject);
      }
    },(err: HttpErrorResponse) => {
      console.log(err);
    })
  }

}
