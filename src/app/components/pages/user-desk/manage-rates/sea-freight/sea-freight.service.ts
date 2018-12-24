import { Injectable } from '@angular/core';
import { baseApi } from '../../../../../constants/base.url';
import { HttpClient, HttpParams } from "@angular/common/http";

@Injectable()
export class SeaFreightService {

  constructor(private _http: HttpClient) { }
  
  getAllrates(){
    let url: string = "country/GetDropDownDetailOtherLanguage/0";
    return this._http.get(baseApi + url);
  }
}
