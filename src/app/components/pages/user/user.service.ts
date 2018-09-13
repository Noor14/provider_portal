import { Injectable } from '@angular/core';
import { baseApi } from '../../../constants/base.url';
import { HttpClient, HttpParams } from "@angular/common/http";

@Injectable()
export class UserService {

  constructor(private _http: HttpClient) { }
  getAccountSetup(id) {
    let url: string = `usersprovider/AccountSetup/${id}`;
    return this._http.get(baseApi + url);
  }
  getServiceOffered() {
    let url: string = "usersprovider/ServiceOffered";
    return this._http.get(baseApi + url);
  }

  userRegistration(obj) {
    let url: string = "usersprovider/Post";
    return this._http.post(baseApi + url, obj);
  }

  resendOtpCode(otpKey){
    let url: string = `otp/ResendOTP/${otpKey}`;
    return this._http.get(baseApi + url);
  }

  sendOtpCode(otpKey){
    let url: string = "otp/Post";
    return this._http.post(baseApi + url, otpKey);
  }

  getLatlng(country){
    const params = new HttpParams()
    .set('address', country)
    .set('key', 'AIzaSyBs4tYXYGUA2kDvELgCYcbhYeoVgZCxumg');
    let url: string = `https://maps.googleapis.com/maps/api/geocode/json`;
    
    return this._http.get(url, {params});
  }

}
