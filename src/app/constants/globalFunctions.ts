import { AbstractControl, ValidatorFn, FormControl } from '@angular/forms';
import { baseExternalAssets } from './base.url';
import { Base64 } from 'js-base64';
import * as moment from 'moment'
declare var Paytabs: any;


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

export const statusCode = {
  draft: 'draft',
  approved: 'approved',
  rejected: 'rejected',
  cancelled: 'cancelled',
  confirmed: 'confirmed',
  in_transit: 'in-transit',
  re_upload: 're-upload',
  completed: 'completed',
  readytoship: 'ready to ship',
  in_review: 'in-review',
  pending: 'pending'
}

export function readyForPayment(obj) {
  Paytabs("#express_checkout").expresscheckout({
    settings: {
      merchant_id: "10038289",
      customer_email: "abdur@hashmove.com",
      secret_key: "ekQNVlcQwtHZv93SClVAqo9euW1k1cKgxA4sVgjrJ1qfat8NO3ofsxtXuviwH2MeCRHx81YS3o7dSf1HjpWMXqJrV1XC3KRFCzdK",
      currency: obj.currency,
      amount: obj.dueAmount,
      title: obj.firstName + obj.lastName,
      product_names: "HashMove_Provider",
      order_id: obj.shipmentId,
      url_redirect: window.location.protocol + "//" + window.location.host + "/provider/billing?" + obj.shipmentId,
      display_customer_info: 1,
      display_billing_fields: 1,
      display_shipping_fields: 0,
      language: "en",
      redirect_on_reject: window.location.protocol + "//" + window.location.host + "/provider/billing?"+obj.shipmentId,
    }
  });
}









export const YOUTUBE_REGEX: RegExp = /^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/
export const FACEBOOK_REGEX: RegExp = /^(?:(?:http|https):\/\/)?(?:www.)?facebook.com\/(?:(?:\w)*#!\/)?(?:pages\/)?(?:[?\w\-]*\/)?(?:profile.php\?id=(?=\d.*))?([\w\-]*)?/
export const TWITTER_REGEX: RegExp = /(?:http:\/\/)?(?:www\.)?twitter\.com\/(?:(?:\w)*#!\/)?(?:pages\/)?(?:[\w\-]*\/)*([\w\-]*)/
export const LINKEDIN_REGEX: RegExp = /(http|https):\/\/?((www|\w\w)\.)?linkedin.com(\w+:{0,1}\w*@)?(\S+)(:([0-9])+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
export const INSTAGRAM_REGEX: RegExp = /(https?:\/\/(www\.)?)?instagram\.com(\/\w+\/?)/
export const URL_REGEX: RegExp = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/
export const GEN_URL: RegExp = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/;

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

export function getProviderImage(strJsonPath: string) {
  let jsonStr: any = null

  try {
    jsonStr = JSON.parse(strJsonPath)[0].ProviderLogo
  } catch (error) {
    jsonStr = ""
  }

  return jsonStr
}


export function isJSON(str) {

  if (typeof (str) !== 'string') {
    return false;
  }
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

// Object Keys Changes
export function changeCase(o, toCase) {
  var newO, origKey, newKey, value
  if (o instanceof Array) {
    return o.map(function (value) {
      if (typeof value === "object" && toCase === 'camel') {
        value = changeCase(value, 'camel')
      } else if (typeof value === "object" && toCase === 'pascal') {
        value = changeCase(value, 'pascal')
      }
      return value
    })
  } else {
    newO = {}
    for (origKey in o) {
      if (o.hasOwnProperty(origKey)) {
        if (toCase === 'camel') {
          newKey = (origKey.charAt(0).toLowerCase() + origKey.slice(1) || origKey).toString()
        } else if ('pascal') {
          newKey = (origKey.charAt(0).toUpperCase() + origKey.slice(1) || origKey).toString()
        }

        value = o[origKey]
        if (value instanceof Array || (value !== null && value.constructor === Object)) {
          if (typeof value === "object" && toCase === 'camel') {
            value = changeCase(value, 'camel')
          } else if (typeof value === "object" && toCase === 'pascal') {
            value = changeCase(value, 'pascal')
          }
        }
        newO[newKey] = value
      }
    }
  }
  return newO
}


export const removeDuplicates = (myArr, prop) => {
  return myArr.filter((obj, pos, arr) => {
    return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
  });
}

/** Gets the difference in days, month or year between two dates
  * @param  firstDate First Date
  * @param secDate Second Date
  * @param mode difference mode e.g: 'days', 'months' or 'years'
*/
export function getDateDiff(firstDate: string, secDate: string, mode: any, format: string) {
  const a = moment(firstDate, format);
  const b = moment(secDate, format);
  const test = a.diff(b, mode);
  return test + 1;
}

export function getLoggedUserData() {
  try {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    return JSON.parse(userInfo.returnText);
  } catch (error) {
    return null
  }
}

