import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'search'
})
export class SearchPipe implements PipeTransform {
  transform(data: any, term: any): any {

    //check if search term is undefined
    if (!data) return null;
    if (!term) return data;

    return data.filter(function (item) {
      return JSON.stringify(item.WHName).toLowerCase().includes(term.replace(/\s+/g, ' ').toLowerCase());
    })

  }
}
