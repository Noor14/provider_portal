import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { flatMap } from 'rxjs/operators';
import 'rxjs/add/operator/do';
import { ToastrService } from 'ngx-toastr';
import { GuestService } from '../services/jwt.injectable';
import { UserCreationService } from '../components/pages/user-creation/user-creation.service';

@Injectable()
export class Interceptor implements HttpInterceptor {
    private refreshTokenInProgress = false;
    // Refresh Token Subject tracks the current token, or is null if no token is currently
    // available (e.g. refresh pending).
    private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
        null
    );
    constructor(
        public _auth: UserCreationService,
        public _jwtService: GuestService,
        public _router: Router,
        private _toastr: ToastrService
    ) { }

    intercept(mainRequest: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        let request: HttpRequest<any>


        if (
            mainRequest.url.toLowerCase().includes('ip-api') ||
            mainRequest.url.toLowerCase().includes("resetjwt") ||
            mainRequest.url.toLowerCase().includes("guestjwt") ||
            mainRequest.url.toLowerCase().includes("stjwt_o") ||
            mainRequest.url.toLowerCase().includes("userlogout") ||
            mainRequest.url.toLowerCase().includes("google") ||
            mainRequest.url.toLowerCase().includes('validate')) {

            request = mainRequest.clone()
            if (mainRequest.url.toLowerCase().includes('refresh')) {
                request = this.addEncodeURLHeader(request)
            }
        } else {
            request = this.addAuthenticationToken(mainRequest)
            console.log(request);
            
        }


        return next.handle(request).catch(error => {

            const token: string = this._jwtService.getJwtToken()
            const refreshToken: string = this._jwtService.getRefreshToken()

            // We don't want to refresh token for some requests like login or refresh token itself
            // So we verify url and we throw an error if it's the case
            if (
                request.url.toLowerCase().includes("validate") ||
                request.url.toLowerCase().includes("resetjwt") ||
                request.url.toLowerCase().includes("guestjwt") ||
                !this._jwtService.getJwtToken()
            ) {
                // We do another check to see if refresh token failed
                // In this case we want to logout user and to redirect it to login page
                if (request.url.toLowerCase().includes("resetjwt")) {
                    // const { title, text } = sessionExpMsg
                    setTimeout(() => {
                        this._toastr.warning('Redirecting to registration page', 'Session Expired');
                    }, 0);
                    console.log('got in refresh fail');
                    this._jwtService.sessionRefresh()
                    this._router.navigate(['home']);
                }
                return Observable.throw(error);
            }

            // If error status is different than 401 we want to skip refresh token
            // So we check that and throw the error if it's the case
            console.log('status Code:', error.status);

            if (error.status !== 401) {
                return Observable.throw(error);
            }

            if (this.refreshTokenInProgress) {
                // If refreshTokenInProgress is true, we will wait until refreshTokenSubject has a non-null value
                // – which means the new token is ready and we can retry the request again
                return this.refreshTokenSubject
                    .filter(result => result !== null)
                    .take(1)
                    .switchMap(() => next.handle(this.addAuthenticationToken(request)));
            } else {
                this.refreshTokenInProgress = true;

                // Set the refreshTokenSubject to null so that subsequent API calls will wait until the new token has been retrieved
                this.refreshTokenSubject.next(null);
                const refreshObj = {
                    token,
                    refreshToken
                }

                // Call auth.revalidateToken(this is an Observable that will be returned)
                return this._auth.revalidateToken(refreshObj).flatMap((tokenResp: any) => {
                    console.log('angar agaya:', tokenResp);

                    this._jwtService.removeTokens()
                    //When the call to refreshToken completes we reset the refreshTokenInProgress to false
                    // for the next time the token needs to be refreshed
                    this.refreshTokenInProgress = false;
                    this._jwtService.saveJwtToken(tokenResp.token)
                    this._jwtService.saveRefreshToken(tokenResp.refreshToken)
                    this.refreshTokenSubject.next(tokenResp.token);
                    return next.handle(this.addAuthenticationToken(mainRequest));
                })
            }
        })
    }

    addAuthenticationToken(request) {
        // Get access token from Local Storage
        const accessToken = this._jwtService.getJwtToken();

        // If access token is null this means that user is not logged in
        // And we return the original request
        if (!accessToken) {
            return request;
        }

        // We clone the request, because the original request is immutable
        return request.clone({
            setHeaders: {
                Authorization: 'Bearer ' + this._jwtService.getJwtToken()
            }
        });
    }

    addEncodeURLHeader(request) {
        return request.clone({
            setHeaders: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });
    }
}