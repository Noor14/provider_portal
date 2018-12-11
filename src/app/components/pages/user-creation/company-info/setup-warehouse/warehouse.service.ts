import { Injectable } from '@angular/core';
import { baseApi } from '../../../../../constants/base.url';
import { HttpClient, HttpParams } from "@angular/common/http";

@Injectable()
export class WarehouseService {

  constructor(private _http: HttpClient) { }

  getWarehouseData(wid, userId) {
    let url: string = `warehousesetup/Get/${wid}`;
    // let url: string = `warehousesetup/Get/${wid}/${userId}`;
    return this._http.get(baseApi + url);
  }

  addWarehouse(data) {
    let url: string = "warehousesetup/Post";
    return this._http.post(baseApi + url, data);
  }
  PutwarehouseInfo(data) {
    let url: string = "warehousesetup/Put";
    return this._http.put(baseApi + url, data);
  }

}
