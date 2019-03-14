import { Injectable } from '@angular/core';
import { baseApi } from '../../../../constants/base.url';
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Injectable()
export class BillingService {

  constructor(private _http: HttpClient) { }

  addPayment(data) {
    let url: string = "providerpayment/AddPayment";
    return this._http.post(baseApi + url, data);
  }
}
