import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../../../../services/shared.service';
import { UserBusinessService } from '../user-business.service';
import { UserService } from '../../user.service';

@Component({
  selector: 'app-business-info',
  templateUrl: './business-info.component.html',
  styleUrls: ['./business-info.component.scss']
})
export class BusinessInfoComponent implements OnInit {


  isLeftVisible = true;
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
    })

    this._userService.getlabelsDescription('BusinessProfile').subscribe((res:any)=>{
      if (res.returnStatus == 'Success') {
        console.log(res.returnObject);
        this._sharedService.businessProfileJsonLabels.next(res.returnObject);
      }
    })
  }
  getDocType(id) {
    this._userbusinessService.getDocByCountrytype('provider', 0, id).subscribe((res: any) => {
      if (res.returnStatus == 'Success') {
        this._sharedService.documentList.next(res.returnObject);
      }
    })
  }

}
