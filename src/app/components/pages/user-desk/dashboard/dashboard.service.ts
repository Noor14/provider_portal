import { Injectable } from '@angular/core';
import { baseApi } from '../../../../constants/base.url';
import { HttpClient, HttpParams } from "@angular/common/http";

@Injectable()
export class DashboardService {

  constructor(private _http: HttpClient) { }
  getdashboardDetails(userId) {
    let url = `usersprovider/GetProviderDashboardDetail/${userId}`;
    return this._http.get(baseApi + url);
  }
}
