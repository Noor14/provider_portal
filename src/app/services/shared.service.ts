import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class SharedService {

  constructor(private _http: HttpClient) { }

  public countryList = new BehaviorSubject<any>(null);
  // public countryList = this.countries.asObservable();

  private userLocation = new BehaviorSubject<any>(null);
  public getLocation = this.userLocation.asObservable();
  
  public formProgress = new BehaviorSubject<number>(0)
  public formChange = new BehaviorSubject<boolean>(true)


  setMapLocation(data) {
    this.userLocation.next(data);
  }
  // setCountries(data) {
  //   this.countries.next(data);
  // }
}
