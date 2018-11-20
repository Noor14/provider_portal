import { Component, OnInit, Input } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PlatformLocation } from '@angular/common';

@Component({
  selector: 'app-booking-invoice',
  templateUrl: './booking-invoice.component.html',
  styleUrls: ['./booking-invoice.component.scss']
})
export class BookingInvoiceComponent implements OnInit {
  @Input() BookingInvoiceDet: any;
  constructor(
    private _activeModal: NgbActiveModal,
    private location: PlatformLocation ) {
    location.onPopState(() => this.closeModal());
   }
  public billingData;
  public freightData;
  public additionalData;
  public currencyCode;
  public totalAmount : number = 0;
  ngOnInit() {
    if (this.BookingInvoiceDet){
      this.currencyCode = this.BookingInvoiceDet.CurrencyCode;
      const readArray = this.BookingInvoiceDet.BookingPriceDetail.filter((e) => e.TransMode === 'Read');
      this.billingData = readArray;
      this.freightData = this.billingData.filter((element: any) => element.SurchargeType === 'FSUR');
      this.additionalData = this.billingData.filter((element: any) => element.SurchargeType === 'ADCH');
      this.freightData.forEach(element => {
        this.totalAmount += element.TotalAmount;
      });
      this.additionalData.forEach(element => {
        this.totalAmount += element.TotalAmount;
      });
    }
    // this._dataService.currentBokkingDataData.subscribe((res) => {
    //   if (res !== null) {
    //     this.bookingInfo = res;
    //     // console.log(res);

    //     this.showVasSection = false;
    //     this.total = [];
    //     this.vasData = [];
    //     const readArray = this.bookingInfo.BookingPriceDetail.filter((e) => e.TransMode === 'Read');
    //     this.billingData = readArray

    //     let vas = this.bookingInfo.BookingPriceDetail.filter((element: any) => element.SurchargeType === 'VASV');

    //     // check if its Coming from continue booking
    //     if (this.bookingInfo.BookingID !== -1) {
    //       this.vasData = vas.filter((element: any) => element.TransMode === 'Write')
    //       this.vasData.forEach((e) => {
    //         if (e.SurchargeCode !== 'INSR' && !e.hasOwnProperty('IsChecked')) {
    //           e.IsChecked = true;
    //         }
    //       });
    //     } else {
    //       this.vasData = vas.filter((element: any) => element.TransMode === 'Write')
    //     }

    //     // this.vasData = this.bookingInfo.BookingPriceDetail.filter((element: any) => element.SurchargeType === 'VASV');

    //     this.insrData = this.vasData.filter((element: any) => element.SurchargeCode === 'INSR');
    //     this.vasData = this.vasData.filter((element: any) => element.IsChecked);

    //     this.vasData = this.vasData.concat(this.insrData);
    //     if (this.vasData.length > 0 || this.insrData.length)
    //       this.showVasSection = true;

    //     this.freightData = this.billingData.filter((element: any) => element.SurchargeType === 'FSUR');
    //     this.additionalData = this.billingData.filter((element: any) => element.SurchargeType === 'ADCH');

    //     this.currencyCode = CurrencyControl.getCurrencyCode();

    //     this.combinedAddedArray = this.freightData.concat(this.additionalData, this.vasData);


    //     this.combinedAddedArray.forEach(element => {
    //       this.total.push(element.TotalAmount);
    //     });

    //     this.subTotal = this.total.reduce((all, item) => {
    //       return all + item;
    //     });
    //   }
    // });

    // if (this.bookingInfo.DiscountPrice) {
    //   this.discountedPrice = this.bookingInfo.DiscountPrice;
    //   this.discountedPercent = this.bookingInfo.DiscountPercent
    // }
  }

  closeModal() {
    this._activeModal.close();
    document.getElementsByTagName('html')[0].style.overflowY = 'auto';

  }
}
