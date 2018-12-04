import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, NavigationStart, NavigationEnd } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { BasicInfoService } from './basic-info/basic-info.service';
import { HttpErrorResponse } from '@angular/common/http';
import { SharedService } from '../../../services/shared.service';
import { UserCreationService } from './user-creation.service';

@Injectable()
export class UserGuard implements CanActivate {

  public previousUrl;
  private islogOut : boolean;
  private infoObj;
  constructor(
    private _basicInfoService: BasicInfoService, 
    private router: Router, 
    private _sharedService: SharedService,
    private _userCreationService: UserCreationService
  ) {
    // router.events
    //   .filter(event => event instanceof NavigationEnd)
    //   .subscribe(event => {
    //     console.log('prev:', this.previousUrl);
    //     this.previousUrl = event.url;
    //   });
  }


  canActivate(_route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {

     this.getloginStatus();

    // if user go to otp direct page
     if (state.url.indexOf('otp') >= 0) {
      let otpKey = state.url.split('/').pop();
      if (otpKey != 'otp') {
        return this.checkOtp(otpKey);
      }
      else {
        this.router.navigate(['/registration']);
        return true;
      }
    }

    // // if user go to password direct page

    if (state.url.indexOf('password') >= 0) {
      let otpKey = state.url.split('/').pop();
      if (otpKey != 'password') {
        return this.checkPassword(otpKey);
      }
      else if (!this.islogOut){
        this.router.navigate(['/business-profile']);    // "previous url hard code"
        return true;
      }
      else{
        this.router.navigate(['/registration']);
        return true;
      }
    }

    // if user go to direct business profile page
    if (state.url == '/business-profile') {
      if (!this.islogOut) {
        if (this.infoObj.UserProfileStatus == "Warehouse Pending") {
          this.router.navigate(['/provider/dashboard']);
        }
        else if (this.infoObj.UserProfileStatus == "Business Profile Pending") {
          return true;
        }
        else if (this.infoObj.UserProfileStatus == "Business Profile Complete") {
          this.router.navigate(['/profile-completion']);
        }
      }
      else {
        this.router.navigate(['/registration']);
        return true;
      }
    }

    // if user go to direct thankYou page

    if (state.url == '/profile-completion') {
      if (!this.islogOut) {
        if (this.infoObj.UserProfileStatus == "Business Profile Complete") {
          return true
        }
        else if (this.infoObj.UserProfileStatus == "Warehouse Pending") {
          this.router.navigate(['/provider/dashboard']);
        }
        else if (this.infoObj.UserProfileStatus == "Business Profile Pending") {
          this.router.navigate(['/business-profile']);    // "previous url hard code"
        }
      }
      else {
        this.router.navigate(['/registration']);
        return true;
      }
    }
    // if user go to registration page

    if (state.url == '/registration' || state.url.indexOf('registration') >= 0) {
      if (this.islogOut) {
        return true;
      }
      else {
        if (this.infoObj.UserProfileStatus == "Warehouse Pending") {
          this.router.navigate(['/provider/dashboard']);
        }
        else if (this.infoObj.UserProfileStatus == "Business Profile Pending") {
          this.router.navigate(['/business-profile']);
        }
      }
    }
   // if user go to user desk pages
    if (state.url.indexOf('provider') >= 0) {
      if (!this.islogOut) {
        if (this.infoObj.UserProfileStatus == "Warehouse Pending"){
          return true;
        }
        else if (this.infoObj.UserProfileStatus == "Business Profile Pending"){
          this.router.navigate(['/business-profile']);
          return true;
        }
      }
      else {
        this.router.navigate(['/business-profile']);
        return true;
      }
    }
  }
  // getProfileStatus(id): Observable<boolean>{
  //   return this._userCreationService.getUserProfileStatus(id).map((res: any) => {
  //     if (res.returnStatus == "Success") {
  //       if (res.returnText == "Warehouse Pending"){
  //         return true;
  //       }
  //       else{
  //         this.router.navigate(['/business-profile']);
  //         return true;
  //       }
  //     }
  //   }, (err: HttpErrorResponse) => {
  //     this.router.navigate(['/registration']);
  //     return true;
  //   })
  // }
  checkOtp(otpKey): Observable<boolean> {
    return this._basicInfoService.getUserInfoByOtp(otpKey).map((res: any) => {
      if (res.returnStatus == "Success") {
        this._sharedService.getUserInfoByOtp.next(res);
        return true;
      }
      else {
        if (this.checkPassword(otpKey)) {
          this.router.navigate(['/password', otpKey]);
          return true;

        } else {
          this.router.navigate(['/registration']);
          return true;
        }
      }
    }, (err: HttpErrorResponse) => {
      this.router.navigate(['/registration']);
      return true;
    })
  }

  checkPassword(otpKey): Observable<boolean> {
    return this._basicInfoService.getUserOtpVerified(otpKey, 'Used').map((res: any) => {
      if (res.returnStatus == "Success" && res.returnId == 1) {
        this._sharedService.getUserOtpVerified.next(res);
        return true;
      }
      else if (res.returnId == 2){
        this.router.navigate(['/business-profile']);
        return true;
      }
      else {
        this.router.navigate(['/registration']);
        return true;
      }
    }, (err: HttpErrorResponse) => {
      this.router.navigate(['/registration']);
      return Observable.of(true);
    })
  }
   getloginStatus(){
  let userInfo = JSON.parse(localStorage.getItem('userInfo')); 
  if (userInfo && userInfo.returnText){
   this.infoObj = JSON.parse(userInfo.returnText);

  this._sharedService.IsloggedIn.subscribe((state: any) => {
    if (state == null) {
      this.islogOut = (userInfo && Object.keys('userInfo').length) ? JSON.parse(userInfo.returnText).IsLogedOut : true;
    } 
    else {
      this.islogOut = state;
    }
  })
    }else{
      this.islogOut = true;
    }
  // this._sharedService.IsloggedInShow.subscribe((state: any) => {
  //   this.islogOut = state;
  // })
}
}
