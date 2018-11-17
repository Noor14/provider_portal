import { Component, OnInit } from '@angular/core';
import { PlatformLocation } from '@angular/common';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { ViewBookingService } from '../../../components/pages/user-desk/view-booking/view-booking.service';
@Component({
  selector: 'app-re-upload-doc',
  templateUrl: './re-upload-doc.component.html',
  styleUrls: ['./re-upload-doc.component.scss']
})
export class ReUploadDocComponent implements OnInit {

  public docsReasons: any[];
  constructor(
    private location: PlatformLocation,
    private _activeModal: NgbActiveModal,
    private _viewBookingService: ViewBookingService
  ) { location.onPopState(() => this.closeModal()); }

  ngOnInit() {
    this.getDocReason();
  }
  getDocReason(){
    this._viewBookingService.getDocReasons().subscribe((res:any)=>{
      if (res.returnStatus == "Success"){
        this.docsReasons = res.returnObject;
      }
    })
  }
  closeModal() {
    this._activeModal.close();
    document.getElementsByTagName('html')[0].style.overflowY = 'auto';

  }
}
