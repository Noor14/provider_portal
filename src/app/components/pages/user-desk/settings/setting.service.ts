import { Injectable } from '@angular/core';
import { baseApi } from '../../../../constants/base.url';
import { HttpClient, HttpParams } from "@angular/common/http";

@Injectable()
export class SettingService {

  constructor(private _http: HttpClient) { }

  getSettingInfo(userId) {
    let url = `provider/GetSettings/${userId}`;
    return this._http.get(baseApi + url);
  }
  deactivateAccount(obj){
    let url = "provider/DeactivateProvider";
    return this._http.put(baseApi + url, obj);
  }
}
