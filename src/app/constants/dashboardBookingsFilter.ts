import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
    name: 'BookingMode'
})
export class SearchBookingMode implements PipeTransform {
    transform(data: any, sel: any): any {
        if (sel == "CURRENT BOOKINGS"){
          let bookings = data.filter(obj => obj.BookingTab === 'Current');
            return this.filterByDate(bookings);
      
        }
        else if (sel == "SAVED BOOKINGS"){
            let bookings = data.filter(obj => obj.BookingTab === 'Saved');
            return this.filterByDate(bookings)
        }
        else if (sel == "PAST BOOKINGS") {
            let bookings = data.filter(obj => obj.BookingTab === 'Past');
            return this.filterByDate(bookings)
        }
        else{
            return this.filterByDate(data)
        }
    }
    filterByDate(bookings){
        return bookings.sort(function compare(a, b) {
            let dateA: any = new Date(a.HashMoveBookingDate);
            let dateB: any = new Date(b.HashMoveBookingDate);
            return dateB - dateA;
        });
    }
}