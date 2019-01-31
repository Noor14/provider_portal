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

  getProviderBillingDashboard(providerId: number, period: string) {
    const url = `general/GetProviderBillingDashboard/${providerId}/${period}`;
    return this._http.get(baseApi + url);
  }

  getProviderBillingDashboardInvoices(providerId: number, period: string) {
    const url = `general/GetProviderBillingDashboardInvoices/${providerId}/${period}`;
    return this._http.get(baseApi + url);
  }
}
