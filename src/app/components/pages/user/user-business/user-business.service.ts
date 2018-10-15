import { Injectable } from '@angular/core';
import { baseApi } from '../../../../constants/base.url';
import { HttpClient, HttpParams } from "@angular/common/http";

@Injectable()
export class UserBusinessService {

  constructor(private _http: HttpClient) { }


  getServiceOffered() {
    let url: string = "usersprovider/ServiceOffered";
    return this._http.get(baseApi + url);
  }

  getOrganizationType(){
    let url: string = "companytype/GetOrganizationType";
    return this._http.get(baseApi + url);
  }

  getDocByCountrytype(countryId){
    let url: string = `Document/GetDocumentTypebyCountry/${countryId}`;
    return this._http.get(baseApi + url);
  }

  getDesgTitle(){
    let url: string = "usersprovider/GetManagementJobTitle"; 
    return this._http.get(baseApi + url);
  }

  socialList(){
    let url: string = "socialmedia/GetSocialMediaAccount";
    return this._http.get(baseApi + url);
  }

}
