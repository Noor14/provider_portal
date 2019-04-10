import { Injectable } from "@angular/core";
import { HttpErrorResponse } from '@angular/common/http';
import * as moment from 'moment';
import { JWTObj, UserCreationService } from "../components/pages/user-creation/user-creation.service";


@Injectable()
export class GuestService {

    private token: string = ''
    private refreshToken: string = ''
    private countryCode = 'AE'
    guestObject = {
        password: 'h@shMove123',
        loginUserID: 'support@hashmove.com',
        CountryCode: (this.countryCode) ? this.countryCode : 'DEFAULT AE',
        LoginIpAddress: "0.0.0.0",
        LoginDate: moment(Date.now()).format(),
        LoginRemarks: ""
    }

    constructor(
        private _authService: UserCreationService,
    ) { }


    public getToken() { return this.token }
    public getLclRefreshToken() { return this.refreshToken }

    public setToken($token) { this.token = $token }
    public setRefreshToken($refreshToken) { this.refreshToken = $refreshToken }


    getJwtToken() {
        let token
        if (localStorage.getItem('token')) {
            token = localStorage.getItem('token')
        } else {
            token = this.getToken()
        }
        return token
    }

    saveJwtToken($token) {
        this.setToken($token)
        setTimeout(() => {
            localStorage.setItem('token', $token);
        }, 0);
    }

    saveRefreshToken($refreshToken) {
        this.setRefreshToken($refreshToken)
        setTimeout(() => {
            localStorage.setItem('refreshToken', $refreshToken);
        }, 0);
    }

    getRefreshToken() {
        let refreshToken
        if (localStorage.getItem('refreshToken')) {
            refreshToken = localStorage.getItem('refreshToken')
        } else {
            refreshToken = this.getLclRefreshToken()
        }
        return refreshToken
    }

    removeTokens() {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        this.setToken(null)
        this.setRefreshToken(null)
    }


    load() {
        AppComponent.clearStorage()
        const _config: AppApiConfig = await this._http.get('assets/app.settings.json').toPromise() as any
        const { MAIN_API_BASE_URL, MAIN_API_BASE_EXTERNAL_URL } = _config
        setBaseApi(MAIN_API_BASE_URL);
        setBaseExternal(MAIN_API_BASE_EXTERNAL_URL)
        if (!getJwtToken() || !isUserLogin()) {
            this.countryCode = 'AE'
            const { guestObject } = this
            guestObject.CountryCode = this.countryCode

            const encObjectL: AESModel = encryptStringAES({ d1: moment(Date.now()).format().substring(0, 16), d2: JSON.stringify(guestObject) })

            return new Promise((resolve, reject) => {
                this._authService.guestLoginService(encObjectL).toPromise().then((response: AESModel) => {
                    console.log('guest-login-success:', response);

                    const decryptedData = decryptStringAES(response)
                    console.log('decryptedData:', decryptedData);
                    const { token, refreshToken } = JSON.parse(decryptedData);
                    this.token = token;
                    this.refreshToken = refreshToken;
                    setTimeout(() => {
                        this.saveJwtToken(token);
                        this.saveRefreshToken(refreshToken);
                    }, 0);
                    resolve();
                }).catch((err) => {
                    resolve();
                    console.log('error:', err);
                })
            })
        }
    }


    generateToken() {

    }

    sessionRefresh() {
        // this._authService.logoutAction()
        this.removeTokens();
        this.countryCode = 'AE';
        const { guestObject } = this;
        guestObject.CountryCode = this.countryCode;
        const encObjectL: AESModel = encryptStringAES({ d1: moment(Date.now()).format().substring(0, 16), d2: JSON.stringify(guestObject) })
        this._authService.guestLoginService(encObjectL).subscribe((response: AESModel) => {
            console.log('guest-login-success:', response);

            const decryptedData = decryptStringAES(response)
            console.log('decryptedData:', decryptedData);
            const { token, refreshToken } = JSON.parse(decryptedData);
            this.token = token;
            this.refreshToken = refreshToken;
            setTimeout(() => {
                this.saveJwtToken(token);
                this.saveRefreshToken(refreshToken);
                loading(false)
            }, 0);

            // setTimeout(() => {
            //     loading(false)
            // }, 0);
            // this.setJWTByApi(response);
        }, (error: HttpErrorResponse) => {
            console.log('error:', error);
        })
        console.clear()
    }


    setJWTByApi(response: JWTObj) {
        console.log('guest-login-success:', response);
        const { token, refreshToken } = response;
        this.token = token;
        this.refreshToken = refreshToken;
        this.saveJwtToken(token);
        this.saveRefreshToken(refreshToken);
    }
}



//fetching and updating tokens functions
export function getJwtToken() {
    return localStorage.getItem('token');
}

export function saveJwtToken(token) {
    localStorage.setItem('token', token);
}

export function saveRefreshToken(refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
}

export function getRefreshToken() {
    return localStorage.getItem('refreshToken');
}


import * as AesCryrpto from 'aes-js'
import { Buffer } from 'buffer'
import aes from 'js-crypto-aes';
import { loading } from "../constants/globalFunctions";
import { AppComponent } from "../app.component";




export function unpad(padded) {
    return padded.subarray(0, padded.byteLength - padded[padded.byteLength - 1]);
}

const keybytes = AesCryrpto.utils.utf8.toBytes('8080808080808080');



export function encryptStringAES({ d1, d2 }: AESModel): AESModel {
    const iv = AesCryrpto.utils.utf8.toBytes(d1); //Dynamic key from object as d1
    const textBytes = AesCryrpto.utils.utf8.toBytes(d2);
    let encrypted
    try {
        const aesCbc = new AesCryrpto.ModeOfOperation.cbc(keybytes, iv);
        const enc = aesCbc.encrypt(pad(textBytes))
        // const enc = await aes.encrypt(textBytes, keybytes, { name: 'AES-CBC', iv })
        encrypted = Buffer.from(enc).toString('base64')
    } catch (err) {
        console.log(err);
    }
    return { d1, d2: encrypted }
}

export function decryptStringAES({ d1, d2 }: AESModel) {
    const iv = AesCryrpto.utils.utf8.toBytes(d1); //Dynamic key from object as d1
    const encrypted = Buffer.from(d2, 'base64');
    // const decrypted = await aes.decrypt(encrypted, keybytes, { name: 'AES-CBC', iv })
    const aesCbc = new AesCryrpto.ModeOfOperation.cbc(keybytes, iv);
    const decrypted = aesCbc.decrypt(encrypted)
    const unpaddedData = unpad(decrypted)
    const decryptedText = AesCryrpto.utils.utf8.fromBytes(unpaddedData);
    return decryptedText
}

export interface AESModel {
    d1: string;
    d2: string;
}





export function isUserLogin(): boolean {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    if (!userInfo) {
        return false
    }
    const user = JSON.parse(userInfo.returnText);
    if (!user) {
        return false
    }
    if (user && user.IsLogedOut) {
        return false
    }

    if (user && !user.IsLogedOut) {
        return true
    }
}

export function pad(plaintext) {
    const padding = PADDING[(plaintext.byteLength % 16) || 0];
    const result = new Uint8Array(plaintext.byteLength + padding.length);
    result.set(plaintext);
    result.set(padding, plaintext.byteLength);
    return result;
}

// pre-define the padding values
const PADDING = [
    [16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16],
    [15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15],
    [14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14],
    [13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13],
    [12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12],
    [11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11],
    [10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
    [9, 9, 9, 9, 9, 9, 9, 9, 9],
    [8, 8, 8, 8, 8, 8, 8, 8],
    [7, 7, 7, 7, 7, 7, 7],
    [6, 6, 6, 6, 6, 6],
    [5, 5, 5, 5, 5],
    [4, 4, 4, 4],
    [3, 3, 3],
    [2, 2],
    [1]
];

