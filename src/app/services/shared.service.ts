import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";

@Injectable()
export class SharedService {

  constructor(private _http: HttpClient) { }
  
  public countryList:any[];
  public userLocation:any;


  getBrowserlocation(){
    let url: string = 'http://ip-api.com/json';
    return this._http.get(url);
  }

}
