import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
    name: 'BookingMode'
})
export class SearchBookingMode implements PipeTransform {
    transform(data: any, sel: any): any {
        return sel ? data.filter(sal => sal.position === sel) : data;
    }
}
