import { AbstractControl, ValidatorFn, FormControl } from '@angular/forms';
import { baseExternalAssets } from './base.url';
import { Base64 } from 'js-base64';


export const EMAIL_REGEX: RegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export const ValidateEmail = (email: string): boolean => {
  let arr = email.split('@')
  let first = arr[0]
  let second = arr[1].split('.')[0]
  if (first.length > 64) {
    return false
  }
  if (second.length > 255) {
    return false
  }
  return true
}



export function patternValidator(regexp: RegExp): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } => {
    const value = control.value;
    if (!value) {
      return null;
    }
    return !regexp.test(value) ? { 'patternInvalid': { regexp } } : null;
  };
}

export function leapYear(year) {
  return ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0);
}

export function loading(display) {
  let loader = document.getElementsByClassName("overlay")[0] as HTMLElement;
  if (display) {
    loader.classList.add('overlay-bg');
    loader.style.display = "block";
  }
  else if (!display) {
    loader.classList.remove('overlay-bg');
    loader.style.display = "none";
  }
}


export function CustomValidator(control: AbstractControl) {
  if (this.showTranslatedLangSide) {
    let companyRegexp: RegExp = /^(?=.*?[a-zA-Z])[^.]+$/;
    if (!control.value) {
      return {
        required: true
      }
    }

    //   else if (control.value.length < 3 && control.value) {
    //     if (!companyRegexp.test(control.value)) {
    //       return {
    //         pattern: true
    //       }
    //     }
    //     else {
    //       return {
    //         minlength: true
    //       }
    //     }
    //   }
    //   else if (control.value.length > 50 && control.value) {
    //     if (!companyRegexp.test(control.value)) {
    //       return {
    //         pattern: true
    //       }
    //     }
    //     else {
    //       return {
    //         maxlength: true
    //       }
    //     }

    //   }
    //   else {
    //   return false
    //  }

  }


  

};
export const YOUTUBE_REGEX: RegExp = /^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/
export const FACEBOOK_REGEX: RegExp = /^(?:(?:http|https):\/\/)?(?:www.)?facebook.com\/(?:(?:\w)*#!\/)?(?:pages\/)?(?:[?\w\-]*\/)?(?:profile.php\?id=(?=\d.*))?([\w\-]*)?/
export const TWITTER_REGEX: RegExp = /(?:http:\/\/)?(?:www\.)?twitter\.com\/(?:(?:\w)*#!\/)?(?:pages\/)?(?:[\w\-]*\/)*([\w\-]*)/
export const LINKEDIN_REGEX: RegExp = /(http|https):\/\/?((www|\w\w)\.)?linkedin.com(\w+:{0,1}\w*@)?(\S+)(:([0-9])+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
export const INSTAGRAM_REGEX: RegExp = /(https?:\/\/(www\.)?)?instagram\.com(\/\w+\/?)/
export const URL_REGEX: RegExp = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/
export const GEN_URL: RegExp = /^(?: (?: https ?| ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;

export const encryptBookingID = (bookingId: number): string => {
  const toEncrypt: string = bookingId + '00000' + bookingId
  const toSend: string = Base64.encode(toEncrypt)
  return toSend
}

export enum ImageSource {
  FROM_SERVER,
  FROM_ASSETS
}

export enum ImageRequiredSize {
  original,
  _96x96,
  _80x80,
  _48x48,
  _32x32,
  _24x24,
  _16x16,
}



export const getImagePath = (fileSource: ImageSource, fileName: string, reqSize: ImageRequiredSize): string => {

  let url = ''
  if (fileSource === ImageSource.FROM_ASSETS) {

  }

  if (fileSource === ImageSource.FROM_SERVER) {
    try {
      if (reqSize === ImageRequiredSize.original) {
        url = baseExternalAssets + fileName
      } else if (reqSize === ImageRequiredSize._96x96) {
        url = baseExternalAssets + fileName.replace("original", "96x96")
      } else if (reqSize === ImageRequiredSize._80x80) {
        url = baseExternalAssets + fileName.replace("original", "80x80")
      } else if (reqSize === ImageRequiredSize._48x48) {
        url = baseExternalAssets + fileName.replace("original", "48x48")
      } else if (reqSize === ImageRequiredSize._32x32) {
        url = baseExternalAssets + fileName.replace("original", "32x32")
      } else if (reqSize === ImageRequiredSize._24x24) {
        url = baseExternalAssets + fileName.replace("original", "24x24")
      } else if (reqSize === ImageRequiredSize._16x16) {
        url = baseExternalAssets + fileName.replace("original", "16x16")
      }
    } catch (error) {
      url = baseExternalAssets + fileName
    }
  }

  return url
}