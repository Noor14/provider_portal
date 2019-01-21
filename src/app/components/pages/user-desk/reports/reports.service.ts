import { Injectable } from '@angular/core';
import { baseApi } from '../../../../constants/base.url';
import { HttpClient, HttpParams } from "@angular/common/http";

@Injectable()
export class ReportsService {

  constructor(private _http: HttpClient) { }

  getUserGraphData(userId: number, tag: string) {
    const url = `ProviderRevenue/GetGraphicalDashboard/${userId}/${tag}`
    return this._http.get(baseApi + url)
  }
}
