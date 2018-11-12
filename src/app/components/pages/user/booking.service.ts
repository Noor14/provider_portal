import { Injectable } from '@angular/core';
import { baseApi } from '../../../constants/base.url';
import { HttpClient, HttpParams } from "@angular/common/http";


@Injectable()
export class BookingService {

  constructor(private _http: HttpClient) { }

  getBookingDetails(bookingId) {
    let url = "booking/GetBookingSummary/" + bookingId;
    return this._http.get(baseApi + url);
  }
}
