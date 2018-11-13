import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, NavigationStart, NavigationEnd } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { BasicInfoService } from './basic-info/basic-info.service';
import { HttpErrorResponse } from '@angular/common/http';
import { SharedService } from '../../../services/shared.service';

@Injectable()
export class UserGuard implements CanActivate {

  public previousUrl;
  constructor(private _basicInfoService: BasicInfoService, private router: Router, private _sharedService: SharedService) {
    // router.events
    //   .filter(event => event instanceof NavigationEnd)
    //   .subscribe(event => {
    //     console.log('prev:', this.previousUrl);
    //     this.previousUrl = event.url;
    //   });
  }

  canActivate(_route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {

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
      else if (localStorage.getItem('userInfo') && Object.keys('userInfo').length){
        this.router.navigate(['/business-profile']);    // "previous url hard code"
        return true;
      }
      else{
        this.router.navigate(['/registration']);
        return true;
      }
    }

    // if user go to direct business profile page or profile-completion page
    if (state.url == '/business-profile' || state.url == '/profile-completion') {
      if (localStorage.getItem('userInfo') && Object.keys('userInfo').length) {
        return true;
      }
      else {
        this.router.navigate(['/registration']);
        return true;
      }
    }

    // if user go to registration page

    if (state.url == '/registration') {
      if (!localStorage.getItem('userInfo') || localStorage.getItem('userInfo')) {
        return true;
      }
      else {
        this.router.navigate(['/business-profile']);
        return true;

      }
    }

    // if user go to thank You page

    if (state.url == '/profile-completion') {
      if (localStorage.getItem('userInfo')) {
        return true;
      }
      else {
        this.router.navigate(['/business-profile']);
        return true;

      }
    }



  }

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

}
