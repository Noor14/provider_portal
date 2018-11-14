import { Injectable } from '@angular/core';
import { baseApi } from '../../../../constants/base.url';
import { HttpClient, HttpParams } from "@angular/common/http";

@Injectable()
export class CompanyInfoService {

  constructor(private _http: HttpClient) { }
  
  getServiceOffered() {
    let url: string = "usersprovider/ServiceOffered";
    return this._http.get(baseApi + url);
  }

  getOrganizationType() {
    let url: string = "companytype/GetOrganizationType";
    return this._http.get(baseApi + url);
  }

  getDocByCountrytype(forProcess, providerId, countryId) {
    let url: string = `Document/GetProviderDocument/${forProcess}/${providerId}/${countryId}`;
    return this._http.get(baseApi + url);
  }

  getDesgTitle() {
    let url: string = "usersprovider/GetManagementJobTitle";
    return this._http.get(baseApi + url);
  }

  socialList() {
    let url: string = "socialmedia/GetSocialMediaAccount";
    return this._http.get(baseApi + url);
  }


  docUpload(doc) {
    let url: string = "document/Post";
    return this._http.post(baseApi + url, doc);
  }
  removeDoc(id) {
    let url: string = "document/Put";
    return this._http.put(baseApi + url, id);
  }

  submitBusinessInfo(obj) {
    let url: string = "usersprovider/AddProviderBusiness";
    return this._http.post(baseApi + url, obj);

  }


}
