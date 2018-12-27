import { Injectable } from '@angular/core';
import { baseApi } from '../../../../../constants/base.url';
import { HttpClient, HttpParams } from "@angular/common/http";

@Injectable()
export class SeaFreightService {

  constructor(private _http: HttpClient) { }
  
  getAllrates(){
    let url: string = "country/GetDropDownDetailOtherLanguage/0";
    // let url: string = "providerratefcl/SearchRates";
    return this._http.get(baseApi + url);
  }

  getAllLogisticServiceBySea(userID, providerID){
    let url: string = `provider/GetProviderLogisticService/${userID}/${providerID}`;
    return this._http.get(baseApi + url);
  }
}
