import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'search'
})
export class SearchPipe implements PipeTransform {
    transform(data: any, sel: any): any {

    //check if search term is undefined
          return data;
  }
}
