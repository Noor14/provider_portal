import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedService } from '../../../../services/shared.service';
import { baseExternalAssets } from '../../../../constants/base.url';
import { Router } from '@angular/router';
import { encryptBookingID, isJSON } from '../../../../constants/globalFunctions';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {

  public providerInfo;
  private dashboardSubscriber;
  public bookings;
  public baseExternalAssets: string = baseExternalAssets;
  public selectedBookingMode = 'CURRENT BOOKINGS';
  constructor(private _sharedService: SharedService, private _router: Router) { }

  ngOnInit() {
    this.dashboardSubscriber = this._sharedService.dashboardDetail.subscribe((state: any) => {
      if (state) {
        this.providerInfo = state;
        if (this.providerInfo.BookingDetails && this.providerInfo.BookingDetails.length){
          this.providerInfo.BookingDetails.map(elem =>{
            if (elem.CustomerImage && typeof elem.CustomerImage == "string" && elem.CustomerImage != "[]" && isJSON(elem.CustomerImage)) {
              elem.CustomerLogo = JSON.parse(elem.CustomerImage).shift().DocumentFile
            }
            else if (elem.UserImage) {
              elem.CustomerLogo = elem.UserImage;
            }
          })
          this.bookings = this.providerInfo.BookingDetails;
        }
      }
    });
  }
  ngOnDestroy() {
    this.dashboardSubscriber.unsubscribe();
  }
  viewBookingDetails(bookingId) {
    let id = encryptBookingID(bookingId);
    this._router.navigate(['/provider/booking-detail', id]);
  }

  viewAllBookings() {
    this._router.navigate(['/provider/allbookings']);
  }
}
