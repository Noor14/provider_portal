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
  deSelectService(obj){
    let url = "provider/DeleteProviderService";
    return this._http.request('delete', baseApi + url, { body: obj });
  }
  selectProviderService(obj) {
    let url = "provider/AddProviderService";
    return this._http.post(baseApi + url, obj);
  }
  deSelectAssociationService(obj) {
    let url = "provider/DeleteAssociation";
    return this._http.request('delete', baseApi + url, { body: obj });
  }
  selectAssociationService(obj) {
    let url = "provider/AddAssociation";
    return this._http.post(baseApi + url, obj);
  }

  changePassword(obj){
    let url = "users/ChangePassword ";
    return this._http.put(baseApi + url, obj);
  }
  deactivateAccount(obj){
    let url = "provider/DeactivateProvider";
    return this._http.put(baseApi + url, obj);
  }
}
