import { Injectable } from '@angular/core';
import { baseApi } from '../../../constants/base.url';
import { HttpClient, HttpParams } from "@angular/common/http";

@Injectable()
export class UserService {

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



  revalidateToken(token, refreshToken) {
    let url = "token/GenerateRefreshAccessToken"
    let body = `token=${encodeURIComponent(token)}&refreshToken=${encodeURIComponent(refreshToken)}`
    return this._http.post(baseApi + url, body);
  }

  userLogin(data) {
    let url = "usersprovider/ValidateProvider"
    return this._http.post(baseApi + url, data);
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


}
