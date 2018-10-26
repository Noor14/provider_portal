import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs/Rx';
import 'rxjs/add/operator/do';
import { flatMap } from 'rxjs/operators';
import { UserService } from '../components/pages/user/user.service';
@Injectable()
export class Interceptor implements HttpInterceptor {
    private refreshTokenInProgress = false;
    // Refresh Token Subject tracks the current token, or is null if no token is currently
    // available (e.g. refresh pending).
    private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
        null
    );
    constructor(public _auth: UserService) { }

    intercept(mainRequest: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        let request: HttpRequest<any>

        if (mainRequest.url.toLowerCase().includes('refresh') || mainRequest.url.toLowerCase().includes('ip-api') || mainRequest.url.toLowerCase().includes('google')) {
            request = mainRequest.clone()
            if (mainRequest.url.toLowerCase().includes('refresh')) {
                request = this.addEncodeURLHeader(request)
            }
        } else {
            request = this.addAuthenticationToken(mainRequest)
        }


        return next.handle(request).catch(error => {

            const token: string = this._auth.getJwtToken()
            const refreshToken: string = this._auth.getRefreshToken()

            // We don't want to refresh token for some requests like login or refresh token itself
            // So we verify url and we throw an error if it's the case
            if (
                request.url.toLocaleLowerCase().includes("refresh") ||
                request.url.includes("login")
            ) {
                // We do another check to see if refresh token failed
                // In this case we want to logout user and to redirect it to login page
                if (request.url.includes("refreshtoken")) {
                    // this.auth.logout();
                }

                return Observable.throw(error);
            }

            // If error status is different than 401 we want to skip refresh token
            // So we check that and throw the error if it's the case
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

                // Call auth.revalidateToken(this is an Observable that will be returned)
                return this._auth.revalidateToken(token, refreshToken).flatMap((tokenResp: any) => {
                    console.log('angar agaya');

                    //When the call to refreshToken completes we reset the refreshTokenInProgress to false
                    // for the next time the token needs to be refreshed
                    this.refreshTokenInProgress = false;
                    this.refreshTokenSubject.next(tokenResp.token);
                    this._auth.saveJwtToken(tokenResp.token)
                    this._auth.saveRefreshToken(tokenResp.refreshToken)
                    return next.handle(this.addAuthenticationToken(mainRequest));
                })
            }
        })
    }

    addAuthenticationToken(request) {
        // Get access token from Local Storage
        const accessToken = this._auth.getJwtToken();

        // If access token is null this means that user is not logged in
        // And we return the original request
        if (!accessToken) {
            return request;
        }

        // We clone the request, because the original request is immutable
        return request.clone({
            setHeaders: {
                Authorization: 'Bearer ' + this._auth.getJwtToken()
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