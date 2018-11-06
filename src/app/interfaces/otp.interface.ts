
export interface otpObj {
    otpid: number;
    key: string;
    firstName: string;
    firstNameOL: string;
    primaryEmail: string;
    otpCode: string;
    regionCode: string;
    status: string;
    expiry: Date;
    redirectUrl: string;
    timer: number;
    userID: number;
    languageID: number;
}


export interface otpObjResend {
    otpid: number;
    key: string;
    firstName: string;
    firstNameOL: string;
    primaryEmail: string;
    otpCode: string;
    regionCode: string;
    status: string;
    expiry: Date;
    redirectUrl: string;
    timer: number;
    userID: number;
    languageID: number;
}

