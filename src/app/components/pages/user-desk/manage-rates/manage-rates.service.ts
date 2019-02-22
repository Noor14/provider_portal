import { Injectable } from '@angular/core';
import { baseApi } from '../../../../constants/base.url';
import { HttpClient, HttpParams } from "@angular/common/http";

@Injectable()
export class ManageRatesService {

  constructor(private _http: HttpClient) { }

  termNCondition(obj) {
    let url: string = "provider/SaveTermsAndConditions";
    return this._http.post(baseApi + url, obj);
  }

  getShippingData() {
    let url: string = "shippingModeCatMapping/GetShippingCriteria";
    return this._http.get(baseApi + url);
  }



}
