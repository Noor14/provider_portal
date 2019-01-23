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

  getUserOtpVerified(key) {
    // let url: string = `otp/GetVerifiedOTPUser/${otpKey}/${status}`;
    let url: string = `providerregistration/GetVerifiedUser/${key}`;
    return this._http.get(baseApi + url);

  }
  createPaasword(obj) {
    let url: string = "usersprovider/CreatePassword";
    return this._http.post(baseApi + url, obj);
  }
  createProviderAccount(obj) {
    let url: string = "ProviderRegistration/Register";
    return this._http.post(baseApi + url, obj);
  }
  getServiceOffered() {
    let url: string = "ProviderRegistration/GetLogisticServices";
    return this._http.get(baseApi + url);
  }
  socialList() {
    let url: string = "socialmedia/GetSocialMediaAccount";
    return this._http.get(baseApi + url);
  }
  docUpload(doc) {
    let url: string = "document/Post";
    return this._http.post(baseApi + url, doc);
  }
  removeDoc(id) {
    let  url:  string  =  "document/Put";
    return  this._http.put(baseApi  +  url,  id);
  } 
  getbusinessServices(providerID){
    let url: string = `providerregistration/GetLogisticServicesByProvider/${providerID}`;
    return this._http.get(baseApi + url);
  }
  addBusinessInfo(obj){
    let url: string = "providerregistration/SetupBusinessProfile";
    return this._http.post(baseApi + url, obj);
  }

}
