import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedService } from '../../../../services/shared.service';
import { baseExternalAssets } from '../../../../constants/base.url';
import { Router } from '@angular/router';
import { encryptBookingID } from '../../../../constants/globalFunctions';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {

  public providerInfo;
  public dashboardSubscriber;
  public bookings;
  public baseExternalAssets :string = baseExternalAssets;
  public selectedBookingMode = 'CURRENT BOOKINGS';
  constructor(private _sharedService: SharedService, private _router: Router) { }

  ngOnInit() {
    this.dashboardSubscriber= this._sharedService.dashboardDetail.subscribe((state: any) => {
      if (state) {
         this.providerInfo = state;
         this.bookings = this.providerInfo.BookingDetails
      }
    });
  }
  ngOnDestroy(){
    this.dashboardSubscriber.unsubscribe();
    }
    viewBookingDetails(bookingId) {
      let id = encryptBookingID(bookingId);
      this._router.navigate(['/provider/booking-detail', id]);
  }
}
