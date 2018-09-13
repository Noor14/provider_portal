import { Injectable } from '@angular/core';
import { baseApi } from "../constants/base.url";
import { HttpClient } from "@angular/common/http";

@Injectable()
export class CommonService {

  constructor(private _http: HttpClient) { }
  getCountry() {
    let url: string = "Country/GetDropDownDetail/0";
    return this._http.get(baseApi + url);
  }
   getBrowserlocation(){
    let url: string = 'http://ip-api.com/json';
    return this._http.get(url);
  }
}
