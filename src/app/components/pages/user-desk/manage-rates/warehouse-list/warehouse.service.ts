import { Injectable } from '@angular/core';
import { baseApi } from '../../../../../constants/base.url';
import { HttpClient } from "@angular/common/http";

@Injectable()
export class WarehouseService {

  constructor(private _http: HttpClient) { }

  getWarehouseList(providerId, wid) {
    let url: string = `warehousesetup/GetAll/${providerId}/${wid}`;
    return this._http.get(baseApi + url);
  }


  delWarehouse(wid, modifiedBy) {
    let url: string = `warehousesetup/Delete/${wid}/${modifiedBy}`;
    return this._http.delete(baseApi + url);
  }
  activeWarehouseToggler(obj) {
    let url: string = "warehousesetup/UpdateStatus";
    return this._http.post(baseApi + url, obj);
  }

  getDropDownValuesWarehouse(leasTerm, unitLength, unitArea, unitVolume) {
    let url: string = `MstCodeVal/GetMstCodeValMultipleList/${leasTerm},${unitLength},${unitArea},${unitVolume}`;
    return this._http.get(baseApi + url);
  }

  addWarehouseDetail(obj) {
    let url: string = "warehousesetup/AddWarehouse";
    return this._http.post(baseApi + url, obj);
  }

  getAllPublishedrates(obj) {
    let url: string = `ProviderRateWarehouse/GetAllWarehouseRates`;
    return this._http.post(baseApi + url, obj);
  }

  deletePublishedRate(data) {
    let url: string = "providerratewarehouse/DeleteRate";
    return this._http.request('delete', baseApi + url, { body: data });
  }

}
