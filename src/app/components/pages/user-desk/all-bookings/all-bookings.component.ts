import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedService } from '../../../../services/shared.service';

@Component({
  selector: 'app-all-bookings',
  templateUrl: './all-bookings.component.html',
  styleUrls: ['./all-bookings.component.scss']
})
export class AllBookingsComponent implements OnInit, OnDestroy  {

  public providerInfo;
  public allBookingsSubscriber;
  public bookings;

  constructor(private _sharedService : SharedService) { }

  ngOnInit() {
    this.allBookingsSubscriber= this._sharedService.dashboardDetail.subscribe((state: any) => {
      if (state) {
         this.providerInfo = state;
         this.bookings = this.providerInfo.BookingDetails
      }
    });
  }
  ngOnDestroy(){
    this.allBookingsSubscriber.unsubscribe();
    }

}
