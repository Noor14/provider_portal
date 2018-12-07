import { Injectable } from '@angular/core';
import { baseApi } from '../../../../../constants/base.url';
import { HttpClient, HttpParams } from "@angular/common/http";

@Injectable()
export class WarehouseService {

  constructor(private _http: HttpClient) { }

  getWarehouseData() {
    let url: string = "warehousesetup/Get";
    return this._http.get(baseApi + url);
  }

}
