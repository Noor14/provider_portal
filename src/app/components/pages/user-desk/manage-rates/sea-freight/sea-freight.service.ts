import { Injectable } from '@angular/core';
import { baseApi } from '../../../../../constants/base.url';
import { HttpClient, HttpParams } from "@angular/common/http";

@Injectable()
export class SeaFreightService {

  constructor(private _http: HttpClient) { }
  
  getAllrates(obj){
    let url: string = "providerratefcl/SearchRates";
    return this._http.post(baseApi + url, obj);
  }
  getAllLogisticServiceBySea(userID, providerID){
    let url: string = `provider/GetProviderLogisticService/${userID}/${providerID}`;
    return this._http.get(baseApi + url);
  }
  addDraftRates(obj){
    let url: string = "providerratefcl/AddDraftRow";
    return this._http.post(baseApi + url, obj);
  }

  saveDraftRate(obj){
    let url: string = "providerratefcl/SaveDraft";
    return this._http.post(baseApi + url, obj);
  }

  publishDraftRate(obj) {
    let url: string = "providerratefcl/PublishRate";
    return this._http.post(baseApi + url, obj);
  }


  deleteNDiscardDraftRate(data){
    let url: string = "providerratefcl/DiscardDraft";
    return this._http.request('delete', baseApi + url, { body: data });
  }
  deletePublishRateFCL(data) {
    let url: string = "providerratefcl/DeletePublishRate";
    return this._http.request('delete', baseApi + url, { body: data });
  }
}