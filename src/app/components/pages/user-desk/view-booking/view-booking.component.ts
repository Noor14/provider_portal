import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { ToastrService } from "ngx-toastr";
import { ActivatedRoute } from "@angular/router";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { loading, getImagePath, ImageSource, ImageRequiredSize, statusCode, EMAIL_REGEX, isJSON, } from "../../../../constants/globalFunctions";
import { FormControl, FormGroup, Validators } from '@angular/forms';
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
import { Lightbox } from 'ngx-lightbox';
import { WarehouseService } from '../manage-rates/warehouse-list/warehouse.service';
import { DashboardService } from '../dashboard/dashboard.service';
import { SharedService } from '../../../../services/shared.service';
declare var google: any;

@Component({
  selector: 'app-view-booking',
  templateUrl: './view-booking.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./view-booking.component.scss']
})
export class ViewBookingComponent implements OnInit, OnDestroy {
  public statusCode: any = statusCode;
  public zoomlevel: number = 2;
  public location: any = { lat: undefined, lng: undefined };
  public bookingDetails: BookingDetails;
  public wareHouse: any = {};
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
  private approvedStatus: any;

  // forms
  public AgentInfoFormOrigin: any;
  public AgentInfoFormDest: any;

  // togglers
  public editAgentorgToggler: boolean = false
  public editAgentDestToggler: boolean = false

  constructor(
    private _modalService: NgbModal,
    private _toast: ToastrService,
    private _viewBookingService: ViewBookingService,
    private _router: ActivatedRoute,
    private _commonService: CommonService,
    private _lightbox: Lightbox,
    private _warehouseService: WarehouseService,
    private _dashboardService: DashboardService,
    private _sharedService: SharedService
  ) { }

  ngOnInit() {
    let userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo && userInfo.returnText) {
      this.userProfile = JSON.parse(userInfo.returnText);
    }
    this.AgentInfoFormOrigin = new FormGroup({
      name: new FormControl(null, [Validators.required, Validators.pattern(/[a-zA-Z-][a-zA-Z -]*$/), Validators.minLength(2), Validators.maxLength(100)]),
      address: new FormControl(null, [Validators.required, Validators.maxLength(200), Validators.minLength(10), Validators.pattern(/^(?=.*?[a-zA-Z])[^%*$=+^<>}{]+$/)]),
      email: new FormControl(null, [
        Validators.required,
        Validators.pattern(EMAIL_REGEX),
        Validators.maxLength(320)
      ]),
      contact: new FormControl(null, [Validators.required, Validators.pattern(/^(?!(\d)\1+(?:\1+){0}$)\d+(\d+){0}$/), Validators.minLength(7), Validators.maxLength(13)]),
    });
    this.AgentInfoFormDest = new FormGroup({
      name: new FormControl(null, [Validators.required, Validators.pattern(/[a-zA-Z-][a-zA-Z -]*$/), Validators.minLength(2), Validators.maxLength(100)]),
      address: new FormControl(null, [Validators.required, Validators.maxLength(200), Validators.minLength(10), Validators.pattern(/^(?=.*?[a-zA-Z])[^%*$=+^<>}{]+$/)]),
      email: new FormControl(null, [
        Validators.required,
        Validators.pattern(EMAIL_REGEX),
        Validators.maxLength(320)
      ]),
      contact: new FormControl(null, [Validators.required, Validators.pattern(/^(?!(\d)\1+(?:\1+){0}$)\d+(\d+){0}$/), Validators.minLength(7), Validators.maxLength(13)]),
    });

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
  setAgentOrgInfo() {
    this.editAgentorgToggler = false;
    if (this.bookingDetails.JsonAgentOrgInfo.Name) {
      this.AgentInfoFormOrigin.controls['name'].setValue(this.bookingDetails.JsonAgentOrgInfo.Name);
    }
    if (this.bookingDetails.JsonAgentOrgInfo.Email) {
      this.AgentInfoFormOrigin.controls['email'].setValue(this.bookingDetails.JsonAgentOrgInfo.Email);
    }
    if (this.bookingDetails.JsonAgentOrgInfo.Address) {
      this.AgentInfoFormOrigin.controls['address'].setValue(this.bookingDetails.JsonAgentOrgInfo.Address);
    }
    if (this.bookingDetails.JsonAgentOrgInfo.PhoneNumber) {
      this.AgentInfoFormOrigin.controls['contact'].setValue(this.bookingDetails.JsonAgentOrgInfo.PhoneNumber);
    }

  }
  setAgentDestInfo() {
    this.editAgentDestToggler = false;
    if (this.bookingDetails.JsonAgentDestInfo.Name) {
      this.AgentInfoFormDest.controls['name'].setValue(this.bookingDetails.JsonAgentDestInfo.Name);
    }
    if (this.bookingDetails.JsonAgentDestInfo.Email) {
      this.AgentInfoFormDest.controls['email'].setValue(this.bookingDetails.JsonAgentDestInfo.Email);
    }
    if (this.bookingDetails.JsonAgentDestInfo.Address) {
      this.AgentInfoFormDest.controls['address'].setValue(this.bookingDetails.JsonAgentDestInfo.Address);
    }
    if (this.bookingDetails.JsonAgentDestInfo.PhoneNumber) {
      this.AgentInfoFormDest.controls['contact'].setValue(this.bookingDetails.JsonAgentDestInfo.PhoneNumber);
    }

  }
  updateAgentInfoOrig() {
    let obj = {
      BookingNature: (this.bookingDetails.ShippingModeCode == "WAREHOUSE") ? 'WH' : "SEA",
      BookingID: this.bookingDetails.BookingID,
      LoginUserID: this.userProfile.LoginID,
      PortNature: 'Origin',
      ContactInfoFor: 'Agent',
      BookingSupDistInfo: {
        BookingID: this.bookingDetails.BookingID,
        Name: this.AgentInfoFormOrigin.value.name,
        Address: this.AgentInfoFormOrigin.value.address,
        Email: this.AgentInfoFormOrigin.value.email,
        PhoneNumber: this.AgentInfoFormOrigin.value.contact,
        PhoneCountryCode: "+92",
        PhoneCountryID: "100",
        InfoFor: "Agent"
      }
    }
    this._viewBookingService.updateAgentInfo(obj).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        this._toast.success('Agent information is updated', '');
        this.editAgentorgToggler = true;
        if (res.returnText && isJSON(res.returnText)) {
          this.bookingDetails.JsonAgentOrgInfo = JSON.parse(res.returnText);
        }
      }
    })


  }

  updateAgentInfoDest() {
    let obj = {
      BookingNature: (this.bookingDetails.ShippingModeCode == "WAREHOUSE") ? 'WH' : "SEA",
      BookingID: this.bookingDetails.BookingID,
      LoginUserID: this.userProfile.LoginID,
      PortNature: 'Destination',
      ContactInfoFor: 'Agent',
      BookingSupDistInfo: {
        BookingID: this.bookingDetails.BookingID,
        Name: this.AgentInfoFormDest.value.name,
        Address: this.AgentInfoFormDest.value.address,
        Email: this.AgentInfoFormDest.value.email,
        PhoneNumber: this.AgentInfoFormDest.value.contact,
        PhoneCountryCode: "+92",
        PhoneCountryID: "100",
        InfoFor: "Agent"
      }
    }
    this._viewBookingService.updateAgentInfo(obj).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        this._toast.success('Agent information is updated', '');
        this.editAgentDestToggler = true;
        if (res.returnText && isJSON(res.returnText)) {
          this.bookingDetails.JsonAgentDestInfo = JSON.parse(res.returnText);
        }
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
        if (this.bookingDetails.JsonShippingDestInfo && isJSON(this.bookingDetails.JsonShippingDestInfo)) {
          this.bookingDetails.JsonShippingDestInfo = JSON.parse(this.bookingDetails.JsonShippingDestInfo)
        }
        if (this.bookingDetails.JsonShippingOrgInfo && isJSON(this.bookingDetails.JsonShippingOrgInfo)) {
          this.bookingDetails.JsonShippingOrgInfo = JSON.parse(this.bookingDetails.JsonShippingOrgInfo)
        }
        if (this.bookingDetails.JsonAgentOrgInfo && isJSON(this.bookingDetails.JsonAgentOrgInfo)) {
          this.bookingDetails.JsonAgentOrgInfo = JSON.parse(this.bookingDetails.JsonAgentOrgInfo);
          this.editAgentorgToggler = true;
        }
        if (this.bookingDetails.JsonAgentDestInfo && isJSON(this.bookingDetails.JsonAgentDestInfo)) {
          this.bookingDetails.JsonAgentDestInfo = JSON.parse(this.bookingDetails.JsonAgentDestInfo);
          this.editAgentDestToggler = true;
        }
        if (this.bookingDetails.BookingUserInfo.UserImage && this.bookingDetails.BookingUserInfo.UserImage != "[]" && isJSON(this.bookingDetails.BookingUserInfo.UserImage)) {
          this.bookingDetails.BookingUserInfo.UserImage = JSON.parse(this.bookingDetails.BookingUserInfo.UserImage)[0].DocumentFile;
        }
        if (this.bookingDetails.ShippingModeCode != 'WAREHOUSE'){
          this.bookingDetails.origin = this.bookingDetails.PolCode.split(' ')[0];
          this.bookingDetails.destination = this.bookingDetails.PodCode.split(' ')[0];
          this.bookingDocs();
          this.mapOrgiToDest.push(
            { lat: Number(this.bookingDetails.PolLatitude), lng: Number(this.bookingDetails.PolLongitude) },
            { lat: Number(this.bookingDetails.PodLatitude), lng: Number(this.bookingDetails.PodLongitude) });
        }
        else if (this.bookingDetails.ShippingModeCode == 'WAREHOUSE') {
          this.mapOrgiToDest.push(
            { lat: Number(this.bookingDetails.WHLatitude), lng: Number(this.bookingDetails.WHLongitude) });
          if (this.bookingDetails.WHCityName && this.bookingDetails.WHCountryName) {
            this.wareHouse.Location = this.bookingDetails.WHCityName + ', ' + this.bookingDetails.WHCountryName;
          }
          if (this.bookingDetails.WHMedia && this.bookingDetails.WHMedia != "[]" && isJSON(this.bookingDetails.WHMedia)) {
            this.bookingDetails.WHMedia = JSON.parse(this.bookingDetails.WHMedia);
            const albumArr = [];
            this.bookingDetails.WHMedia.forEach((elem) => {
              const album = {
                src: baseExternalAssets + elem.DocumentFile,
                // caption: elem.DocumentFileName,
                thumb: baseExternalAssets + elem.DocumentFile,
                DocumentUploadedFileType: elem.DocumentUploadedFileType
              };
              albumArr.push(album);
            })
            this.wareHouse.parsedGallery = albumArr;
          }
          if (this.bookingDetails.ActualScheduleDetail && isJSON(this.bookingDetails.ActualScheduleDetail)) {
            let facilities = JSON.parse(
              this.bookingDetails.ActualScheduleDetail
            ).WHFacilities;
            if (facilities && isJSON(facilities)) {
              this.wareHouse.FacilitiesProviding = JSON.parse(facilities);
            }
          }
          if (this.bookingDetails.BookingJsonDetail && this.bookingDetails.BookingJsonDetail != "[]" && isJSON(this.bookingDetails.BookingJsonDetail)) {
            let wareHouseDetail = JSON.parse(
              this.bookingDetails.BookingJsonDetail
            );
            this.wareHouse.WHName = wareHouseDetail.WHName;
            this.wareHouse.WHDesc = wareHouseDetail.WHDesc;
            this.wareHouse.TotalCoveredArea = wareHouseDetail.AvailableSQFT;
          }
          if (this.bookingDetails.JsonSearchCriteria && this.bookingDetails.JsonSearchCriteria != "[]" && isJSON(this.bookingDetails.JsonSearchCriteria)) {
            let JsonDetail = JSON.parse(
              this.bookingDetails.JsonSearchCriteria
            );

            this.wareHouse.storageType = JsonDetail.storageType;
            if (this.wareHouse.storageType == "shared") {
              this.wareHouse.StoreFrom = JsonDetail.StoreFrom;
              this.wareHouse.StoreUntill = JsonDetail.StoreUntill;
              if (JsonDetail.searchBy == "by_area") {
                this.wareHouse.TotalCoveredAreaUnit = "sqft";
                this.wareHouse.bookedArea = JsonDetail.SQFT;
              } else {
                this.wareHouse.TotalCoveredAreaUnit = "cbm";
                this.wareHouse.bookedArea = JsonDetail.CBM
              }
            } else {
              this.wareHouse.minimumLeaseTerm = JsonDetail.minimumLeaseTermString;
              this.wareHouse.spaceReqWarehouse = JsonDetail.spaceReqString
              this.wareHouse.TotalCoveredAreaUnit = "sqft";
            }
          }
        }
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
      createdBy: this.userProfile.LoginID,
      bookingData: this.bookingDetails
    }
    modalRef.result.then((result) => {
      if (result.resType == "Success") {
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
  openGallery(albumArr, index): void {
    this._lightbox.open(albumArr, index, { disableScrolling: true, centerVertically: true, alwaysShowNavOnTouchDevices: true });
  }
  closeLightBox(): void {
    this._lightbox.close();
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
    modalRef.result.then((res) => {
      if (res && res.resType && res.resType == "Success") {
        this.bookingDetails.BookingStatus = res.bookingStatus;
        this.bookingDetails.ShippingStatus = res.shippingStatus;
        this.getDashboardData(this.userProfile.UserID);
      }
    });
    modalRef.componentInstance.modalData = {
      type: type,
      bookingID: this.bookingDetails.BookingID,
      bookingStatus: this.bookingDetails.BookingStatus,
      loginID: this.userProfile.LoginID,
      providerID: this.userProfile.ProviderID,
      booking: this.bookingDetails
    }
  }
  getDashboardData(id) {
    this._dashboardService.getdashboardDetails(id).subscribe((res: any) => {
      if (res.returnStatus == 'Success') {
        this._sharedService.dashboardDetail.next(res.returnObject);
      }
    }, (err: HttpErrorResponse) => {
      console.log(err);
    })
  }
  approvedDoc(data) {
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
      approverIDType: "PROVIDER",
    }

    let toSend: any
    try {
      toSend = {
        ...obj,
        providerName: this.bookingDetails.ProviderName,
        userName: this.bookingDetails.UserName,
        hashMoveBookingNum: this.bookingDetails.HashMoveBookingNum,
        emailTo: (this.bookingDetails.BookingUserInfo && this.bookingDetails.BookingUserInfo.PrimaryEmail) ? this.bookingDetails.BookingUserInfo.PrimaryEmail : '',
        userCompanyName: (this.bookingDetails && this.bookingDetails.BookingUserInfo && this.bookingDetails.BookingUserInfo.CompanyName) ? this.bookingDetails.BookingUserInfo.CompanyName : '',
        userCountryPhoneCode: this.bookingDetails.UserCountryPhoneCodeID
      }
    } catch (error) {
      toSend = obj
    }

    this._viewBookingService.approvedDocx(toSend).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        data.DocumentLastStatus = this.approvedStatus[0].StatusName;
        this._toast.success('Document has been approved', '')
      }
    })
  }


  getdocStatus() {
    this._viewBookingService.getDocStatuses().subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        this.approvedStatus = res.returnObject.filter(elem => elem.BusinessLogic == "APPROVED");
      }
    })
  }

}
