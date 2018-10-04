import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class SharedService {

  constructor(private _http: HttpClient) { }

  private countries = new BehaviorSubject<any>(null);
  public countryList = this.countries.asObservable();

  private userLocation = new BehaviorSubject<any>(null);
  public getLocation = this.userLocation.asObservable();
  
  public formChanger = new BehaviorSubject<boolean>(true);
  public formProgress = new BehaviorSubject<number>(0)


  setMapLocation(data) {
    this.userLocation.next(data);
  }
  setCountries(data) {
    this.countries.next(data);
  }

}
