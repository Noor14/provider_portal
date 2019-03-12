import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, NavigationStart, NavigationEnd } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { SharedService } from '../../../../services/shared.service';
import { isJSON } from '../../../../constants/globalFunctions';

@Injectable()
export class ServicesGuard implements CanActivate {

  private islogOut: boolean;
  private previousUrl: string = undefined;
  private selectedServices: any[];
  constructor(
    private router: Router,
    private _sharedService: SharedService,
  ) { }


  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    this.getloginStatus();

    this._sharedService.dashboardDetail.subscribe((state: any) => {
      if (state && Object.keys(state).length) {
        if (state.LogisticService && isJSON(state.LogisticService)) {
          this.selectedServices = JSON.parse(state.LogisticService)
        }
      }
    });
    // if user go to manage rates sea page
    if (state.url == '/provider/manage-rates/sea') {
      if (!this.islogOut) {
        if (this.selectedServices && this.selectedServices.length) {
          let index = this.selectedServices.findIndex(obj => obj.LogServCode == "SEA_FFDR");
          if (index >= 0) {
            return true
          }
          else if (!this.previousUrl || !location.pathname.includes('manage-rates')) {
            let index = this.selectedServices.findIndex(obj => obj.LogServCode == "AIR_FFDR");
            if (index >= 0) {
              this.router.navigate(['provider/manage-rates/air']);
            }
            else {
              let index = this.selectedServices.findIndex(obj => obj.LogServCode == "TRUK");
              if (index >= 0) {
                this.router.navigate(['provider/manage-rates/ground']);
              }
              else {
                let index = this.selectedServices.findIndex(obj => obj.LogServCode == "WRHS");
                if (index >= 0) {
                  this.router.navigate(['provider/manage-rates/warehouse']);
                }
              }
            }
          }

        } else {
          this.router.navigate(['provider/dashboard']);
        }

      }
      else {
        this.router.navigate(['registration']);
      }
    }

    if (state.url == '/provider/manage-rates/air') {
      if (!this.islogOut) {
        if (this.selectedServices && this.selectedServices.length) {
          let index = this.selectedServices.findIndex(obj => obj.LogServCode == "AIR_FFDR");
          if (index >= 0) {
            this.previousUrl = state.url;
            return true
          }
        } else {
          this.router.navigate(['provider/dashboard']);
        }

      }
      else {
        this.router.navigate(['registration']);
      }
    }

    if (state.url == '/provider/manage-rates/ground') {
      if (!this.islogOut) {
        if (this.selectedServices && this.selectedServices.length) {
          let index = this.selectedServices.findIndex(obj => obj.LogServCode == "TRUK");
          if (index >= 0) {
            this.previousUrl = state.url;
            return true
          }
        } else {
          this.router.navigate(['provider/dashboard']);
        }

      }
      else {
        this.router.navigate(['registration']);
      }
    }
    if (state.url == '/provider/manage-rates/warehouse') {
      if (!this.islogOut) {
        if (this.selectedServices && this.selectedServices.length) {
          let index = this.selectedServices.findIndex(obj => obj.LogServCode == "WRHS");
          if (index >= 0) {
            this.previousUrl = state.url;
            return true
          }
          else {
            this.router.navigate(['provider/manage-rates/sea']);
          }
        } else {
          this.router.navigate(['provider/dashboard']);
        }

      }
      else {
        this.router.navigate(['registration']);
      }
    }

  }




  getloginStatus() {
    let userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo && userInfo.returnText) {
      this._sharedService.IsloggedIn.subscribe((state: any) => {
        if (state == null) {
          this.islogOut = (userInfo && Object.keys('userInfo').length) ? JSON.parse(userInfo.returnText).IsLogedOut : true;
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







// import { Injectable } from '@angular/core';
// import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, NavigationStart, NavigationEnd } from '@angular/router';
// import { Observable } from 'rxjs/Observable';
// import { SharedService } from '../../../../services/shared.service';
// import { isJSON } from '../../../../constants/globalFunctions';
// import { DashboardService } from '../dashboard/dashboard.service';
// import { HttpErrorResponse } from '@angular/common/http';

// @Injectable()
// export class ServicesGuard implements CanActivate {

//   private islogOut: boolean;
//   private previousUrl: string = undefined;
//   private selectedServices: any[];
//   private userProfile:any
//     constructor(
//       private router: Router,
//       private _sharedService: SharedService,
//       private _dashboardService: DashboardService
//   ) { 
//       let userInfo = JSON.parse(localStorage.getItem('userInfo'));
//       this.userProfile = JSON.parse(userInfo.returnText);
//   }


//   canActivate(
//     next: ActivatedRouteSnapshot,
//     state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

//     this.getloginStatus();
//       // if user go to manage rates sea page
//     if (state.url == '/provider/manage-rates/sea') {
//       if (!this.islogOut) {
//         return this.getDashboardData(this.userProfile.UserID)
//       }
//       else {
//         this.router.navigate(['registration']);
//       }
//     }

//     if (state.url == '/provider/manage-rates/air') {
//       if (!this.islogOut) {
//         return this.getDashboardData(this.userProfile.UserID)
//       }
//       else {
//         this.router.navigate(['registration']);
//       }
//     }

//     if (state.url == '/provider/manage-rates/ground') {
//       if (!this.islogOut) {
//         return this.getDashboardData(this.userProfile.UserID)
//         }
//       else {
//         this.router.navigate(['registration']);
//       }
//     }

//     if (state.url == '/provider/manage-rates/warehouse') {
//       if (!this.islogOut) {
//         return this.getDashboardData(this.userProfile.UserID)
//       }
//       else {
//         this.router.navigate(['registration']);
//       }
//     }



//   }

//   getDashboardData(id): Observable<boolean> {
//     return this._dashboardService.getdashboardDetails(id).map((res: any) => {
//       if (res.returnStatus == 'Success') {
//       if (res.returnObject && Object.keys(res.returnObject).length) {
//         if (res.returnObject.LogisticService && isJSON(res.returnObject.LogisticService)) {
//           this.selectedServices = JSON.parse(res.returnObject.LogisticService);
//             if (this.selectedServices && this.selectedServices.length) {
//               let index = this.selectedServices.findIndex(obj => obj.LogServCode == "SEA_FFDR");
//               if (index >= 0) {
//                 return true
//               }
//               else if (!this.previousUrl || !location.pathname.includes('manage-rates')) {
//                 let index = this.selectedServices.findIndex(obj => obj.LogServCode == "AIR_FFDR");
//                 if (index >= 0) {
//                   this.router.navigate(['provider/manage-rates/air']);
//                   return true
//                 }
//                 else {
//                   let index = this.selectedServices.findIndex(obj => obj.LogServCode == "TRUK");
//                   if (index >= 0) {
//                     this.router.navigate(['provider/manage-rates/ground']);
//                     return true
//                   }
//                   else {
//                     let index = this.selectedServices.findIndex(obj => obj.LogServCode == "WRHS");
//                     if (index >= 0) {
//                       this.router.navigate(['provider/manage-rates/warehouse']);
//                       return true
//                     }
//                   }
//                 }
//               }

//             } else {
//               this.router.navigate(['provider/dashboard']);
//               }

//         }
//         }
//       }
//       else{
//         return false;

//       }
//     }, (err: HttpErrorResponse) => {
//         console.log(err)
//         this.router.navigate(['provider/dashboard']);
//         return Observable.of(true);
//     })
//   }


//   getloginStatus() {
//     let userInfo = JSON.parse(localStorage.getItem('userInfo'));
//     if (userInfo && userInfo.returnText) {
//       this._sharedService.IsloggedIn.subscribe((state: any) => {
//         if (state == null) {
//           this.islogOut = (userInfo && Object.keys('userInfo').length) ? JSON.parse(userInfo.returnText).IsLogedOut : true;
//         }
//         else {
//           this.islogOut = state;
//         }
//       })
//     } else {
//       this.islogOut = true;
//     }

//   }
// }
