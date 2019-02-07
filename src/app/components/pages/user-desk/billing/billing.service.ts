import { Injectable } from '@angular/core';
import { baseApi } from '../../../../constants/base.url';
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Injectable()
export class BillingService {

  constructor(private _http: HttpClient) { }

  makePayment(data) {
    const httpOptions = {
      headers: new HttpHeaders({
        "Access-Control-Allow-Origin": "*",
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': data.length,
        "Access-Control-Allow-Credentials": "true"
      })
    };
    let url: string = "https://www.paytabs.com/apiv2/create_pay_page";
    return this._http.post(url, data, httpOptions);
  }
  }