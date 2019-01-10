import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { SharedService } from '../../../../services/shared.service';

@Component({
  selector: 'app-all-bookings',
  templateUrl: './all-bookings.component.html',
  styleUrls: ['./all-bookings.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AllBookingsComponent implements OnInit, OnDestroy {

  public providerInfo;
  public allBookingsSubscriber;
  public bookings;

  constructor(private _sharedService: SharedService) { }

  ngOnInit() {
    this.allBookingsSubscriber = this._sharedService.dashboardDetail.subscribe((state: any) => {
      if (state) {
        this.providerInfo = state;
        this.bookings = this.providerInfo.BookingDetails
      }
    });
  }
  ngOnDestroy() {
    this.allBookingsSubscriber.unsubscribe();
  }

}
