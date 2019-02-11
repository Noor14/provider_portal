import { Injectable } from '@angular/core';
import { baseApi } from '../../../../../constants/base.url';
import { HttpClient, HttpParams } from "@angular/common/http";

@Injectable()
export class GroundTransportService {


  constructor(private _http: HttpClient) { }

  getAllrates(obj) {
    let url: string = "providerrateground/SearchRates";
    return this._http.post(baseApi + url, obj);
  }

  addDraftRates(obj) {
    let url: string = "providerrateground/AddDraftRow";
    return this._http.post(baseApi + url, obj);
  }

  saveDraftRate(obj) {
    let url: string = "providerrateground/SaveDraft";
    return this._http.post(baseApi + url, obj);
  }

  publishDraftRate(obj) {
    let url: string = "providerrateground/PublishRate";
    return this._http.post(baseApi + url, obj);
  }

  deleteNDiscardDraftRate(data) {
    let url: string = "providerrateground/DiscardDraft";
    return this._http.request('delete', baseApi + url, { body: data });
  }

  deletePublishRate(data) {
    let url: string = "providerrateground/DeletePublishRate";
    return this._http.request('delete', baseApi + url, { body: data });
  }
  rateValidity(data) {
    let url: string = "providerrateground/EditRate";
    return this._http.post(baseApi + url, data);
  }

}
