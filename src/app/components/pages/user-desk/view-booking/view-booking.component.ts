import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { PlatformLocation } from '@angular/common';
import { ToastrService } from "ngx-toastr";
import { Router, ActivatedRoute } from "@angular/router";
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { loading, getImagePath, ImageSource, ImageRequiredSize, encryptBookingID } from "../../../../constants/globalFunctions";
import { HttpErrorResponse } from '@angular/common/http';
import { BookingDetails } from '../../../../interfaces/bookingDetails';
// import { OptionalBillingComponent } from '../../../shared/optional-billing/optional-billing.component';
// import { DataService } from '../../../services/commonservice/data.service';
import { CommonService } from '../../../../services/common.service';
import { ViewBookingService } from './view-booking.service';

@Component({
  selector: 'app-view-booking',
  templateUrl: './view-booking.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./view-booking.component.scss']
})
export class ViewBookingComponent implements OnInit {


  public bookingDetails: BookingDetails;
  public paramSubscriber: any;
  public HelpDataLoaded: boolean;
  public ProviderEmails: any[];
  public helpSupport; any;
  constructor(
    private _modalService: NgbModal,
    private _toast: ToastrService,
    private _viewBookingService: ViewBookingService,
    private _router: ActivatedRoute,
    // private _dataService: DataService,
    private _commonService: CommonService,
  ) { }

  ngOnInit() {
    this.paramSubscriber = this._router.params.subscribe(params => {
      let bookingId = params['id'];
       // (+) converts string 'id' to a number
      if (bookingId) {
        this.getBookingDetail(bookingId);
      }
    });

    this._commonService.getHelpSupport(true).subscribe((res: any) => {
      if (res.returnId > 0) {
        this.helpSupport = JSON.parse(res.returnText)
        this.HelpDataLoaded = true
      }
    })

  }
  ngOnDestroy() {
    this.paramSubscriber.unsubscribe();
  }
  getBookingDetail(bookingId) {
    loading(true);
    this._viewBookingService.getBookingDetails(bookingId).subscribe((res: any) => {
      loading(false);
      if (res.returnId > 0) {
        this.bookingDetails = JSON.parse(res.returnText);
        // console.log(this.bookingDetails, "agaya farha baji ka data")
        this.bookingDetails.ProviderDisplayImage = getImagePath(ImageSource.FROM_SERVER, this.bookingDetails.ProviderImage, ImageRequiredSize._48x48)
        this.bookingDetails.CarrierDisplayImage = getImagePath(ImageSource.FROM_SERVER, this.bookingDetails.CarrierImage, ImageRequiredSize._48x48)
        this.ProviderEmails = this.bookingDetails.ProviderEmail.split(',');

      } else {
        this._toast.error('Unable to find this booking. Please check the link and try again', 'Failed to Fetch Data')
      }
    }, (err: HttpErrorResponse) => {
      loading(false);
      console.log(err);
    })
  }


  viewInvoice() {
    // this._dataService.setBookingsData(this.bookingDetails);
    // const modalRef = this._modalService.open(OptionalBillingComponent, {
    //   size: 'lg',
    //   centered: true,
    //   windowClass: 'small-modal',
    //   backdrop: 'static',
    //   keyboard: false
    // });
    // modalRef.componentInstance.closeIcon = true;
    // setTimeout(() => {
    //   if (document.getElementsByTagName('body')[0].classList.contains('modal-open')) {
    //     document.getElementsByTagName('html')[0].style.overflowY = 'hidden';
    //   }
    // }, 0);
  }


  printDetail() {
    let doc = window as any;
    doc.print()
  }

}
