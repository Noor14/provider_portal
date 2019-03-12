import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SeaFreightService } from '../../../components/pages/user-desk/manage-rates/sea-freight/sea-freight.service';
import { baseExternalAssets } from '../../../constants/base.url';
import { GroundTransportService } from '../../../components/pages/user-desk/manage-rates/ground-transport/ground-transport.service';
import { AirFreightService } from '../../../components/pages/user-desk/manage-rates/air-freight/air-freight.service';
import { loading, getImagePath, ImageSource, ImageRequiredSize, getProviderImage } from '../../../constants/globalFunctions';
import { ManageRatesService } from '../../../components/pages/user-desk/manage-rates/manage-rates.service';
import { HttpErrorResponse } from '@angular/common/http';
@Component({
  selector: 'app-rate-history',
  templateUrl: './rate-history.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./rate-history.component.scss']
})
export class RateHistoryComponent implements OnInit {
  @Input() getRecord: any;
  public loading: boolean = false
  public baseExternalAssets: string = baseExternalAssets;
  public userProfile: any;
  public history: any;
  public destinationDet: any;
  public originDet: any;
  public shippingInfo: any = [];
  public containerInfo: any;
  public cargoInfo: any;
  public customerInfo: any;
  combinedContainers: any;
  fclContainers: any;
  allCargoType: any;
  historyHead: any;
  groundPorts: any;
  constructor(
    private _activeModal: NgbActiveModal,
    private _seaFreightService: SeaFreightService,
    private _airFreightService: AirFreightService,
    private _groundTransportService: GroundTransportService,
    private _manageRateService: ManageRatesService
  ) { }

  ngOnInit() {
    let userInfo = JSON.parse(localStorage.getItem('userInfo'));
    this.getLists()
    if (userInfo && userInfo.returnText) {
      this.userProfile = JSON.parse(userInfo.returnText);
    }
    if (this.getRecord.type && this.getRecord.type == 'Rate_FCL') {
      this.getHistoryFCL();
    }
    else if (this.getRecord.type && this.getRecord.type == 'Rate_LCL') {
      this.getHistoryLCL();
    }
    else if (this.getRecord.type && this.getRecord.type == 'Rate_AIR') {
      this.getHistoryAir();
    }
    else if (this.getRecord.type && this.getRecord.type != 'Rate_LCL' && this.getRecord.type != 'Rate_FCL' && this.getRecord.type != 'Rate_AIR') {
      this.getHistoryGround();
    }
  }

  getLists() {
    this.combinedContainers = JSON.parse(localStorage.getItem('containers'))
  }

  getHistoryFCL() {
    this.loading = true
    this._seaFreightService.getRecHistoryFCL(this.getRecord.id, this.getRecord.type, this.userProfile.LoginID).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        this.loading = false
        let records = res.returnObject;
        if (records[0].history && records[0].history.length) {
          records[0].history.map(obj => {
            if (typeof (obj.AuditDesc) == "string") {
              obj.AuditDesc = JSON.parse(obj.AuditDesc);
            }
          })
          this.history = records[0].history;
        }
        this.historyHead = records[0].historyHead;
        this.shippingInfo = this.getRecord.shippingLines.filter(e => e.CarrierID === this.historyHead[0].CarrierID)
        const containers = JSON.parse(localStorage.getItem('containers'))
        this.containerInfo = containers.find(e => e.ContainerSpecID === this.historyHead[0].ContainerSpecID && e.ContainerFor === 'FCL')
        this.cargoInfo = this.historyHead[0].ShippingCatName
        this.destinationDet = this.getRecord.ports.find(obj => obj.PortID === this.historyHead[0].PodID);
        this.originDet = this.getRecord.ports.find(obj => obj.PortID === this.historyHead[0].PolID);
      }
    })
  }

  getHistoryLCL() {
    this.loading = true
    this._seaFreightService.getRecHistoryLCL(this.getRecord.id, this.getRecord.type, this.userProfile.LoginID).subscribe((res: any) => {
      this.loading = false
      if (res.returnStatus == "Success") {
        let records = res.returnObject;
        if (records[0].history && records[0].history.length) {
          records[0].history.map(obj => {
            if (typeof (obj.AuditDesc) == "string") {
              obj.AuditDesc = JSON.parse(obj.AuditDesc);
            }
          })
          this.history = records[0].history;
        }
        this.historyHead = records[0].historyHead;
        this.shippingInfo = this.getRecord.shippingLines.filter(e => e.CarrierID === this.historyHead[0].CarrierID)
        this.cargoInfo = this.historyHead[0].ShippingCatName
        this.destinationDet = this.getRecord.ports.find(obj => obj.PortID === this.historyHead[0].PodID);
        this.originDet = this.getRecord.ports.find(obj => obj.PortID === this.historyHead[0].PolID);
      }
    })
  }
  getHistoryAir() {
    this.loading = true
    this._airFreightService.getRecHistory(this.getRecord.id, this.getRecord.type, this.userProfile.LoginID).subscribe((res: any) => {
      this.loading = false
      if (res.returnStatus == "Success") {
        let records = res.returnObject;
        if (records[0].history && records[0].history.length) {
          records[0].history.map(obj => {
            if (typeof (obj.AuditDesc) == "string") {
              obj.AuditDesc = JSON.parse(obj.AuditDesc);
            }
          })
          this.history = records[0].history;
        }
        if (records[0].customer && records[0].customer.length) {
          let custDet = records[0].customer[0];
          let obj = {
            CustomerImage: JSON.parse(custDet.CustomerImage)[0].DocumentFile,
            CustomerName: custDet.CustomerName
          }
          this.customerInfo = obj;
        }
        this.destinationDet = records[0].Toport[0];
        this.originDet = records[0].fromport[0];
        this.cargoInfo = records[0].cargoType[0];
        this.shippingInfo = records[0].shippingline[0];
      }
    })
  }
  getHistoryGround() {
    this.loading = true
    this.getGroundPorts()
    this._groundTransportService.getRecHistoryGround(this.getRecord.id, 'RATE_TRUCK', this.userProfile.LoginID, this.getRecord.transportType).subscribe((res: any) => {
      this.loading = false
      if (res.returnStatus == "Success") {
        let records = res.returnObject;
        if (records.history && records.history.length) {
          records.history.map(obj => {
            if (typeof (obj.AuditDesc) == "string") {
              obj.AuditDesc = JSON.parse(obj.AuditDesc);
            }
          })
          this.history = records.history;
        }
        this.historyHead = records.historyHead;
        const containers = JSON.parse(localStorage.getItem('containers'))
        this.containerInfo = containers.find(e => e.ContainerSpecID === this.historyHead[0].containerSpecID && e.ContainerFor === 'FTL')
        this.cargoInfo = this.historyHead[0].shippingCatName
        const ports = JSON.parse(localStorage.getItem('PortDetails'))
        if (this.historyHead[0].podType === 'CITY' && this.historyHead[0].polType === 'CITY') {
          this.destinationDet = {
            podType: this.historyHead[0].podType,
            podName: this.historyHead[0].podName,
            podImageName: this.historyHead[0].podImageName,

          }
          this.originDet = {
            polType: this.historyHead[0].polType,
            polName: this.historyHead[0].polName,
            polImageName: this.historyHead[0].podImageName
          }
        }

        if (this.historyHead[0].podType === 'Ground') {
          console.log(this.groundPorts);
          
          this.destinationDet = this.groundPorts.find(obj => obj.PortID === this.historyHead[0].podID);
        } else if (this.historyHead[0].podType === 'SEA') {
          this.destinationDet = ports.find(obj => obj.PortID === this.historyHead[0].podID);
        }

        if (this.historyHead[0].polType === 'Ground') {
          console.log('here');
          this.originDet = this.groundPorts.find(obj => obj.PortID === this.historyHead[0].polID);
        } else if (this.historyHead[0].polType === 'SEA') {
          console.log('here');
          this.originDet = ports.find(obj => obj.PortID === this.historyHead[0].polID);
        }
        // this.originDet = ports.find(obj => obj.PortID === this.historyHead[0].polID);
        console.log(this.destinationDet);
        console.log(this.originDet);
      }
    })
  }
  closeModal() {
    this._activeModal.close(status);
    document.getElementsByTagName('html')[0].style.overflowY = 'auto';
  }

  getGroundPorts() {
    this._manageRateService.getPortsData('ground').subscribe((res: any) => {
      loading(false)
      this.groundPorts = res;
    })
  }

  getProviderImage($image: string) {
    const providerImage = getProviderImage($image)
    return getImagePath(ImageSource.FROM_SERVER, providerImage, ImageRequiredSize.original)
  }

}
