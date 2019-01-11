import { Component, OnInit, Input } from '@angular/core';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ViewBookingService } from '../view-booking/view-booking.service';
import { Reasons } from '../../../../interfaces/reasons';
import { HttpErrorResponse } from '@angular/common/http';
import { loading } from '../../../../constants/globalFunctions';
import { ToastrService } from "ngx-toastr";

@Component({
  selector: 'app-booking-dialog',
  templateUrl: './booking-dialog.component.html',
  styleUrls: ['./booking-dialog.component.scss']
})
export class BookingDialogComponent implements OnInit {
  @Input() modalData: any;
  public label: string;
  public description: string;
  public bookingReasons = [];
  public bookingStatuses = [];
  public actionObj: Reasons;
  public cancelledStatus: any;
  public selectPlaceholder: string;
  public selectedReason: any = {
    remarks: '',
    status: '',
    id: ''
  };

  constructor(
    private modalService: NgbModal,
    private _viewBookingService: ViewBookingService,
    private _toast: ToastrService,
    public _activeModal: NgbActiveModal) { }

  ngOnInit() {
    console.log(this.modalData.bookingDetails[0]);
    this.getBookingStatuses()
    this.getBookingReasons()
    if (this.modalData.type === 'cancel') {
      this.label = 'Cancel Booking'
      this.description = 'Please provide the reason of cancellation.'
      this.selectPlaceholder = 'Select Reason'
    } else if (this.modalData.type === 'updated') {
      this.label = 'Update Status'
      this.description = "Where's the Shipment?"
      this.selectPlaceholder = 'Select Status'
    }
  }

  getBookingReasons() {
    this._viewBookingService.getBookingReasons().subscribe((res: any) => {
      if (res.returnId > 0) {
        this.bookingReasons = res.returnObject
      }
    }, (err: HttpErrorResponse) => {
      console.log(err);
    })
  }

  getBookingStatuses() {
    this._viewBookingService.getBookingStatuses().subscribe((res: any) => {
      if (res.returnId > 0) {
        this.bookingStatuses = res.returnObject.filter(e => e.BusinessLogic.toLowerCase() !== 'cancelled')
        this.cancelledStatus = res.returnObject.filter(e => e.BusinessLogic.toLowerCase() === 'cancelled')
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
      const { id, remarks } = this.selectedReason;
      if (id && remarks) {
        this.actionObj = {
          bookingID: this.modalData.bookingDetails.BookingID,
          bookingStatus: this.cancelledStatus[0].StatusName,
          bookingStatusRemarks: remarks,
          createdBy: this.modalData.userProfile.PrimaryEmail,
          modifiedBy: "",
          approverID: this.modalData.bookingDetails.ProviderID,
          approverType: 'PROVIDER',
          reasonID: id
        }
        this._viewBookingService.cancelBooking(this.actionObj).subscribe((res: any) => {
          this._toast.success(res.returnText, 'Success')
          this._activeModal.close()
        }, (err: HttpErrorResponse) => {
          console.log(err);
        })
      }
    } else if (this.modalData.type === 'updated') {
      const { status, id } = this.selectedReason;
      if (status && id) {
        this.actionObj = {
          bookingID: this.modalData.bookingDetails.BookingID,
          bookingStatus: status,
          bookingStatusRemarks: "",
          createdBy: this.modalData.userProfile.PrimaryEmail,
          modifiedBy: "",
          approverID: this.modalData.bookingDetails.ProviderID,
          approverType: 'PROVIDER',
          reasonID: id
        }
        this._viewBookingService.updateBookingStatus(this.actionObj).subscribe((res: any) => {
          this._toast.success(res.returnText, 'Success')
          this._activeModal.close()
        }, (err: HttpErrorResponse) => {
          console.log(err);
        })
      }
    }
  }
}
