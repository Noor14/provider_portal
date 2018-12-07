import { Injectable } from '@angular/core';
import { baseApi } from '../../../constants/base.url';
import { HttpClient, HttpParams } from "@angular/common/http";

@Injectable()
export class UserCreationService {

  constructor(private _http: HttpClient) { }

  getlabelsDescription(page) {
    let url: string = `languagetranslate/LanguageDictionary/[En-US]/[Ar-AE]/${page}`;
    return this._http.get(baseApi + url);
  }

  getLatlng(country) {
    const params = new HttpParams()
      .set('address', country)
      .set('key', 'AIzaSyBs4tYXYGUA2kDvELgCYcbhYeoVgZCxumg');
    let url: string = `https://maps.googleapis.com/maps/api/geocode/json`;
    return this._http.get(url, { params });
  }


  userLogin(data) {
    let url = "usersprovider/ValidateProvider"
    return this._http.post(baseApi + url, data);
  }

  userLogOut(data) {
    let url = "users/UserLogout"
    return this._http.post(baseApi + url, data);
  }
  userforgetpassword(data) {
    let url = "usersprovider/ForgotPassword"
    return this._http.post(baseApi + url, data);
  }
  userupdatepassword(data) {
    let url = "usersprovider/UpdatePassword"
    return this._http.put(baseApi + url, data);
  }

  getJwtToken() {
    return localStorage.getItem('token');
  }

  saveJwtToken(token) {
    localStorage.setItem('token', token);
  }

  saveRefreshToken(refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  }

  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  }
  getUserProfileStatus(userID){
    let url = `usersprovider/GetUserProfileStatus/${userID}`;
    return this._http.get(baseApi + url)
  }


  revalidateToken(body) {
    let url = "token/ResetJWT"
    return this._http.post(baseApi + url, body);
  }

  guestLoginService(body) {
    // const url = 'token/CreateGuestJWT'
    const url = 'token/GuestLogin'
    return this._http.post(baseApi + url, body);
  }




}


export interface JWTObj {
  token: string
  refreshToken: string
}
