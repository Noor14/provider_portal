import { Injectable } from '@angular/core';
import { baseApi } from '../../../../constants/base.url';
import { HttpClient, HttpParams } from "@angular/common/http";

@Injectable()
export class ViewBookingService {
  constructor(private _http: HttpClient) { }

  getBookingDetails(bookingId) {
    let url = `booking/GetProviderBookingSummary/${bookingId}`;
    return this._http.get(baseApi + url);
  }
  getDocReasons() {
    let url = "Document/GetDocumentReason";
    return this._http.get(baseApi + url);
  }
  getDocStatuses() {
    let url = "Status/GetDocumentStatus";
    return this._http.get(baseApi + url);
  }
  
  getBookingReasons() {
    let url = "booking/GetBookingReason";
    return this._http.get(baseApi + url);
  }

  getBookingStatuses() {
    let url = "Status/GetBookingStatus";
    return this._http.get(baseApi + url);
  }

  updateBookingStatus(data) {
    let url = "booking/AddBookingStatus";
    return this._http.post(baseApi + url, data);
  }

  cancelBooking(data) {
    let url = "booking/CancelBooking";
    return this._http.put(baseApi + url, data);
  }

  uploadDocReason(obj) {
    let url = "Document/AddReason";
    return this._http.post(baseApi + url, obj);
  }


  approvedDocx(data){
    let url = "Document/AddDocumentStatus";
    return this._http.post(baseApi + url, data);
    
  }
}
