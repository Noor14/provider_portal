import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, NavigationStart, NavigationEnd } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { SharedService } from '../../../../services/shared.service';
import { isJSON } from '../../../../constants/globalFunctions';
import { DashboardService } from '../dashboard/dashboard.service';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable()
export class ServicesGuard implements CanActivate {

  private islogOut: boolean;
  private previousUrl: string = undefined;
  private selectedServices: any[];
  private userProfile:any
    constructor(
      private router: Router,
      private _sharedService: SharedService,
      private _dashboardService: DashboardService
  ) { 
  
  }


  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    this.getloginStatus();
      // if user go to manage rates sea page
    if (state.url == '/provider/manage-rates/sea') {
      if (!this.islogOut) {
        if (this.previousUrl && this.previousUrl.includes('manage-rates') && location.pathname.includes('manage-rates')){
          if (this.selectedServices && this.selectedServices.length) {
            let index = this.selectedServices.findIndex(obj => obj.LogServCode == "SEA_FFDR");
            if (index >= 0) {
              return true;
            }
            }
        }
        else{
          return this.getDashboardDataBySea(this.userProfile.UserID);
        }
      }
      else {
        this.router.navigate(['registration']);
      }
    }

    if (state.url == '/provider/manage-rates/air') {
      if (!this.islogOut) {
        if (this.previousUrl && this.previousUrl.includes('manage-rates') && location.pathname.includes('manage-rates')) {
          if (this.selectedServices && this.selectedServices.length) {
            let index = this.selectedServices.findIndex(obj => obj.LogServCode == "AIR_FFDR");
            if (index >= 0) {
              return true;
            }
          }
        }else{
          return this.getDashboardDataByRoute(this.userProfile.UserID, state, 'Air')
        }
      }
      else {
        this.router.navigate(['registration']);
      }
    }

    if (state.url == '/provider/manage-rates/ground') {
      if (!this.islogOut) {
        if (this.previousUrl && this.previousUrl.includes('manage-rates') && location.pathname.includes('manage-rates')) {
          if (this.selectedServices && this.selectedServices.length) {
            let index = this.selectedServices.findIndex(obj => obj.LogServCode == "TRUK");
            if (index >= 0) {
              return true;
            }
          }
        }else{
          return this.getDashboardDataByRoute(this.userProfile.UserID, state, 'Ground');
        }
        }
      else {
        this.router.navigate(['registration']);
      }
    }

    if (state.url == '/provider/manage-rates/warehouse') {
      if (!this.islogOut) {
        if (this.previousUrl && this.previousUrl.includes('manage-rates') && location.pathname.includes('manage-rates')) {
          if (this.selectedServices && this.selectedServices.length) {
            let index = this.selectedServices.findIndex(obj => obj.LogServCode == "WRHS");
            if (index >= 0) {
              return true;
            }
          }
        }else{
          return this.getDashboardDataByRoute(this.userProfile.UserID, state, 'Warehouse');
        }
      }
      else {
        this.router.navigate(['registration']);
      }
    }



  }
  getDashboardDataByRoute(id , state, type): Observable<boolean> {
    return this._dashboardService.getdashboardDetails(id).map((res: any) => {
      if (res.returnStatus == 'Success') {
        if (res.returnObject && Object.keys(res.returnObject).length) {
          this._sharedService.dashboardDetail.next(res.returnObject);
          if (res.returnObject.LogisticService && isJSON(res.returnObject.LogisticService)) {
            this.selectedServices = JSON.parse(res.returnObject.LogisticService);
            if (this.selectedServices && this.selectedServices.length) {
              if(type =='Air'){
                let index = this.selectedServices.findIndex(obj => obj.LogServCode == "AIR_FFDR");
                if (index >= 0) {
                  this.previousUrl = state.url;
                  return true
                }
              }
              else if (type == 'Ground') {
                let index = this.selectedServices.findIndex(obj => obj.LogServCode == "TRUK");
                if (index >= 0) {
                  this.previousUrl = state.url;
                  return true
                }
              }
              else if (type == 'Warehouse') {
                let index = this.selectedServices.findIndex(obj => obj.LogServCode == "WRHS");
                if (index >= 0) {
                  this.previousUrl = state.url;
                  return true
                }
              }
            
            } else {
              this.router.navigate(['provider/dashboard']);
            }

          }
        }
      }
      else {
        return false;

      }
    }, (err: HttpErrorResponse) => {
      console.log(err)
      this.router.navigate(['provider/dashboard']);
      return Observable.of(true);
    })
  }
  getDashboardDataBySea(id): Observable<boolean> {
    return this._dashboardService.getdashboardDetails(id).map((res: any) => {
      if (res.returnStatus == 'Success') {
      if (res.returnObject && Object.keys(res.returnObject).length) {
        this._sharedService.dashboardDetail.next(res.returnObject);
        if (res.returnObject.LogisticService && isJSON(res.returnObject.LogisticService)) {
          this.selectedServices = JSON.parse(res.returnObject.LogisticService);
            if (this.selectedServices && this.selectedServices.length) {
              let index = this.selectedServices.findIndex(obj => obj.LogServCode == "SEA_FFDR");
              if (index >= 0) {
                return true;
              }
              else if (!this.previousUrl || !location.pathname.includes('manage-rates')) {
                let index = this.selectedServices.findIndex(obj => obj.LogServCode == "AIR_FFDR");
                if (index >= 0) {
                  this.router.navigate(['provider/manage-rates/air']);
                  return true;
                }
                else {
                  let index = this.selectedServices.findIndex(obj => obj.LogServCode == "TRUK");
                  if (index >= 0) {
                    this.router.navigate(['provider/manage-rates/ground']);
                    return true;
                  }
                  else {
                    let index = this.selectedServices.findIndex(obj => obj.LogServCode == "WRHS");
                    if (index >= 0) {
                      this.router.navigate(['provider/manage-rates/warehouse']);
                      return true;
                    }
                  }
                }
              }

            } else {
              this.router.navigate(['provider/dashboard']);
              }
          }
        }
      }
      else{
        return false;

      }
    }, (err: HttpErrorResponse) => {
        console.log(err)
        this.router.navigate(['provider/dashboard']);
        return Observable.of(true);
    })
  }
  getloginStatus() {
    let userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo && userInfo.returnText) {
      this.userProfile = JSON.parse(userInfo.returnText);
      this._sharedService.IsloggedIn.subscribe((state: any) => {
        if (state == null) {
          this.islogOut = (userInfo && Object.keys('userInfo').length) ? this.userProfile.IsLogedOut : true;
        }
        else {
          this.islogOut = state;
        }
      })
    } else {
      this.islogOut = true;
    }

  }
}