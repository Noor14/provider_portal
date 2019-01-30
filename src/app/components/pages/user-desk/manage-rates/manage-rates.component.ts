import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { SeaFreightService } from './sea-freight/sea-freight.service';
import { SharedService } from '../../../../services/shared.service';

@Component({
  selector: 'app-manage-rates',
  templateUrl: './manage-rates.component.html',
  styleUrls: ['./manage-rates.component.scss']
})
export class ManageRatesComponent implements OnInit, OnDestroy {

  constructor(
    private _router: Router,
    private _seaFreightService: SeaFreightService,
    private _sharedService: SharedService
  ) { }

  ngOnInit() {
    let userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo && userInfo.returnText) {
      let userProfile = JSON.parse(userInfo.returnText);
      this.getAllservicesBySea(userProfile.UserID, userProfile.ProviderID);
    }

  }
  ngOnDestroy() {
    this._sharedService.termNcondAir.unsubscribe();
    this._sharedService.termNcondGround.unsubscribe();
    this._sharedService.termNcondFCL.unsubscribe();
    this._sharedService.termNcondLCL.unsubscribe();
  }
  getAllservicesBySea(userID, providerID){
  this._seaFreightService.getAllLogisticServiceBySea(userID, providerID).subscribe((res:any )=> {
    if (res.returnStatus == "Success")
      this._sharedService.dataLogisticServiceBySea.next(res.returnObject);
  });
}
  tonavigate(url) {
    this._router.navigate([url]);
  }
  getClass(path): string {
    if (location.pathname === path) {
      return 'active'
    }
  };
}
