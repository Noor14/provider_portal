import { Injectable } from '@angular/core';
import { baseApi } from '../../../../../constants/base.url';
import { HttpClient, HttpParams } from "@angular/common/http";

@Injectable()
export class SeaFreightService {

  constructor(private _http: HttpClient) { }

  getAllrates(type, obj) {
    let url: string = `providerrate${type}/SearchRates`;
    return this._http.post(baseApi + url, obj);
  }

  getAllratesLCL(obj) {
    let url: string = "providerratelcl/SearchRates";
    return this._http.post(baseApi + url, obj);
  }

  getAllLogisticServiceBySea(userID, providerID) {
    let url: string = `provider/GetProviderLogisticService/${userID}/${providerID}`;
    return this._http.get(baseApi + url);
  }
  addDraftRates(obj) {
    let url: string = "providerratefcl/AddDraftRow";
    return this._http.post(baseApi + url, obj);
  }
  addDraftRatesLCL(obj) {
    let url: string = "providerratelcl/AddDraftRow";
    return this._http.post(baseApi + url, obj);
  }

  saveDraftRate(type, obj) {
    let url: string = `providerrate${type}/SaveDraft`;
    return this._http.post(baseApi + url, obj);
  }

  saveWarehouseRate(obj) {
    let url: string = `providerRateWarehouse/saveRate`;
    return this._http.post(baseApi + url, obj);
  }

  saveDraftRateLCL(obj) {
    let url: string = "providerratelcl/SaveDraft";
    return this._http.post(baseApi + url, obj);
  }
  publishDraftRate(type, obj) {
    let url: string = `providerrate${type}/PublishRate`;
    return this._http.post(baseApi + url, obj);
  }
  publishDraftRateLCL(obj) {
    let url: string = "providerratelcl/PublishRate";
    return this._http.post(baseApi + url, obj);
  }
  deleteNDiscardDraftRate(data) {
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
  getAllAdditionalCharges(ProviderID) {
    let url: string = `AdditionalCharge/GetAll/${ProviderID}`;
    return this._http.get(baseApi + url);
  }

  getSurchargeBasis(ContainerLoadType) {
    let url: string = `AdditionalCharge/GetSurchargeBasis/${ContainerLoadType}`;
    return this._http.get(baseApi + url);
  }

  rateValidityFCL(type, data) {
    let url: string = `providerrate${type}/EditRate`;
    return this._http.post(baseApi + url, data);
  }
  rateValidityLCL(data) {
    let url: string = "providerratelcl/EditRate";
    return this._http.post(baseApi + url, data);
  }


  getRecHistoryFCL(recId, objectName, createdBy) {
    let url: string = `providerratefcl/GetRateHistory/${recId}/${objectName}/${createdBy}`;
    return this._http.get(baseApi + url);
  }
  getRecHistoryLCL(recId, objectName, createdBy) {
    let url: string = `providerratelcl/GetRateHistory/${recId}/${objectName}/${createdBy}`;
    return this._http.get(baseApi + url);
  }

  addCustomCharge(data) {
    let url: string = `AdditionalCharge/Post`;
    return this._http.post(baseApi + url, data);
  }

  getAllCustomers(ProviderID) {
    let url: string = `provider/GetProviderCustomerMapping/${ProviderID}`;
    return this._http.get(baseApi + url);
  }


  /**
   *
   * 
   * @param {number} ProviderID
   * @returns  
   * @memberof SeaFreightService
   */
  getAllDrafts(type, ProviderID, ContainerLoad, ) {
    let url: string = `providerrate${type}/GetAllDrafts/${ProviderID}/${ContainerLoad}`;
    return this._http.get(baseApi + url);
  }

}
