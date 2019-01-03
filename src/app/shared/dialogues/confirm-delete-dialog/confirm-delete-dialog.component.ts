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
  constructor(
    private seaFreightService : SeaFreightService,
    private location: PlatformLocation,
    private _activeModal: NgbActiveModal
    ) { location.onPopState(() => this.closeModal(null)); }

  ngOnInit() {
  }
  delete(){
    this.seaFreightService.deleteNDiscardDraftRate(this.deleteIds).subscribe((res:any)=>{
      if(res.returnStatus == "Success"){
        this.closeModal(res.returnStatus);
      }
    })
  }
  closeModal(status) {
    this._activeModal.close(status);
    document.getElementsByTagName('html')[0].style.overflowY = 'auto';

  }
}
