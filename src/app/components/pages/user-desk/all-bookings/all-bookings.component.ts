import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { SharedService } from '../../../../services/shared.service';
import { encryptBookingID } from '../../../../constants/globalFunctions';
import { Router } from '@angular/router';
import { PaginationInstance } from 'ngx-pagination';

@Component({
  selector: 'app-all-bookings',
  templateUrl: './all-bookings.component.html',
  styleUrls: ['./all-bookings.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AllBookingsComponent implements OnInit, OnDestroy {

  public allBookingsSubscriber;
  public pastBookings:any[] =[];
  public currentBookings: any[] = [];
  public totalBookings: any[] = [];
  public maxSize: number = 7;
  public directionLinks: boolean = true;
  public responsive: boolean = true;
  public autoHide: boolean = false;
  public paginationConfig: PaginationInstance = {
     itemsPerPage: 5, currentPage: 1 
  }

  constructor(
    private _sharedService: SharedService,
    private _router: Router
  ) { }

  ngOnInit() {
    this.allBookingsSubscriber= this._sharedService.dashboardDetail.subscribe((state: any) => {
      if (state && state.BookingDetails && state.BookingDetails.length) {
        this.pastBookings = state.BookingDetails.filter(obj => obj.BookingTab === 'Past');
        this.currentBookings = state.BookingDetails.filter(obj => obj.BookingTab === 'Current');
        this.totalBookings = state.BookingDetails;
      }
    });
  }
  ngOnDestroy() {
    this.allBookingsSubscriber.unsubscribe();
  }
  viewBookingDetails(bookingId) {
    let id = encryptBookingID(bookingId);
    this._router.navigate(['/provider/booking-detail', id]);
  }
  onPageChange(number){
    this.paginationConfig.currentPage = number;
    }

  onTabChange(){
    this.paginationConfig.currentPage = 1;
    
  }

}
