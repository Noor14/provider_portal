import { Injectable } from '@angular/core';
import { baseApi } from '../../../constants/base.url';
import { HttpClient } from "@angular/common/http";

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


}
