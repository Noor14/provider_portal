import { Component, OnInit } from '@angular/core';
import { CompanyInfoService } from '../../company-info/company-info.service';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { SharedService } from '../../../../../services/shared.service';
import { Observable, Subject } from 'rxjs';
import { CommonService } from '../../../../../services/common.service';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { EMAIL_REGEX } from '../../../../../constants/globalFunctions';

@Component({
  selector: 'app-on-boarding',
  templateUrl: './on-boarding.component.html',
  styleUrls: ['./on-boarding.component.scss']
})
export class OnBoardingComponent implements OnInit {

  public debounceInput: Subject<string> = new Subject();
  public requiredFields: string = "This field is required";
  public requiredFieldsOthrLng: string = "هذه الخانة مطلوبه";
  public Globalinputfrom: any;
  public Globalinputto: any
  public serviceIds: any[] = [];
  public serviceOffered: any;

  public countryList: any;
  public countryFlagImage: string;
  public transPhoneCode : string;
  public activePhone: any;
  public activeTransPhone: any;
  public phoneCountryId: any;
  public phoneCode;
  public orgNameError: boolean;
  public transorgNameError: boolean;
  public activeOrgName: boolean;
  public activeTransOrgName: boolean;
  public phoneError: boolean;
  public translangPhoneError: boolean;

  public organizationForm: any;
  public contactInfoForm: any;
  public businessLocForm: any;
  public regForm: any;
  
  public addressAr: any;
  public addressAr2: any;
  public addressArError: boolean;
  public addressError: boolean;
  public addressArError2: boolean;
  public addressError2: boolean;
  
  public cityAr: any;
  public cityArError: boolean;
  public cityError: boolean;

  public poBoxError: boolean;
  public poBoxArError: boolean;
  public poBoxAr: any;
  
  public firstNameError: boolean;
  public transfirstNameError: boolean;
  public activeFirstName: any;
  public activeTransFirstName: any;

  public translastNameError: boolean;
  public lastNameError: boolean;
  public activeLastName: any;
  public activeTransLastName: any;
  
  public arabicNumbers: any = [
    { baseNumber: '0', arabicNumber: '۰' },
    { baseNumber: '1', arabicNumber: '۱' },
    { baseNumber: '2', arabicNumber: '۲' },
    { baseNumber: '3', arabicNumber: '۳' },
    { baseNumber: '4', arabicNumber: '۴' },
    { baseNumber: '5', arabicNumber: '۵' },
    { baseNumber: '6', arabicNumber: '۶' },
    { baseNumber: '7', arabicNumber: '۷' },
    { baseNumber: '8', arabicNumber: '۸' },
    { baseNumber: '9', arabicNumber: '۹' }
  ]
  constructor(
    private _companyInfoService: CompanyInfoService,
    private _sharedService: SharedService,
    private _commonService: CommonService,
  ) { }

  ngOnInit() {
    this.organizationForm = new FormGroup({
      orgName: new FormControl(null, [Validators.required, Validators.maxLength(100), Validators.minLength(4)]),
      transLangOrgName: new FormControl(null, [Validators.required, Validators.maxLength(100), Validators.minLength(2)]),
    });
    this.contactInfoForm = new FormGroup({
      phone: new FormControl(null, [Validators.required, Validators.pattern(/^(?!(\d)\1+(?:\1+){0}$)\d+(\d+){0}$/), Validators.minLength(7), Validators.maxLength(13)]),
      transLangPhone: new FormControl(null, [Validators.required, Validators.minLength(7), Validators.maxLength(13)]),
    });

    this.businessLocForm = new FormGroup({
      address: new FormControl(null, [Validators.required, Validators.maxLength(200), Validators.minLength(10), Validators.pattern(/^(?=.*?[a-zA-Z])[^%*$=+^<>}{]+$/)]),
      transAddress: new FormControl(null, [Validators.required, Validators.maxLength(200), Validators.minLength(10), Validators.pattern(/^(?=.*?[a-zA-Z])[^%*$=+^<>}{]+$/)]),
      address2: new FormControl(null, [Validators.maxLength(200), Validators.minLength(10), Validators.pattern(/^(?=.*?[a-zA-Z])[^%*$=+^<>}{]+$/)]),
      transAddress2: new FormControl(null, [Validators.maxLength(200), Validators.minLength(10), Validators.pattern(/^(?=.*?[a-zA-Z])[^%*$=+^<>}{]+$/)]),
      city: new FormControl(null, [Validators.required, Validators.maxLength(100), Validators.minLength(3), Validators.pattern(/^(?=.*?[a-zA-Z])[^%*$=+^<>}{]+$/)]),
      transCity: new FormControl(null, [Validators.required, Validators.maxLength(100), Validators.minLength(3), Validators.pattern(/^(?=.*?[a-zA-Z])[^%*$=+^<>}{]+$/)]),
      poBoxNo: new FormControl(null, [Validators.required, Validators.maxLength(16), Validators.minLength(4)]),
      poBoxNoAr: new FormControl(null, [Validators.required, Validators.maxLength(16), Validators.minLength(4)]),
    });


    this.regForm = new FormGroup({
      firstName: new FormControl(null, [Validators.required, Validators.pattern(/[a-zA-Z-][a-zA-Z -]*$/), Validators.minLength(2), Validators.maxLength(100)]),
      transLangfirstName: new FormControl(null, [Validators.required, Validators.minLength(2), Validators.maxLength(100)]),
      lastName: new FormControl(null, [Validators.required, Validators.pattern(/[a-zA-Z-][a-zA-Z -]*$/), Validators.minLength(2), Validators.maxLength(100)]),
      transLanglastName: new FormControl(null, [Validators.required, Validators.minLength(2), Validators.maxLength(100)]),
      email: new FormControl(null, [
        Validators.required,
        Validators.pattern(EMAIL_REGEX),
        Validators.maxLength(320)
      ]),
      transLangEmail: new FormControl(null, [
        Validators.required,
        Validators.pattern(EMAIL_REGEX),
        Validators.maxLength(320)
      ]),
      phone: new FormControl(null, [Validators.required, Validators.pattern(/^(?!(\d)\1+(?:\1+){0}$)\d+(\d+){0}$/), Validators.minLength(7), Validators.maxLength(13)]),
      transLangPhone: new FormControl(null, [Validators.required, Validators.minLength(7), Validators.maxLength(13)]),
      jobTitle: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]),
      transLangjobTitle: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]),
    });

    this._sharedService.countryList.subscribe((state: any) => {
      if (state) {
        this.countryList = state;
        // let selectedCountry = this.countryList.find(obj => obj.id == this.userProfile.CountryID);
        // this.selectPhoneCode(selectedCountry);
      }

    });
    this.getServices();
  }

  selectPhoneCode(list) {
    this.countryFlagImage = list.code;
    let description = list.desc;
    this.phoneCode = description[0].CountryPhoneCode;
    this.transPhoneCode = description[0].CountryPhoneCode_OtherLang;
    this.phoneCountryId = list.id
  }


  onModelChange(fromActive, currentActive, $controlName, source, target, $value) {
    setTimeout(() => {
      if (currentActive && !fromActive && $value) {
        this.Globalinputfrom = false;
      }
      if (fromActive == false && currentActive && this.organizationForm.controls[$controlName].errors || this.Globalinputto) {
        this._commonService.translatedLanguage(source, target, $value).subscribe((res: any) => {
          this.organizationForm.controls[$controlName].patchValue(res.data.translations[0].translatedText);
          this.Globalinputto = true;
        })
      }
      else if ($value && currentActive && source && target && fromActive == undefined) {
        this._commonService.translatedLanguage(source, target, $value).subscribe((res: any) => {
          this.organizationForm.controls[$controlName].patchValue(res.data.translations[0].translatedText);
        })
      }
      // else if(currentActive && !$value){
      //   this.fromActive(fromActive);
      // }
    }, 100)
  }

  onTransModel(fromActive, currentActive, $controlName, $value) {
    // if (!this.showTranslatedLangSide) return;
    if (currentActive && !fromActive && $value) {
      this.Globalinputto = false;
    }
    if (currentActive && fromActive == false && this.organizationForm.controls[$controlName].errors || this.Globalinputfrom) {
      this.debounceInput.next($value);
      this.debounceInput.pipe(debounceTime(400), distinctUntilChanged()).subscribe(value => {
        this._commonService.detectedLanguage(value).subscribe((res: any) => {
          let sourceLang = res.data.detections[0][0].language;
          let target = "en";
          if (sourceLang && target && value) {
            this._commonService.translatedLanguage(sourceLang, target, value).subscribe((res: any) => {
              this.organizationForm.controls[$controlName].patchValue(res.data.translations[0].translatedText);
              this.Globalinputfrom = true;
            })
          }
        })
      });
    }
    else if (currentActive && $value && fromActive == undefined) {
    // if (!this.showTranslatedLangSide) return;
      this.debounceInput.next($value);
      this.debounceInput.pipe(debounceTime(400), distinctUntilChanged()).subscribe(value => {
        this._commonService.detectedLanguage(value).subscribe((res: any) => {
          let sourceLang = res.data.detections[0][0].language;
          let target = "en";
          // if (sourceLang && target && value) {
          //   this.onModelChange(fromActive, currentActive, $controlName, sourceLang, target, value);
          // }
          if (sourceLang && target && value) {
            this._commonService.translatedLanguage(sourceLang, target, value).subscribe((res: any) => {
              this.organizationForm.controls[$controlName].patchValue(res.data.translations[0].translatedText);
            })
          }
        })
      });
    }

  }
  NumberValid(evt) {
    let charCode = (evt.which) ? evt.which : evt.keyCode
    if (charCode > 31 && (charCode < 48 || charCode > 57))
      return false;
    return true;
  }
  getServices() {
    this._companyInfoService.getServiceOffered().subscribe((res: any) => {
      if (res.returnStatus == 'Success') {
        this.serviceOffered = JSON.parse(res.returnObject);
      }
    }, (err: HttpErrorResponse) => {
      console.log(err);
    })

  }
  serviceSelection(obj, selectedService) {
    let selectedItem = selectedService.classList;
    if (this.serviceIds && this.serviceIds.length) {
      for (var i = 0; i < this.serviceIds.length; i++) {
        if (this.serviceIds[i].ServiceID == obj.ServiceID) {
          this.serviceIds.splice(i, 1);
          selectedItem.remove('active');
          return;
        }
      }

    }
    if ((this.serviceIds && !this.serviceIds.length) || (i == this.serviceIds.length)) {
      selectedItem.add('active');
      this.serviceIds.push(obj);
    }
  }
  errorValidate() {
    if (this.organizationForm.controls.orgName.status == "INVALID" && this.organizationForm.controls.orgName.touched) {
      this.orgNameError = true;
      this.transorgNameError = true;
    }
    if (this.organizationForm.controls.transLangOrgName.status == "INVALID" && this.organizationForm.controls.transLangOrgName.touched) {
      this.transorgNameError = true;
      this.orgNameError = true;
    }
    if (this.businessLocForm.controls.address.status == "INVALID" && this.businessLocForm.controls.address.touched) {
      this.addressError = true;
      this.addressArError = true;
    }
    if (this.businessLocForm.controls.transAddress.status == "INVALID" && this.businessLocForm.controls.transAddress.touched) {
      this.addressArError = true;
      this.addressError = true;
    }
    if (this.businessLocForm.controls.address2.status == "INVALID" && this.businessLocForm.controls.address2.touched) {
      this.addressError2 = true;
      this.addressArError2 = true;
    }
    if (this.businessLocForm.controls.transAddress2.status == "INVALID" && this.businessLocForm.controls.transAddress2.touched) {
      this.addressError2 = true;
      this.addressArError2 = true;
    }
    if (this.businessLocForm.controls.city.status == "INVALID" && this.businessLocForm.controls.city.touched) {
      this.cityError = true;
      this.cityArError = true;
    }
    if (this.businessLocForm.controls.transCity.status == "INVALID" && this.businessLocForm.controls.transCity.touched) {
      this.cityError = true;
      this.cityArError = true;
    }
    if (this.businessLocForm.controls.poBoxNo.status == "INVALID" && this.businessLocForm.controls.poBoxNo.touched) {
      this.poBoxError = true;
      this.poBoxArError = true;
    }
    if (this.businessLocForm.controls.poBoxNoAr.status == "INVALID" && this.businessLocForm.controls.poBoxNoAr.touched) {
      this.poBoxError = true;
      this.poBoxArError = true;
    }



    if (this.contactInfoForm.controls.phone.status == "INVALID" && this.contactInfoForm.controls.phone.touched) {
      this.phoneError = true;
      this.translangPhoneError = true;
    }
    if (this.contactInfoForm.controls.transLangPhone.status == "INVALID" && this.contactInfoForm.controls.transLangPhone.touched) {
      this.phoneError = true;
      this.translangPhoneError = true;
    }



  }
  onModelPhoneChange(fromActive, currentActive, $controlName, $value) {
    // if (!this.showTranslatedLangSide) return;
    if (currentActive && !fromActive) {
      let number = $value.split('');
      for (let i = 0; i < number.length; i++) {
        this.arabicNumbers.forEach((obj, index) => {
          if (number[i] == obj.baseNumber) {
            number.splice(i, 1, obj.arabicNumber)
          }
        })
      }
      this.contactInfoForm.controls[$controlName].patchValue(number.reverse().join(''));
    }
  }

  onModelTransPhoneChange(fromActive, currentActive, $controlName, $value) {
    // if (!this.showTranslatedLangSide) return;
    if (currentActive && !fromActive) {
      let number = $value.split('');
      for (let i = 0; i < number.length; i++) {
        this.arabicNumbers.forEach((obj, index) => {
          if (number[i] == obj.baseNumber || number[i] == obj.arabicNumber) {
            number.splice(i, 1, obj.baseNumber)
          }
        })

      }
      this.contactInfoForm.controls[$controlName].patchValue(number.join(''));
    }

  }
  oneSpaceHandler(event) {
    if (event.target.value) {
      var end = event.target.selectionEnd;
      if (event.keyCode == 32 && (event.target.value[end - 1] == " " || event.target.value[end] == " ")) {
        event.preventDefault();
        return false;
      }
    }
    else if (event.target.selectionEnd == 0 && event.keyCode == 32) {
      return false;
    }
  }
  textValidation(event) {
    const pattern = /^[a-zA-Z0-9_]*$/;
    let inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
      if (event.charCode == 0) {
        return true;
      }
      if (event.target.value) {
        var end = event.target.selectionEnd;
        if (event.charCode == 32 && (event.target.value[end - 1] == " " || event.target.value[end] == " ")) {
          event.preventDefault();
          return false;
        }
        else if (event.charCode == 32 && !pattern.test(inputChar)) {
          return true;
        }
        else {
          return false;
        }
      }
      else {
        return false;
      }
    }
    else {
      return true;
    }
  }
}
