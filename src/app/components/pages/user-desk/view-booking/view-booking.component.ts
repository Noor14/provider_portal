import { Component, OnInit, ViewEncapsulation, ViewChild, OnDestroy } from '@angular/core';
import { PlatformLocation } from '@angular/common';
import { ToastrService } from "ngx-toastr";
import { Router, ActivatedRoute } from "@angular/router";
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { loading, getImagePath, ImageSource, ImageRequiredSize, statusCode } from "../../../../constants/globalFunctions";
import { HttpErrorResponse } from '@angular/common/http';
import { BookingDetails } from '../../../../interfaces/bookingDetails';
import { CommonService } from '../../../../services/common.service';
import { ViewBookingService } from './view-booking.service';
import { BookingInvoiceComponent } from '../booking-invoice/booking-invoice.component';
import { ReUploadDocComponent } from '../../../../shared/dialogues/re-upload-doc/re-upload-doc.component';
import { IconSequence } from '@agm/core/services/google-maps-types';
import { baseExternalAssets } from '../../../../constants/base.url';
import { LatLngBounds } from '@agm/core';
import { BookingStatusUpdationComponent } from '../../../../shared/dialogues/booking-status-updation/booking-status-updation.component';
declare var google: any;

@Component({
  selector: 'app-view-booking',
  templateUrl: './view-booking.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./view-booking.component.scss']
})
export class ViewBookingComponent implements OnInit, OnDestroy {
  public statusCode:any = statusCode;
  public zoomlevel: number = 2;
  public location: any = { lat: undefined, lng: undefined };
  public bookingDetails: BookingDetails;
  public paramSubscriber: any;
  public HelpDataLoaded: boolean;
  // public ProviderEmails: any[];
  public helpSupport: any;
  public baseExternalAssets: string = baseExternalAssets;
  public certOrigin;
  public ladingBill;
  public invoiceDocOrigin;
  public invoiceDocDestination;
  public packingListDocOrigin;
  public packingListDocDestination;
  private userProfile;
  private bookingId;
  public mapOrgiToDest: any = [];
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
  public bookingReasons = [];
  public bookingStatuses = [];
  public selectedReason: any = {};
  private approvedStatus: any
  constructor(
    private _modalService: NgbModal,
    private _toast: ToastrService,
    private _viewBookingService: ViewBookingService,
    private _router: ActivatedRoute,
    private _commonService: CommonService,
  ) { }

  ngOnInit() {
    let userInfo = JSON.parse(localStorage.getItem('userInfo'));

    if (userInfo && userInfo.returnText) {
      this.userProfile = JSON.parse(userInfo.returnText);
    }
    this.paramSubscriber = this._router.params.subscribe(params => {
      this.bookingId = params['id'];
      // (+) converts string 'id' to a number
      if (this.bookingId) {
        this.getBookingDetail(this.bookingId);
        this.getdocStatus();
      }
    });

    this._commonService.getHelpSupport(true).subscribe((res: any) => {
      if (res.returnId > 0) {
        this.helpSupport = JSON.parse(res.returnText)
        this.HelpDataLoaded = true
      }
    })
  }

  mapInit(map) {
    const bounds: LatLngBounds = new google.maps.LatLngBounds();
    for (const mm of this.mapOrgiToDest) {
      bounds.extend(new google.maps.LatLng(mm.lat, mm.lng));
    }
    map.fitBounds(bounds);
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
        // this.bookingDetails.ProviderDisplayImage = baseExternalAssets + JSON.parse(this.bookingDetails.ProviderImage)[0].ProviderLogo;
        // this.ProviderEmails = this.bookingDetails.ProviderEmail.split(',');
        this.mapOrgiToDest.push(
          { lat: Number(this.bookingDetails.PolLatitude), lng: Number(this.bookingDetails.PolLongitude) },
          { lat: Number(this.bookingDetails.PodLatitude), lng: Number(this.bookingDetails.PodLongitude) });
        // this.mapInit();
        this.bookingDocs();
      } else {
        this._toast.error('Unable to find this booking. Please check the link and try again', 'Failed to Fetch Data')
      }
    }, (err: HttpErrorResponse) => {
      loading(false);
      console.log(err);
    })
  }

  bookingDocs() {
    this.bookingDetails.BookingDocumentDetail.forEach((obj) => {
      if (obj.DocumentNature == "CERTIFICATE") {
        this.certOrigin = obj;
      }
      else if (obj.DocumentNature == "CUSTOM_DOC") {
        this.ladingBill = obj;
      }
      else if (obj.DocumentNature == "CUSTOM_DOC") {
        this.ladingBill = obj;
      }
      else if (obj.DocumentNature == "INVOICE") {
        if (obj.DocumentSubProcess == "ORIGIN") {
          this.invoiceDocOrigin = obj;
        }
        else {
          this.invoiceDocDestination = obj;
        }
      }
      else if (obj.DocumentNature == "PACKING_LIST") {
        if (obj.DocumentSubProcess == "ORIGIN") {
          this.packingListDocOrigin = obj;
        }
        else {
          this.packingListDocDestination = obj;
        }
      }
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
  downloadDoc(object, event) {
    if (object && object.DocumentFileName && object.IsDownloadable) {
      if (object.DocumentFileName.startsWith("[{")) {
        let document = JSON.parse(object.DocumentFileName)
        window.open(baseExternalAssets + document[0].DocumentFile, '_blank');
      } else {
        window.open(baseExternalAssets + object.DocumentFileName, '_blank');
      }
    }
    else {
      event.preventDefault();
    }
  }

  reuploadDoc(data) {
    const modalRef = this._modalService.open(ReUploadDocComponent, {
      size: 'lg',
      centered: true,
      windowClass: 'medium-modal',
      backdrop: 'static',
      keyboard: false
    });
    let obj = {
      docTypeID: data.DocumentTypeID,
      docID: data.DocumentID,
      userID: this.userProfile.UserID,
      createdBy: this.userProfile.LoginID
    }
    modalRef.result.then((result) => {
        if (result.resType == "Success"){
           data.DocumentLastStatus = result.status;
      }
    });
    modalRef.componentInstance.documentObj = obj;

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

  openDialogue(type) {
    const modalRef = this._modalService.open(BookingStatusUpdationComponent, {
      size: 'lg',
      windowClass: 'medium-modal',
      centered: true,
      backdrop: 'static',
      keyboard: false
    }
    );
    modalRef.result.then((result) => {
      if (result.resType == "Success"){
        this.bookingDetails.BookingStatus = result.bookingStatus;
        this.bookingDetails.ShippingStatus = result.shippingStatus;
      }
    });
    modalRef.componentInstance.modalData = {
      type: type,
      bookingID: this.bookingDetails.BookingID,
      bookingStatus: this.bookingDetails.BookingStatus,
      loginID: this.userProfile.LoginID,
      providerID: this.userProfile.ProviderID
    }
  }

  approvedDoc(data){
    if (data.DocumentLastStatus.toLowerCase() == 'approved' || data.DocumentLastStatus.toLowerCase() == 're-upload') return;
    let obj = {
      documentStatusID: 0,
      documentStatusCode: '',
      documentStatus: this.approvedStatus[0].StatusName,
      documentStatusRemarks: "",
      documentLastApproverID: this.userProfile.ProviderID,
      documentID: data.DocumentID,
      createdBy: this.userProfile.LoginID,
      modifiedBy: "",
      approverIDType: "PROVIDER"
    }
    this._viewBookingService.approvedDocx(obj).subscribe((res: any)=>{
      if(res.returnStatus == "Success"){
        data.DocumentLastStatus = this.approvedStatus[0].StatusName;
        this._toast.success('Document has been approved', '')
      }
    })
  }


  getdocStatus(){
    this._viewBookingService.getDocStatuses().subscribe((res: any) => {
      if (res.returnStatus == "Success") {
         this.approvedStatus = res.returnObject.filter(elem => elem.BusinessLogic == "APPROVED");
      }
    })
  }

}
