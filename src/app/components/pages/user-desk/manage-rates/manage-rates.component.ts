import { Component, OnInit, OnDestroy } from '@angular/core';
import { SeaFreightService } from './sea-freight/sea-freight.service';
import { SharedService } from '../../../../services/shared.service';
import { loading, isJSON } from '../../../../constants/globalFunctions';
import { ManageRatesService } from './manage-rates.service';
import { HttpErrorResponse } from '@angular/common/http';
import { SettingService } from '../settings/setting.service';

@Component({
  selector: 'app-manage-rates',
  templateUrl: './manage-rates.component.html',
  styleUrls: ['./manage-rates.component.scss']
})
export class ManageRatesComponent implements OnInit, OnDestroy {

  public selectedServices: any[];
  private dashBoardSubscriber:any
  public seaDisabled :boolean= true;
  public airDisabled: boolean = true;
  public groundDisabled: boolean = true;
  public waarehouseDisabled: boolean = true;
  constructor(
    private _seaFreightService: SeaFreightService,
    private _settingService: SettingService,
    private _sharedService: SharedService,
    private _manageRatesService: ManageRatesService
  ) { }

  ngOnInit() {
    let userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo && userInfo.returnText) {
      let userProfile = JSON.parse(userInfo.returnText);
      this.getAllservicesBySea(userProfile.UserID, userProfile.ProviderID);
      this.getUserDetail(userProfile.UserID);
    }
    this.getPortsData();
    this.getContainers();
    this.getDashboardDetail();
  }
  ngOnDestroy() {
    this.dashBoardSubscriber.unsubscribe();
  }
  getDashboardDetail(){
    this.dashBoardSubscriber = this._sharedService.dashboardDetail.subscribe((state: any) => {
      if (state && Object.keys(state).length) {
        if (state.LogisticService && isJSON(state.LogisticService)) {
          this.selectedServices = JSON.parse(state.LogisticService);
          let indexSEA = this.selectedServices.findIndex(elem => elem.LogServCode == 'SEA_FFDR');
          let indexAIR = this.selectedServices.findIndex(elem => elem.LogServCode == 'AIR_FFDR');
          let indexGround = this.selectedServices.findIndex(elem => elem.LogServCode == 'TRUK');
          let indexWarehouse = this.selectedServices.findIndex(elem => elem.LogServCode =='WRHS');
          this.seaDisabled = (indexSEA >= 0) ? false : true;
          this.airDisabled = (indexAIR >= 0) ? false : true;
          this.groundDisabled = (indexGround >= 0) ? false : true;
          this.waarehouseDisabled = (indexWarehouse >= 0) ? false : true;

        
        }
      }
    });
  }

  getAllservicesBySea(userID, providerID) {
    this._seaFreightService.getAllLogisticServiceBySea(userID, providerID).subscribe((res: any) => {
      if (res.returnStatus == "Success")
        this._sharedService.dataLogisticServiceBySea.next(res.returnObject);
    });
  }

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

  getUserDetail(UserID) {
    loading(true);
    this._settingService.getSettingInfo(UserID).subscribe((res: any) => {
      loading(false);
      if (res.returnStatus == "Success") {
        localStorage.setItem('userCurrency', res.returnObject.CurrencyID)
      }
    }, (err) => {
      loading(false);
    })
  }
}
