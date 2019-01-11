import { Injectable } from '@angular/core';
import { baseApi } from "../constants/base.url";
import { HttpClient, HttpParams } from "@angular/common/http";

@Injectable()
export class CommonService {

  constructor(private _http: HttpClient) { }

  getCountry() {
    let url: string = "country/GetDropDownDetailOtherLanguage/0";
    return this._http.get(baseApi + url);
  }

  getCities() {
    let url: string = "City/GetDropDownDetail/0";
    return this._http.get(baseApi + url);
  }

  translatedLanguage(sourceLanguage, targetLanguage, text) {
    const params = new HttpParams()
    .set('source', sourceLanguage)
    .set('target', targetLanguage)
    .set('q', text)
    .set('key', 'AIzaSyDy8gRbCqDNl7BaN-rqW_r6IfMB45tf1oc');
    let url: string = "https://translation.googleapis.com/language/translate/v2";
    return this._http.get(url, {params});
  }

  detectedLanguage(text){
    const params = new HttpParams()
    .set('q', text)
    .set('key', 'AIzaSyDy8gRbCqDNl7BaN-rqW_r6IfMB45tf1oc');
    let url: string = "https://translation.googleapis.com/language/translate/v2/detect";
    return this._http.get(url, {params});
  }

   getBrowserlocation(){
    let url: string = 'http://ip-api.com/json';
    return this._http.get(url);
  }
  
  getHelpSupport(cache: boolean) {
    let url: string = "general/GetHMHelpSupportDetail";
    return this._http.get((baseApi + url))
  }

  getMstCodeVal(tag: string) {
    let url = `MstCodeVal/GetMstCodeValMultipleList/${tag}`
    return this._http.get(baseApi + url);
  }
}
