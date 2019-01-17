import { Injectable } from '@angular/core';
import { baseApi } from '../../../../../constants/base.url';
import { HttpClient, HttpParams } from "@angular/common/http";

@Injectable()
export class AirFreightService {

  constructor(private _http: HttpClient) { }

  getAllrates(obj) {
    let url: string = "ProviderRateAir/SearchRates";
    return this._http.post(baseApi + url, obj);
  }

  addDraftRates(obj) {
    let url: string = "ProviderRateAir/AddDraftRow";
    return this._http.post(baseApi + url, obj);
  }

  saveDraftRate(obj) {
    let url: string = "ProviderRateAir/SaveDraft";
    return this._http.post(baseApi + url, obj);
  }

  publishDraftRate(obj) {
    let url: string = "ProviderRateAir/PublishRate";
    return this._http.post(baseApi + url, obj);
  }


  deleteNDiscardDraftRate(data) {
    let url: string = "ProviderRateAir/DiscardDraft";
    return this._http.request('delete', baseApi + url, { body: data });
  }

  deletePublishRate(data) {
    let url: string = "ProviderRateAir/DeletePublishRate";
    return this._http.request('delete', baseApi + url, { body: data });
  }

}
