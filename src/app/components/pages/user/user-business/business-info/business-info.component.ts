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

  public isLeftVisible:boolean;

  constructor(
    private _sharedService: SharedService,
    private _userbusinessService: UserBusinessService,
    private _userService: UserService,
  ) { 

    this._sharedService.formChange.next(true);
  }

  ngOnInit() {

    let userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo && userInfo.returnText) {
      let userProfile = JSON.parse(userInfo.returnText);
      this.getDocType(userProfile.CountryID);

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
        // console.log(res)
        this._sharedService.businessProfileJsonLabels.next(res.returnObject);
      }
    }, (err: HttpErrorResponse) => {
      console.log(err);
    })
  }

  getDocType(id) {
    this._userbusinessService.getDocByCountrytype('provider', 0 , id).subscribe((res: any) => {
      if (res.returnStatus == 'Success') {
        // console.log(res.returnObject)
        this._sharedService.documentList.next(res.returnObject);
      }
    },(err: HttpErrorResponse) => {
      console.log(err);
    })
  }

}
