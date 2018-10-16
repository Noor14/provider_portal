import { Injectable } from '@angular/core';
import { baseApi } from '../../../constants/base.url';
import { HttpClient, HttpParams } from "@angular/common/http";

@Injectable()
export class UserService {

  constructor(private _http: HttpClient) { }

  getlabelsDescription(page){
    let url: string = `languagetranslate/LanguageDictionary/[En-US]/[Ar-AE]/${page}`;
    return this._http.get(baseApi + url);
  } 
 
  getLatlng(country){
    const params = new HttpParams()
    .set('address', country)
    .set('key', 'AIzaSyBs4tYXYGUA2kDvELgCYcbhYeoVgZCxumg');
    let url: string = `https://maps.googleapis.com/maps/api/geocode/json`;
    return this._http.get(url, {params});
  }

}
