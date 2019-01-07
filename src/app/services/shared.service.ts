import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class SharedService {

  constructor(private _http: HttpClient) { }

  public countryList = new BehaviorSubject<any>(null);
  public cityList = new BehaviorSubject<any>(null);
  // public countryList = this.countries.asObservable();

  public getUserInfoByOtp = new BehaviorSubject<any>(null);
  public getUserOtpVerified = new BehaviorSubject<any>(null);
  public documentList = new BehaviorSubject<any>(null);
  public dataLogisticServiceBySea = new BehaviorSubject<any>(null);
  public businessProfileJsonLabels = new BehaviorSubject<any>(null);
  public jobTitleList = new BehaviorSubject<any>(null);
  public businessDetailObj = new BehaviorSubject<any>(null);
  public dashboardDetail = new BehaviorSubject<any>(null);

  private userLocation = new BehaviorSubject<any>(null);
  public getLocation = this.userLocation.asObservable();
  
  public formChanger = new BehaviorSubject<boolean>(true);
  public formProgress = new BehaviorSubject<number>(0);
  public formChange = new BehaviorSubject<boolean>(true);

  public IsloggedIn = new BehaviorSubject<boolean>(null);
  public signOutToggler = new BehaviorSubject<boolean>(null);

  setMapLocation(data) {
    this.userLocation.next(data);
  }
  getMapLocation() {
    return this.userLocation.getValue();
  }
  // setCountries(data) {
  //   this.countries.next(data);
  // }
}
