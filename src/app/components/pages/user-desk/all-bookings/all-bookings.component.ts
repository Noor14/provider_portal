import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedService } from '../../../../services/shared.service';

@Component({
  selector: 'app-all-bookings',
  templateUrl: './all-bookings.component.html',
  styleUrls: ['./all-bookings.component.scss']
})
export class AllBookingsComponent implements OnInit, OnDestroy  {

  public allBookingsSubscriber;
  public pastBookings:any[] =[];
  public currentBookings: any[] = [];
  public paginationConfig = {
     itemsPerPage: 5, currentPage: 1 
  }

  constructor(private _sharedService : SharedService) { }

  ngOnInit() {
    this.allBookingsSubscriber= this._sharedService.dashboardDetail.subscribe((state: any) => {
      if (state && state.BookingDetails && state.BookingDetails.length) {
        this.pastBookings = state.BookingDetails.filter(obj => obj.BookingTab === 'Past')
        this.currentBookings = state.BookingDetails.filter(obj => obj.BookingTab === 'Current')
      }
    });
  }
  ngOnDestroy(){
    this.allBookingsSubscriber.unsubscribe();
    }

  onPageChange(number){
    this.paginationConfig.currentPage = number;
    }

}
