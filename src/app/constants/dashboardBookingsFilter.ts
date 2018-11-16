import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
    name: 'BookingMode'
})
export class SearchBookingMode implements PipeTransform {
    transform(data: any, sel: any): any {
        if (sel == "CURRENT BOOKINGS"){
            return sel ? data.filter(obj => obj.BookingTab === 'Current') : data;

        }
        else if (sel == "SAVED BOOKINGS"){
            return sel ? data.filter(obj => obj.BookingTab === 'Saved') : data;
        }
    }
}
