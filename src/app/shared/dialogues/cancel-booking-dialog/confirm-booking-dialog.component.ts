import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
// import { DataService } from '../../../services/commonservice/data.service';
// import { CancelDialogContent } from '../../../interfaces/cancel-dialog';
// import { UserService } from '../../../components/user/user-service';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { PlatformLocation } from '@angular/common';

@Component({
  selector: 'app-confirm-cancel-dialog',
  templateUrl: './confirm-booking-dialog.component.html',
  styleUrls: ['./confirm-booking-dialog.component.scss']
})
export class CancelBookingDialogComponent implements OnInit {

  // messageData: CancelDialogContent = {
  //   messageTitle: 'Cancel Booking',
  //   messageContent: 'Are you sure you want to cancel your Booking?',
  //   openedFrom: 'cancel-booking',
  //   data: '',
  //   buttonTitle: 'Yes'
  // }

  resp: any

  isRouting: boolean = false


  constructor(
    private _router: Router,
    private _activeModal: NgbActiveModal,
    // private _dataService: DataService,
    private toastr: ToastrService,
    // private _booking: UserService,
    private location: PlatformLocation
  ) {
    location.onPopState(() => this.closeModal());
  }

  ngOnInit() {
    // this.messageData = this._dataService.cancelBookingMsg
    this.isRouting = false
  }

  closeModal() {
    if (this.isRouting) {
      return
    }
    this._activeModal.close();
    document.getElementsByTagName('html')[0].style.overflowY = 'auto';
  }

  onConfirmClick() {
    // if (this.messageData.openedFrom === 'booking-process') {
    //   this.cancelBookingAction()
    // } else if (this.messageData.openedFrom === '/user/dashboard') {
    //   this.discardBookingAction()
    //   // this._activeModal.close()
    //   document.getElementsByTagName('html')[0].style.overflowY = 'auto';
    // } else {
    //   this._activeModal.close()
    //   document.getElementsByTagName('html')[0].style.overflowY = 'auto';
    // }
  }

  cancelBookingAction() {
    this.isRouting = true
    this._router.navigate(['fcl-search/forwarders']).then(() => {
      this._activeModal.close()
      document.getElementsByTagName('html')[0].style.overflowY = 'auto';
      this.isRouting = false
    })
  }

  discardBookingAction() {
    // this.isRouting = true
    // this._booking.discardBooking(this.messageData.data).subscribe(res => {
    //   this.resp = res
    //   if (this.resp.returnId > 0) {
    //     this.toastr.success(this.resp.returnText, this.resp.returnStatus)
    //     this._dataService.reloadBoard.next(true)
    //   } else {
    //     this.toastr.warning(this.resp.returnText, this.resp.returnStatus)
    //   }
    //   this.isRouting = true
    //   this._activeModal.close(true);
    //   document.getElementsByTagName('html')[0].style.overflowY = 'auto';
    // }, (err: HttpErrorResponse) => {
    //   console.log(err);
    //   this.toastr.error('Request Failed', 'Failed')

    //   this.isRouting = false
    //   this._activeModal.close()
    //   document.getElementsByTagName('html')[0].style.overflowY = 'auto';
    // })
  }
}


