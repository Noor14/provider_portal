import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { SeaFreightService } from './sea-freight/sea-freight.service';
import { SharedService } from '../../../../services/shared.service';
import { loading } from '../../../../constants/globalFunctions';
import { ManageRatesService } from './manage-rates.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-manage-rates',
  templateUrl: './manage-rates.component.html',
  styleUrls: ['./manage-rates.component.scss']
})
export class ManageRatesComponent implements OnInit {

  constructor(
    private _router: Router,
    private _seaFreightService: SeaFreightService,
    private _sharedService: SharedService,
    private _manageRatesService: ManageRatesService
  ) { }

  ngOnInit() {
    let userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo && userInfo.returnText) {
      let userProfile = JSON.parse(userInfo.returnText);
      this.getAllservicesBySea(userProfile.UserID, userProfile.ProviderID);
    }
    this.getPortsData()
    this.getContainers()
  }
  // ngOnDestroy() {
  //   this._sharedService.termNcondAir.unsubscribe();
  //   this._sharedService.termNcondGround.unsubscribe();
  //   this._sharedService.termNcondFCL.unsubscribe();
  //   this._sharedService.termNcondLCL.unsubscribe();
  // }
  getAllservicesBySea(userID, providerID) {
    this._seaFreightService.getAllLogisticServiceBySea(userID, providerID).subscribe((res: any) => {
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

  getPortsData() {
    this._manageRatesService.getPortsData().subscribe((res: any) => {
      localStorage.setItem("PortDetails", JSON.stringify(res));
    }, (err: HttpErrorResponse) => {
      loading(false)
    })
  }

  getContainers() {
    this._manageRatesService.getContainersMapping().subscribe((res: any) => {
      localStorage.setItem("containers", JSON.stringify(res.returnObject));
    }, (err: HttpErrorResponse) => {
      loading(false)
    })
  }
}
