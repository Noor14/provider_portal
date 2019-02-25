import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { SharedService } from '../../../../services/shared.service';
import { encryptBookingID, isJSON } from '../../../../constants/globalFunctions';
import { baseExternalAssets } from '../../../../constants/base.url';
import { Router } from '@angular/router';
import { PaginationInstance } from 'ngx-pagination';

@Component({
  selector: 'app-all-bookings',
  templateUrl: './all-bookings.component.html',
  styleUrls: ['./all-bookings.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AllBookingsComponent implements OnInit, OnDestroy {

  private allBookingsSubscriber;
  public pastBookings:any[] =[];
  public currentBookings: any[] = [];
  public totalBookings: any[] = [];
  public maximumSize: number = 10;
  public directionLinks: boolean = true;
  public responsive: boolean = true;
  public autoHide: boolean = false;
  public baseExternalAssets: string = baseExternalAssets;
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
        state.BookingDetails.map(elem => {
            if (elem.CustomerImage && typeof elem.CustomerImage == "string" && isJSON(elem.CustomerImage)) {
              elem.CustomerLogo = JSON.parse(elem.CustomerImage).shift().DocumentFile
            }
          })
        let pastBookings = state.BookingDetails.filter(obj => obj.BookingTab === 'Past');
        this.pastBookings = this.filterByDate(pastBookings);
        let currentBookings = state.BookingDetails.filter(obj => obj.BookingTab === 'Current');
        this.currentBookings = this.filterByDate(currentBookings);
        let totalBookings = state.BookingDetails;
        this.totalBookings = this.filterByDate(totalBookings);
      }
    });
  }
  ngOnDestroy() {
    this.allBookingsSubscriber.unsubscribe();
  }
  filterByDate(bookings) {
    return bookings.sort(function (a, b) {
      let dateA: any = new Date(a.HashMoveBookingDate);
      let dateB: any = new Date(b.HashMoveBookingDate);
      return dateB - dateA;
    });
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
