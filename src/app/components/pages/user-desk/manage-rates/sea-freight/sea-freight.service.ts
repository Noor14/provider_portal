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

  getAllratesLCL(obj) {
    let url: string = "providerratelcl/SearchRates";
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
  addDraftRatesLCL(obj) {
    let url: string = "providerratelcl/AddDraftRow";
    return this._http.post(baseApi + url, obj);
  }

  saveDraftRate(obj){
    let url: string = "providerratefcl/SaveDraft";
    return this._http.post(baseApi + url, obj);
  }

  saveDraftRateLCL(obj){
    let url: string = "providerratelcl/SaveDraft";
    return this._http.post(baseApi + url, obj);
  }
  publishDraftRate(obj) {
    let url: string = "providerratefcl/PublishRate";
    return this._http.post(baseApi + url, obj);
  }
  publishDraftRateLCL(obj) {
    let url: string = "providerratelcl/PublishRate";
    return this._http.post(baseApi + url, obj);
  }
  deleteNDiscardDraftRate(data){
    let url: string = "providerratefcl/DiscardDraft";
    return this._http.request('delete', baseApi + url, { body: data });
  }
  deleteNDiscardDraftRateLCl(data) {
    let url: string = "providerratelcl/DiscardDraft";
    return this._http.request('delete', baseApi + url, { body: data });
  }
  deletePublishRateFCL(data) {
    let url: string = "providerratefcl/DeletePublishRate";
    return this._http.request('delete', baseApi + url, { body: data });
  }
  deletePublishRateLCL(data) {
    let url: string = "providerratelcl/DeletePublishRate";
    return this._http.request('delete', baseApi + url, { body: data });
  }

  getAllAdditionalCharges() {
    let url: string = `AdditionalCharge/GetAll`;
    return this._http.get(baseApi + url);
  }

  rateValidityFCL(data){
    let url: string = "providerratefcl/EditRate";
    return this._http.post(baseApi + url, data);
  }


}
