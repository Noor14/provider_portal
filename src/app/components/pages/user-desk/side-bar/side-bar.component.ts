import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { SharedService } from '../../../../services/shared.service';


@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./side-bar.component.scss']
})
export class SideBarComponent implements OnInit, OnDestroy {

  private allBookingsSubscriber;
  public currentBookings: any[] = [];
  
  constructor(
    private _sharedService: SharedService
  ) { }

  ngOnInit() {
    this.allBookingsSubscriber = this._sharedService.dashboardDetail.subscribe((state: any) => {
      if (state && state.BookingDetails && state.BookingDetails.length) {
        this.currentBookings = state.BookingDetails.filter(obj => obj.BookingTab === 'Current');
      }
    });
  }
  ngOnDestroy() {
    this.allBookingsSubscriber.unsubscribe();
  }

}
