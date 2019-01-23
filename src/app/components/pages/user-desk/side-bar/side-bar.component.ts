import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from '../../../../services/shared.service';


@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./side-bar.component.scss']
})
export class SideBarComponent implements OnInit {

  private allBookingsSubscriber;
  public currentBookings: any[] = [];
  
  constructor(
    private _router: Router,
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
  getClass(path): string {
     if(location.pathname.indexOf(path) >= 0){
       return 'active'
    }
  };
  tonavigate(url) {
    this._router.navigate([url]);
  }
}
