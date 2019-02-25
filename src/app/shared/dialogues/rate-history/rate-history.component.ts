import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SeaFreightService } from '../../../components/pages/user-desk/manage-rates/sea-freight/sea-freight.service';
import { baseExternalAssets } from '../../../constants/base.url';
import { GroundTransportService } from '../../../components/pages/user-desk/manage-rates/ground-transport/ground-transport.service';
import { AirFreightService } from '../../../components/pages/user-desk/manage-rates/air-freight/air-freight.service';
@Component({
  selector: 'app-rate-history',
  templateUrl: './rate-history.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./rate-history.component.scss']
})
export class RateHistoryComponent implements OnInit {
  @Input() getRecord: any;
  public baseExternalAssets:string = baseExternalAssets;
  public userProfile:any;
  public history: any;
  public destinationDet: any;
  public originDet: any;
  public shippingInfo: any;
  public containerInfo: any;
  public cargoInfo: any;
  public customerInfo: any;
  constructor(
    private _activeModal: NgbActiveModal,
    private _seaFreightService: SeaFreightService,
    private _airFreightService: AirFreightService,
    private _groundTransportService: GroundTransportService
    ) { }

  ngOnInit() {
    let userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo && userInfo.returnText) {
      this.userProfile = JSON.parse(userInfo.returnText);
    }
    if (this.getRecord.type && this.getRecord.type == 'Rate_FCL'){
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
  getHistoryFCL(){
    this._seaFreightService.getRecHistoryFCL(this.getRecord.id, this.getRecord.type, this.userProfile.LoginID).subscribe((res:any)=>{
      if(res.returnStatus=="Success"){
        let records = JSON.parse(res.returnObject);
        if (records[0].History && records[0].History.length){
          records[0].History.map(obj => {
            if (typeof (obj.AuditDesc) == "string") {
              obj.AuditDesc = JSON.parse(obj.AuditDesc);
            }
          })
          this.history = records[0].History;
        }
        if (records[0].customer){
          let custDet = JSON.parse(records[0].customer)[0];
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
        this.containerInfo = records[0].container[0];
      }
    })
  }
  getHistoryLCL() {
    this._seaFreightService.getRecHistoryLCL(this.getRecord.id, this.getRecord.type, this.userProfile.LoginID).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        let records = JSON.parse(res.returnObject);
        if (records[0].History && records[0].History.length) {
          records[0].History.map(obj => {
            if (typeof (obj.AuditDesc) == "string") {
              obj.AuditDesc = JSON.parse(obj.AuditDesc);
            }
          })
          this.history = records[0].History;
        }
        if (records[0].customer) {
          let custDet = JSON.parse(records[0].customer)[0];
          let obj = {
            CustomerImage: JSON.parse(custDet.CustomerImage)[0].DocumentFile,
            CustomerName: custDet.CustomerName
          }
         this.customerInfo = obj;
        }
        this.destinationDet = records[0].Toport[0];
        this.originDet = records[0].fromport[0];
        this.cargoInfo = records[0].cargoType[0];
      }
    })
  }
  getHistoryAir() {
    this._airFreightService.getRecHistory(this.getRecord.id, this.getRecord.type, this.userProfile.LoginID).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        let records = JSON.parse(res.returnObject);
        if (records[0].History && records[0].History.length) {
          records[0].History.map(obj => {
            if (typeof (obj.AuditDesc) == "string") {
              obj.AuditDesc = JSON.parse(obj.AuditDesc);
            }
          })
          this.history = records[0].History;
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
    this._groundTransportService.getRecHistoryGround(this.getRecord.id, this.getRecord.type, this.userProfile.LoginID, this.getRecord.transportType).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        let records = JSON.parse(res.returnObject);
        if (records[0].History && records[0].History.length) {
          records[0].History.map(obj => {
            if (typeof (obj.AuditDesc) == "string") {
              obj.AuditDesc = JSON.parse(obj.AuditDesc);
            }
          })
          this.history = records[0].History;
        }
        if (records[0].customer) {
          let custDet = JSON.parse(records[0].customer)[0];
          let obj = {
            CustomerImage: JSON.parse(custDet.CustomerImage)[0].DocumentFile,
            CustomerName: custDet.CustomerName
          }
          this.customerInfo = obj;
        }
        if (records[0].Toport){
          this.destinationDet = JSON.parse(records[0].Toport)[0];
        }
        if (records[0].fromport){
          this.originDet = JSON.parse(records[0].fromport)[0];
        }
        this.cargoInfo = records[0].cargoType[0];
        this.containerInfo = records[0].container[0];
      }
    })
  }
  closeModal() {
    this._activeModal.close(status);
    document.getElementsByTagName('html')[0].style.overflowY = 'auto';
  }
}
