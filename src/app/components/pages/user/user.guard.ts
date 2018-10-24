import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, NavigationStart, NavigationEnd } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { UserCreationService } from './user-creation/user-creation.service';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable()
export class UserGuard implements CanActivate {

  public previousUrl;
  constructor(private _userCreationService: UserCreationService, private router: Router) { 
    // router.events
    //   .filter(event => event instanceof NavigationEnd)
    //   .subscribe(event => {
    //     console.log('prev:', this.previousUrl);
    //     this.previousUrl = event.url;
    //   });
  }

  
  canActivate(_route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean{
   
   
    // if user go to otp direct page
    // return true;
    // if(state.url.indexOf('otp') >= 0){
    //   let otpKey = state.url.split('/').pop(); 
    //   return this._userCreationService.getUserInfoByOtp(otpKey).map((res: any) => {
    //     if (res.returnStatus == "Success") {
    //       return true;
    //     }
    //     else{
    //       this.router.navigate(['/registration']);
    //       return false;
    //     }
    //   }, (err: HttpErrorResponse) => {
    //     this.router.navigate(['/registration']);
    //     return Observable.of(false);
    //   })
   
    // }
    
    // // if user go to password direct page

    // if (state.url.indexOf('password') >= 0) {
    //   let otpKey = state.url.split('/').pop();
    //   return this._userCreationService.getUserOtpVerified(otpKey, 'Used').map((res: any) => {
    //     if (res.returnStatus == "Success") {
    //       return true;
    //     }
    //     else {
    //       this.router.navigate(['/registration']);
    //       return false;
    //     }
    //   }, (err: HttpErrorResponse) => {
    //     this.router.navigate(['/registration']);
    //     return Observable.of(false);
    //   })

    // }
      

    // if user back from otp to registration page

    // if(state.url){
      return true 
    // }

  }
}
