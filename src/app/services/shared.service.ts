import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class SharedService {

  constructor(private _http: HttpClient) { }

  private countries = new BehaviorSubject<any>(null);
  public countryList =this.countries.asObservable();

  private userLocation = new BehaviorSubject<any>(null);
  public getLocation =this.userLocation.asObservable();


  getBrowserlocation(){
    let url: string = 'http://ip-api.com/json';
    return this._http.get(url);
  }

  setMapLocation(data){
    this.userLocation.next(data);
  }
  setCountries(data){
    this.countries.next(data);
  }
}
