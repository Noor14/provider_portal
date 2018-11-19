import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { PlatformLocation } from '@angular/common';
import { ToastrService } from "ngx-toastr";
import { Router, ActivatedRoute } from "@angular/router";
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { loading, getImagePath, ImageSource, ImageRequiredSize, encryptBookingID } from "../../../../constants/globalFunctions";
import { HttpErrorResponse } from '@angular/common/http';
import { BookingDetails } from '../../../../interfaces/bookingDetails';
import { CommonService } from '../../../../services/common.service';
import { ViewBookingService } from './view-booking.service';
import { BookingInvoiceComponent } from '../booking-invoice/booking-invoice.component';
import { ReUploadDocComponent } from '../../../../shared/dialogues/re-upload-doc/re-upload-doc.component';
import { IconSequence } from '@agm/core/services/google-maps-types';
import { baseExternalAssets } from '../../../../constants/base.url';

@Component({
  selector: 'app-view-booking',
  templateUrl: './view-booking.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./view-booking.component.scss']
})
export class ViewBookingComponent implements OnInit {

  public zoomlevel: number = 2;
  public location: any = { lat: undefined, lng: undefined };
  public bookingDetails: BookingDetails;
  public paramSubscriber: any;
  public HelpDataLoaded: boolean;
  public ProviderEmails: any[];
  public helpSupport: any;
  public baseExternalAssets: string = baseExternalAssets;
  
  public icon = {
    url: "../../../../../assets/images/icons/Icons_Location_blue.svg",
    scaledSize: {
      width: 25,
      height: 25
    }
  }
  public polyOptions: IconSequence = {
    icon: {
      path: 'M 0,-1 0,1',
      strokeOpacity: 1,
      scale: 4
    },
    offset: '0',
    repeat: '20px'
  }
  constructor(
    private _modalService: NgbModal,
    private _toast: ToastrService,
    private _viewBookingService: ViewBookingService,
    private _router: ActivatedRoute,
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
        this.bookingDetails.origin = this.bookingDetails.PolCode.split(' ')[0];
        this.bookingDetails.destination = this.bookingDetails.PodCode.split(' ')[0];
        // this.bookingDetails.ProviderDisplayImage = getImagePath(ImageSource.FROM_SERVER, this.bookingDetails.ProviderImage[0].ProviderLogo, ImageRequiredSize._48x48)
        // this.bookingDetails.CarrierDisplayImage = getImagePath(ImageSource.FROM_SERVER, this.bookingDetails.CarrierImage, ImageRequiredSize._48x48)
        this.bookingDetails.ProviderDisplayImage = baseExternalAssets + JSON.parse(this.bookingDetails.ProviderImage)[0].ProviderLogo;
        // this.ProviderEmails = this.bookingDetails.ProviderEmail.split(',');

      } else {
        this._toast.error('Unable to find this booking. Please check the link and try again', 'Failed to Fetch Data')
      }
    }, (err: HttpErrorResponse) => {
      loading(false);
      console.log(err);
    })
  }


  viewInvoice() {
    const modalRef = this._modalService.open(BookingInvoiceComponent, {
      size: 'lg',
      centered: true,
      windowClass: 'small-modal',
      backdrop: 'static',
      keyboard: false
    });
    modalRef.componentInstance.BookingInvoiceDet = this.bookingDetails;
    setTimeout(() => {
      if (document.getElementsByTagName('body')[0].classList.contains('modal-open')) {
        document.getElementsByTagName('html')[0].style.overflowY = 'hidden';
      }
    }, 0);
  }
  reuploadDoc(){
    this._modalService.open(ReUploadDocComponent, {
      size: 'lg',
      centered: true,
      windowClass: 're-upload-modal',
      backdrop: 'static',
      keyboard: false
    });
    setTimeout(() => {
      if (document.getElementsByTagName('body')[0].classList.contains('modal-open')) {
        document.getElementsByTagName('html')[0].style.overflowY = 'hidden';
      }
    }, 0);
  }

  printDetail() {
    let doc = window as any;
    doc.print()
  }

}
