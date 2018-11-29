import { Injectable } from '@angular/core';
import { baseApi } from '../../../../constants/base.url';
import { HttpClient, HttpParams } from "@angular/common/http";

@Injectable()
export class ViewBookingService {
  constructor(private _http: HttpClient) { }

  getBookingDetails(bookingId) {
    let url = `booking/GetBookingSummary/${bookingId}`;
    return this._http.get(baseApi + url);
  }
  getDocReasons() {
    let url = "/Document/GetDocumentReason";
    return this._http.get(baseApi + url);
  }
  uploadDocReason(obj){
    let url = "Document/AddReason";
    return this._http.post(baseApi + url ,obj);
  }
}
