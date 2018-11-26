import { Injectable } from '@angular/core';
import { baseApi } from '../../../../constants/base.url';
import { HttpClient, HttpParams } from "@angular/common/http";

@Injectable()
export class BasicInfoService {


  constructor(private _http: HttpClient) { }

  getAccountSetup(id) {
    let url: string = `usersprovider/AccountSetup/${id}`;
    return this._http.get(baseApi + url);
  }
  getjobTitles(id) {
    let url: string = `job/GetJobTitles/${id}`;
    return this._http.get(baseApi + url);
  }

  userRegistration(obj) {
    let url: string = "usersprovider/Post";
    return this._http.post(baseApi + url, obj);
  }

  getUserInfoByOtp(otpKey) {
    let url: string = `otp/GetOTPUser/${otpKey}`;
    return this._http.get(baseApi + url);
  }

  resendOtpCode(obj) {
    let url: string = "otp/ResendOTP";
    return this._http.post(baseApi + url, obj);
  }

  sendOtpCode(otpKey) {
    let url: string = "otp/Post";
    return this._http.post(baseApi + url, otpKey);
  }

  getUserOtpVerified(otpKey, status) {
    let url: string = `otp/GetVerifiedOTPUser/${otpKey}/${status}`;
    return this._http.get(baseApi + url);

  }
  createPaasword(obj) {
    let url: string = "usersprovider/CreatePassword";
    return this._http.post(baseApi + url, obj);
  }

  createProviderAccount(obj) {
    let url: string = "presales/Registration";
    return this._http.post(baseApi + url, obj);
  }


}
