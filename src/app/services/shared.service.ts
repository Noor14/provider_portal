import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class SharedService {

  constructor(private _http: HttpClient) { }

  public countryList = new BehaviorSubject<any>(null);
  public regionList = new BehaviorSubject<any>(null);
  public currencyList = new BehaviorSubject<any>(null);
  public cityList = new BehaviorSubject<any>(null);
  // public countryList = this.countries.asObservable();

  public getUserInfoByOtp = new BehaviorSubject<any>(null);
  public getUserOtpVerified = new BehaviorSubject<any>(null);
  public documentList = new BehaviorSubject<any>(null);
  public dataLogisticServiceBySea = new BehaviorSubject<any>(null);
  public draftRowFCLAdd = new BehaviorSubject<any>(null);
  public draftRowLCLAdd = new BehaviorSubject<any>(null);
  public draftRowAddAir = new BehaviorSubject<any>(null);
  public draftRowAddGround = new BehaviorSubject<any>(null);
  public updatedDraftsAir = new BehaviorSubject<any>(null);
  public termNcondGround = new BehaviorSubject<any>(null);
  public termNcondAir = new BehaviorSubject<any>(null);
  public termNcondFCL = new BehaviorSubject<any>(null);
  public termNcondLCL = new BehaviorSubject<any>(null);
  public businessProfileJsonLabels = new BehaviorSubject<any>(null);
  public jobTitleList = new BehaviorSubject<any>(null);
  public businessDetailObj = new BehaviorSubject<any>(null);
  public dashboardDetail = new BehaviorSubject<any>(null);

  private userLocation = new BehaviorSubject<any>(null);
  public getLocation = this.userLocation.asObservable();

  public formChanger = new BehaviorSubject<boolean>(true);
  public formChange = new BehaviorSubject<boolean>(true);

  public IsloggedIn = new BehaviorSubject<boolean>(null);
  public signOutToggler = new BehaviorSubject<boolean>(null);

  private currencyDataSource = new BehaviorSubject<any[]>(null);
  currenciesList = this.currencyDataSource.asObservable();

  setMapLocation(data) {
    this.userLocation.next(data);
  }
  getMapLocation() {
    return this.userLocation.getValue();
  }
  // setCountries(data) {
  //   this.countries.next(data);
  // }

  setCurrency(data: any[]) {
    this.currencyDataSource.next(data);
  }
}
