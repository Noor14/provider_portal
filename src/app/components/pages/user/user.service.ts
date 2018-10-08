import { Injectable } from '@angular/core';
import { baseApi } from '../../../constants/base.url';
import { HttpClient, HttpParams } from "@angular/common/http";

@Injectable()
export class UserService {

  constructor(private _http: HttpClient) { }

  getlabelsDescription(page){
    let url: string = `languagetranslate/LanguageDictionary/[En-US]/[Ar-AE]/${page}`;
    return this._http.get(baseApi + url);
  } 
  
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

  getUserInfoByOtp(otpKey){
    let url: string = `otp/GetOTPUser/${otpKey}`;
    return this._http.get(baseApi + url);
  }

  resendOtpCode(obj){
    let url: string = "otp/ResendOTP";
    return this._http.post(baseApi + url, obj);
  }

  sendOtpCode(otpKey){
    let url: string = "otp/Post";
    return this._http.post(baseApi + url, otpKey);
  }

  getUserOtpVerified(otpKey, status){
    let url: string = `otp/GetVerifiedOTPUser/${otpKey}/${status}`;
    return this._http.get(baseApi + url);
    
  }
  createPaasword(obj){
    let url: string = "usersprovider/CreatePassword";
    return this._http.post(baseApi + url, obj);
  }

  getLatlng(country){
    const params = new HttpParams()
    .set('address', country)
    .set('key', 'AIzaSyBs4tYXYGUA2kDvELgCYcbhYeoVgZCxumg');
    let url: string = `https://maps.googleapis.com/maps/api/geocode/json`;
    return this._http.get(url, {params});
  }

  getOrganizationType(){
    let url: string = "companytype/GetOrganizationType";
    return this._http.get(baseApi + url);
  }

  getDocByCountrytype(countryId){
    let url: string = `Document/GetDocumentTypebyCountry/${countryId}`;
    return this._http.get(baseApi + url);
  }

  socialList(){
    let url: string = "socialmedia/GetSocialMediaAccount";
    return this._http.get(baseApi + url);
  }


}
