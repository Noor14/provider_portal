import { AbstractControl, ValidatorFn, FormControl } from '@angular/forms';





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