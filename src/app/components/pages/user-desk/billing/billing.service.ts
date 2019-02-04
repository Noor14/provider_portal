import { Injectable } from '@angular/core';
import { baseApi } from '../../../../constants/base.url';
import { HttpClient, HttpParams } from "@angular/common/http";

@Injectable()
export class BillingService {

  constructor(private _http: HttpClient) { }

  makePayment(obj) {
    let url: string = "https://www.paytabs.com/apiv2/create_pay_page";
    return this._http.post(url, obj);
  }
  }
