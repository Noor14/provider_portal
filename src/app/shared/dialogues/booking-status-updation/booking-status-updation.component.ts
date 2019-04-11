import { Component, OnInit, Input } from '@angular/core';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ViewBookingService } from '../../../components/pages/user-desk/view-booking/view-booking.service';
import { Reasons } from '../../../interfaces/reasons';
import { HttpErrorResponse } from '@angular/common/http';
import { loading } from '../../../constants/globalFunctions';
import { ToastrService } from "ngx-toastr";
import { PlatformLocation } from '@angular/common';

@Component({
  selector: 'app-booking-status-updation',
  templateUrl: './booking-status-updation.component.html',
  styleUrls: ['./booking-status-updation.component.scss']
})
export class BookingStatusUpdationComponent implements OnInit {
  @Input() modalData: any;
  public label: string;
  public description: string;
  public bookingReasons = [];
  public bookingStatuses = [];
  public actionObj: Reasons;
  public cancelledStatus: any;
  public selectPlaceholder: string;
  public selectedReason = {
    remarks: '',
    status: '',
    id: 0
  };

  constructor(
    private modalService: NgbModal,
    private _viewBookingService: ViewBookingService,
    private _toast: ToastrService,
    private location: PlatformLocation,
    public _activeModal: NgbActiveModal) { location.onPopState(() => this.closeModal(null)); }

  ngOnInit() {
    if (this.modalData.type === 'cancel') {
      this.label = 'Cancel Booking'
      this.description = 'Please provide the reason of cancellation.'
      this.selectPlaceholder = 'Select Reason';
      this.getBookingReasons();
    } else if (this.modalData.type === 'updated') {
      this.label = 'Update Status'
      this.description = "Where's the Shipment?"
      this.selectPlaceholder = 'Select Status';
      this.getBookingStatuses();
    }
  }



  getBookingReasons() {
    this._viewBookingService.getBookingReasons().subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        this.bookingReasons = res.returnObject
      }
    }, (err: HttpErrorResponse) => {
      console.log(err);
    })
  }

  getBookingStatuses() {
    this._viewBookingService.getBookingStatuses().subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        let data = res.returnObject.filter(e => e.BusinessLogic.toLowerCase() !== 'cancelled' && e.BusinessLogic.toLowerCase() !== 'draft');
        this.bookingStatuses = data.filter(e => e.BusinessLogic.toLowerCase() !== this.modalData.bookingStatus.toLowerCase())
      }
    }, (err: HttpErrorResponse) => {
      loading(false);
      console.log(err);
    })
  }

  onModelChange(model) {
    if (model.id) {
      this.selectedReason.id = parseInt(model.id)
      if (this.modalData.type === 'updated') {
        const status = this.bookingStatuses.find(s => s.StatusID == this.selectedReason.id);
        this.selectedReason.status = status.StatusName
      }
    }
  }

  submit() {
    if (this.modalData.type === 'cancel') {
      const { id, remarks, status } = this.selectedReason;
      if (id && remarks) {
        this.actionObj = {
          bookingID: this.modalData.bookingID,
          bookingStatus: "CANCELLED",
          bookingStatusRemarks: remarks,
          createdBy: this.modalData.loginID,
          modifiedBy: this.modalData.loginID,
          approverID: this.modalData.providerID,
          approverType: 'PROVIDER',
          reasonID: id,
          reasonText: status,
          providerName: this.modalData.booking.ProviderName,
          emailTo: (this.modalData.booking && this.modalData.booking.BookingUserInfo && this.modalData.booking.BookingUserInfo.PrimaryEmail) ? this.modalData.booking.BookingUserInfo.PrimaryEmail : '',
          userName: this.modalData.booking.UserName,
          hashMoveBookingNum: this.modalData.booking.HashMoveBookingNum,
        }
        this._viewBookingService.cancelBooking(this.actionObj).subscribe((res: any) => {
          if (res.returnStatus == "Success") {
            this._toast.success(res.returnText, 'Success');
            let obj = {
              bookingStatus: res.returnObject.bookingStatus,
              shippingStatus: res.returnObject.shippingStatus,
              resType: res.returnStatus
            }
            this.closeModal(obj);
          }
        }, (err: HttpErrorResponse) => {
          console.log(err);
        })
      }
    } else if (this.modalData.type === 'updated') {
      const { status, id } = this.selectedReason;
      if (status && id) {
        this.actionObj = {
          bookingID: this.modalData.bookingID,
          bookingStatus: status,
          bookingStatusRemarks: "",
          createdBy: this.modalData.loginID,
          modifiedBy: this.modalData.loginID,
          approverID: this.modalData.providerID,
          approverType: 'PROVIDER',
          reasonID: id,
          reasonText: status,
          providerName: this.modalData.booking.ProviderName,
          emailTo: (this.modalData.booking && this.modalData.booking.BookingUserInfo && this.modalData.booking.BookingUserInfo.PrimaryEmail) ? this.modalData.booking.BookingUserInfo.PrimaryEmail : '',
          userName: this.modalData.booking.UserName,
          hashMoveBookingNum: this.modalData.booking.HashMoveBookingNum,
        }
        this._viewBookingService.updateBookingStatus(this.actionObj).subscribe((res: any) => {
          if (res.returnStatus == "Success") {
            this._toast.success(res.returnText, 'Success');
            let obj = {
              bookingStatus: res.returnObject.bookingStatus,
              shippingStatus: res.returnObject.shippingStatus,
              resType: res.returnStatus,
            }
            this.closeModal(obj);
          }
        }, (err: HttpErrorResponse) => {
          console.log(err);
        })
      }
    }
  }
  closeModal(resType) {
    this._activeModal.close(resType);
    document.getElementsByTagName('html')[0].style.overflowY = 'auto';

  }


}
