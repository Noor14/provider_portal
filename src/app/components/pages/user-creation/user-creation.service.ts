import { Injectable } from '@angular/core';
import { baseApi } from '../../../constants/base.url';
import { HttpClient, HttpParams } from "@angular/common/http";
import { getLoggedUserData } from '../../../constants/globalFunctions';
import { SharedService } from '../../../services/shared.service';

@Injectable()
export class UserCreationService {

  constructor(
    private _http: HttpClient,
    private _sharedService: SharedService,
  ) { }

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
  getUserProfileStatus(userID) {
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

  logoutAction() {

    let userInfo = JSON.parse(localStorage.getItem('userInfo'))
    let loginData = JSON.parse(userInfo.returnText);
    loginData.IsLogedOut = true
    localStorage.removeItem('userInfo')
    userInfo.returnText = JSON.stringify(loginData)
    localStorage.setItem('userInfo', JSON.stringify(userInfo))

    const data = {
      PrimaryEmail: loginData.PrimaryEmail,
      UserLoginID: loginData.UserLoginID,
      LogoutDate: new Date().toLocaleString(),
      LogoutRemarks: ""
    }

    this.userLogOut(data).subscribe(res => {
    })
  }



}


export interface JWTObj {
  token: string
  refreshToken: string
}
