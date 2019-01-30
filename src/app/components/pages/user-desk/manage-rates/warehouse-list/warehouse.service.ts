import { Injectable } from '@angular/core';
import { baseApi } from '../../../../../constants/base.url';
import { HttpClient } from "@angular/common/http";

@Injectable()
export class WarehouseService {

  constructor(private _http: HttpClient) { }

  getWarehouseData(userId, wid) {
    let url: string = `warehousesetup/Get/${wid}/${userId}`;
    return this._http.get(baseApi + url);
  }
  getWarehouseList(providerId) {
    let url: string = `warehousesetup/GetAll/${providerId}`;
    return this._http.get(baseApi + url);
  }

  addWarehouse(data) {
    let url: string = "warehousesetup/Post";
    return this._http.post(baseApi + url, data);
  }
  putWarehouseInfo(data) {
    let url: string = "warehousesetup/Put";
    return this._http.put(baseApi + url, data);
  }

  delWarehouse(wid, modifiedBy){
    let url: string = `warehousesetup/Delete/${wid}/${modifiedBy}`;
    return this._http.delete(baseApi + url);
  }

}
