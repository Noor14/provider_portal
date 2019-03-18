import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'filterByCheckbox'
})
export class CheckboxPipe implements PipeTransform {
  transform(data: any, param1: any , param2): any {

    //check if search term is undefined
    if (!data) return null;
    else if ((param1 && param2) || (!param1 && !param2)) return data;
    else if(!param1 && param2){
      return data.filter(function (item) {
        return !item.IsBlocked == param1;
      })
    }
    else if(!param2 && param1){
      return data.filter(function (item) {
        return item.IsBlocked == param2;
      })
    }

  }
}
