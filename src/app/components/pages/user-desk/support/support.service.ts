import { Injectable } from '@angular/core';
import { baseApi } from '../../../../constants/base.url';
import { HttpClient } from "@angular/common/http";

@Injectable()
export class SupportService {

  constructor(private _http: HttpClient) { }

  getHelpSupport() {
    let url: string = "general/GetHMHelpSupportDetail";
    return this._http.get(baseApi + url)
  }



}
