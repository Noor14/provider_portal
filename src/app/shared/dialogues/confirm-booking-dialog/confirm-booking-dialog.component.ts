import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
// import { UserService } from '../../../components/user/user-service';
// import { HashStorage, CurrencyControl, generateContDetails, FillingMode } from '../../../constants/globalfunctions';
// import { BookingDetails } from '../../../interfaces/bookingDetails';
import { Router, ActivatedRoute } from "@angular/router";
import { PlatformLocation } from '@angular/common';
// import { DataService } from '../../../services/commonservice/data.service';

@Component({
  selector: 'app-confirm-booking-dialog',
  templateUrl: './confirm-booking-dialog.component.html',
  styleUrls: ['./confirm-booking-dialog.component.scss']
})
export class ConfirmBookingDialogComponent implements OnInit {

  isRouting: boolean;
  @Input() bookingId: number;
  constructor( 
    private _activeModal: NgbActiveModal,
    // private _userService: UserService,
    private _router: Router,
    private location: PlatformLocation,
    // private _dataService: DataService
  ) {
    location.onPopState(() => this.closeModal());
  }

  ngOnInit() {
  }
  onConfirmClick(){
    this.isRouting = true;
//  this._userService.continueBooking(this.bookingId).subscribe((res:any) => {
//       if (res.returnId > 0) {
//        this.isRouting = false;
//         let bookingInfo: BookingDetails = JSON.parse(res.returnText);
//         CurrencyControl.setCurrencyCode(bookingInfo.CurrencyCode)
//         CurrencyControl.setCurrencyID(bookingInfo.CurrencyID)
//         HashStorage.setItem('CURR_MASTER', JSON.stringify(CurrencyControl.getMasterCurrency()))
//         let searchCriteria: any = {
//           SearchCriteriaContainerDetail: generateContDetails(
//             bookingInfo,
//             FillingMode.BookingDetails_To_OrderSummary
//           ),
//           shippingSubCatID: bookingInfo.ShippingSubCatID,
//           shippingModeID: bookingInfo.ShippingModeID,
//           shippingCatID: bookingInfo.ShippingCatID,
//           containerLoad: bookingInfo.ContainerLoad,
//           pickupPortCode: bookingInfo.PolCode,
//           deliveryPortCode: bookingInfo.PodCode,
//           pickupDate: bookingInfo.EtdUtc,
//           bookingCategoryID: 0,
//           deliveryPortID: bookingInfo.PodID,
//           deliveryPortName: bookingInfo.PodName,
//           pickupFlexibleDays: 3,
//           pickupPortID: bookingInfo.PolID,
//           pickupPortName: bookingInfo.PolName,
//           InsuredGoodsPrice: bookingInfo.InsuredGoodsPrice,
//           InsuredGoodsCurrencyID: bookingInfo.InsuredGoodsCurrencyID,
//           InsuredGoodsCurrencyCode: bookingInfo.InsuredGoodsCurrencyCode,
//           InsuredGoodsProviderID: bookingInfo.InsuredGoodsProviderID,
//           SearchCriteriaTransportationDetail: [
//             {
//               modeOfTransportID: bookingInfo.ShippingModeID,
//               modeOfTransportCode: bookingInfo.ShippingModeCode,
//               modeOfTransportDesc: bookingInfo.ShippingModeName
//             }
//           ]
//         };
//         HashStorage.setItem("searchCriteria", JSON.stringify(searchCriteria));
//         HashStorage.setItem("bookingInfo", JSON.stringify(bookingInfo));
//         this._dataService.setBookingsData(bookingInfo);
//         this._router.navigate(["booking-process"]);
//         this. closeModal();
//       } else {
//        this.isRouting = false;
//       }
//     });
  }
  
  closeModal() {
    if (this.isRouting) {
      return
    }
    this._activeModal.close();
    document.getElementsByTagName('html')[0].style.overflowY = 'auto';
  }
}
