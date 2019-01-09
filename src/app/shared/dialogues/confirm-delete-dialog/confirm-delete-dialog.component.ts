import { Component, OnInit, Input } from '@angular/core';
import { PlatformLocation } from '@angular/common';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { SeaFreightService } from '../../../components/pages/user-desk/manage-rates/sea-freight/sea-freight.service';

@Component({
  selector: 'app-confirm-delete-dialog',
  templateUrl: './confirm-delete-dialog.component.html',
  styleUrls: ['./confirm-delete-dialog.component.scss']
})
export class ConfirmDeleteDialogComponent implements OnInit {
  
  @Input() deleteIds: any;
  private userProfile: any
  constructor(
    private seaFreightService : SeaFreightService,
    private location: PlatformLocation,
    private _activeModal: NgbActiveModal
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
      let obj = {
        publishRateIDs: this.deleteIds.data,
        modifiedBy: this.userProfile.LoginID
      };
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

 

 
  }
  closeModal(status) {
    this._activeModal.close(status);
    document.getElementsByTagName('html')[0].style.overflowY = 'auto';

  }
}
