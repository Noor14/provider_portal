import { Component, OnInit, Input } from '@angular/core';
import { PlatformLocation } from '@angular/common';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { SeaFreightService } from '../../../components/pages/user-desk/manage-rates/sea-freight/sea-freight.service';
import { AirFreightService } from '../../../components/pages/user-desk/manage-rates/air-freight/air-freight.service';
import { GroundTransportService } from '../../../components/pages/user-desk/manage-rates/ground-transport/ground-transport.service';
import { WarehouseService } from '../../../components/pages/user-desk/manage-rates/warehouse-list/warehouse.service';
import { ToastrService } from 'ngx-toastr';
import { SettingService } from '../../../components/pages/user-desk/settings/setting.service';

@Component({
  selector: 'app-confirm-delete-dialog',
  providers: [SeaFreightService, AirFreightService, GroundTransportService, WarehouseService],
  templateUrl: './confirm-delete-dialog.component.html',
  styleUrls: ['./confirm-delete-dialog.component.scss']
})
export class ConfirmDeleteDialogComponent implements OnInit {
  
  @Input() deleteIds: any;
  private userProfile: any;
  constructor(
    private _settingService: SettingService,
    private seaFreightService : SeaFreightService,
    private airFreightService: AirFreightService,
    private groundTransportService: GroundTransportService,
    private _warehouseService: WarehouseService,
    private location: PlatformLocation,
    private _activeModal: NgbActiveModal,
    private _toast: ToastrService,
    ) { location.onPopState(() => this.closeModal(null)); }

  ngOnInit() {
    let userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo && userInfo.returnText) {
      this.userProfile = JSON.parse(userInfo.returnText);
    }
  }
  delete(){
    if (this.deleteIds.type == "draftSeaRateFCL"){
      this.seaFreightService.deleteNDiscardDraftRate(this.deleteIds.data).subscribe((res: any) => {
        if (res.returnStatus == "Success") {
          this.closeModal(res.returnStatus);
        }
      })
    }
    else if (this.deleteIds.type == "draftSeaRateLCL") {
      this.seaFreightService.deleteNDiscardDraftRateLCl(this.deleteIds.data).subscribe((res: any) => {
        if (res.returnStatus == "Success") {
          this.closeModal(res.returnStatus);
        }
      })
    }
    else if (this.deleteIds.type == "publishSeaRateFCL"){
      let obj = {
        publishRateIDs: this.deleteIds.data,
        modifiedBy: this.userProfile.LoginID
      };
      this.seaFreightService.deletePublishRateFCL(obj).subscribe((res: any) => {
        if (res.returnStatus == "Success") {
          this.closeModal(res.returnStatus);
        }
      })
    }
    else if (this.deleteIds.type === "warehouse"){
      let obj = {
        publishRateIDs: this.deleteIds.data,
        modifiedBy: this.userProfile.LoginID
      };
      this._warehouseService.deletePublishedRate(obj).subscribe((res: any) => {
        console.log(res);
        
        if (res.returnStatus == "Success") {
          this.closeModal(res.returnStatus);
        }
      })
    }
    else if (this.deleteIds.type == "publishSeaRateLCL") {
      let obj = {
        publishRateIDs: this.deleteIds.data,
        modifiedBy: this.userProfile.LoginID
      };
      this.seaFreightService.deletePublishRateLCL(obj).subscribe((res: any) => {
        if (res.returnStatus == "Success") {
          this.closeModal(res.returnStatus);
        }
      })
    }

    else if (this.deleteIds.type == "draftAirRate") {
      this.airFreightService.deleteNDiscardDraftRate(this.deleteIds.data).subscribe((res: any) => {
        if (res.returnStatus == "Success") {
          this.closeModal(res.returnStatus);
        }
      })
    }

    else if (this.deleteIds.type == "publishAirRate") {
      let obj = {
        publishRateIDs: this.deleteIds.data,
        modifiedBy: this.userProfile.LoginID
      };
      this.airFreightService.deletePublishRate(obj).subscribe((res: any) => {
        if (res.returnStatus == "Success") {
          this.closeModal(res.returnStatus);
        }
      })
    }

    else if (this.deleteIds.type == "publishRateGround") {
      let obj = {
        publishedRateTransportType: this.deleteIds.data,
        modifiedBy: this.userProfile.LoginID,
        containerLoadType: 'FTL'
      };
      this.groundTransportService.deletePublishRate(obj).subscribe((res: any) => {
        if (res.returnStatus == "Success") {
          this.closeModal(res.returnStatus);
        }
      })
    }
    else if (this.deleteIds.type == "draftGroundRate") {
      this.groundTransportService.deleteNDiscardDraftRate(this.deleteIds.data).subscribe((res: any) => {
        if (res.returnStatus == "Success") {
          this.closeModal(res.returnStatus);
        }
      })
    }

    else if (this.deleteIds.type == "DelWarehouse") {
      this._warehouseService.delWarehouse(this.deleteIds.data, this.userProfile.LoginID).subscribe((res: any) => {
        if (res.returnStatus == "Success") {
          this.closeModal(res.returnStatus);
        }
      })
    }
    else if (this.deleteIds.type == "CancelWarehouse") {
          this.closeModal('close');
    }
    else if (this.deleteIds.type == "DelAccount") {
      this._settingService.deactivateAccount(this.deleteIds.data, this.deleteIds.data).subscribe((res: any) => {
        if (res.returnStatus == "Success") {
          this._toast.info(res.returnText, "");
        }
        else {
          this._toast.info(res.returnText, "");
        }
        this.closeModal(null);
      })
    }
  }
  closeModal(status) {
    this._activeModal.close(status);
    document.getElementsByTagName('html')[0].style.overflowY = 'auto';

  }
}
