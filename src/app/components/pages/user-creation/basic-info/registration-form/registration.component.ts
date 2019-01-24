import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef, NgZone, state, ChangeDetectorRef, AfterViewChecked } from '@angular/core';
import { MapsAPILoader } from '@agm/core';
import { } from '@types/googlemaps';
import { UserCreationService } from '../../user-creation.service';
import { SharedService } from '../../../../../services/shared.service';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { CommonService } from '../../../../../services/common.service';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import {
  loading, CustomValidator, ValidateEmail, EMAIL_REGEX, leapYear, patternValidator,
  YOUTUBE_REGEX, FACEBOOK_REGEX, TWITTER_REGEX, LINKEDIN_REGEX, INSTAGRAM_REGEX, URL_REGEX, GEN_URL
} from '../../../../../constants/globalFunctions';
import { BasicInfoService } from '../basic-info.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router'
import { Base64 } from 'js-base64';
@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit, AfterViewChecked {
  public debounceInput: Subject<string> = new Subject();
  public requiredFields: string = "This field is required";
  public requiredFieldsOthrLng: string = "هذه الخانة مطلوبه";
  public Globalinputfrom: any;
  public Globalinputto: any
  public serviceIds: any[] = [];
  public serviceOffered: any;
  public selectedjobTitle: any
  public jobTitles: any
  public transLangEmail: any;

  public selected_country: any;
  public countryList: any;
  public countryFlagImage: string;
  public transPhoneCode: string;
  public activePhone: any;
  public activeTransPhone: any;
  public phoneCountryId: any;
  public phoneCode;

  public mobileCountFlagImage: string;
  public mobileCode;
  public transmobileCode;

  public orgNameError: boolean;
  public transorgNameError: boolean;
  public activeOrgName: boolean;
  public activeTransOrgName: boolean;
  public phoneError: boolean;
  public translangPhoneError: boolean;

  public businessForm: any;
  public personalInfoForm: any;

  public addressAr: any;
  public addressArError: boolean;
  public addressError: boolean;


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

  public jobTitleError: boolean;
  public transjobTitleError: boolean;
  public activejobTitle: any;
  public activeTransjobTitle: any;


  public transEmailError: boolean;
  public EmailError: boolean;
  public telephoneError: boolean;
  public translangtelephoneError: boolean;
  public activetelephone: boolean;
  public activeTransTelephone: boolean;


  public selectedSocialsite: any;
  public socialSites;
  public socialInputValidate;
  public socialLink: any;
  public location: any = {
    lat: undefined,
    lng: undefined
  }
  public zoomlevel: number = 5;
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
  public onRegistrationForm;
  public showTranslatedLangSide;

 constructor(
    private _toastr: ToastrService,
    private _userCreationService: UserCreationService,
    private _commonService: CommonService,
    private _sharedService: SharedService,
    private mapsAPILoader: MapsAPILoader,
    private _router: Router,
    private ngZone: NgZone,
    private cdRef: ChangeDetectorRef,
   private _basicInfoService: BasicInfoService,
  ) { }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }
  ngOnInit() {
    this.businessForm = new FormGroup({
      orgName: new FormControl(null, [Validators.required, Validators.maxLength(100), Validators.minLength(4)]),
      transLangOrgName: new FormControl(null, [CustomValidator.bind(this), Validators.maxLength(100), Validators.minLength(2)]),
      phone: new FormControl(null, [Validators.required, Validators.pattern(/^(?!(\d)\1+(?:\1+){0}$)\d+(\d+){0}$/), Validators.minLength(7), Validators.maxLength(13)]),
      transLangPhone: new FormControl(null, [CustomValidator.bind(this), Validators.minLength(7), Validators.maxLength(13)]),
      address: new FormControl(null, [Validators.required, Validators.maxLength(200), Validators.minLength(10), Validators.pattern(/^(?=.*?[a-zA-Z])[^%*$=+^<>}{]+$/)]),
      transAddress: new FormControl(null, [CustomValidator.bind(this), Validators.maxLength(200), Validators.minLength(10), Validators.pattern(/^(?=.*?[a-zA-Z])[^%*$=+^<>}{]+$/)]),
      city: new FormControl(null, [Validators.required, Validators.maxLength(100), Validators.minLength(3), Validators.pattern(/^(?=.*?[a-zA-Z])[^%*$=+^<>}{]+$/)]),
      transCity: new FormControl(null, [CustomValidator.bind(this), Validators.maxLength(100), Validators.minLength(3), Validators.pattern(/^(?=.*?[a-zA-Z])[^%*$=+^<>}{]+$/)]),
      poBoxNo: new FormControl(null, [Validators.maxLength(16), Validators.minLength(4)]),
      poBoxNoAr: new FormControl(null, [Validators.maxLength(16), Validators.minLength(4)]),
      socialUrl: new FormControl(null)
    });
    this.personalInfoForm = new FormGroup({
      firstName: new FormControl(null, [Validators.required, Validators.pattern(/[a-zA-Z-][a-zA-Z -]*$/), Validators.minLength(2), Validators.maxLength(100)]),
      transLangfirstName: new FormControl(null, [CustomValidator.bind(this), Validators.minLength(2), Validators.maxLength(100)]),
      lastName: new FormControl(null, [Validators.required, Validators.pattern(/[a-zA-Z-][a-zA-Z -]*$/), Validators.minLength(2), Validators.maxLength(100)]),
      transLanglastName: new FormControl(null, [CustomValidator.bind(this), Validators.minLength(2), Validators.maxLength(100)]),
      jobTitle: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]),
      transLangjobTitle: new FormControl('', [CustomValidator.bind(this), Validators.minLength(3), Validators.maxLength(100)]),
      email: new FormControl(null, [
        Validators.required,
        Validators.pattern(EMAIL_REGEX),
        Validators.maxLength(320)
      ]),
      transLangEmail: new FormControl(null, [
        CustomValidator.bind(this),
        Validators.pattern(EMAIL_REGEX),
        Validators.maxLength(320)
      ]),
      telephone: new FormControl(null, [Validators.required, Validators.pattern(/^(?!(\d)\1+(?:\1+){0}$)\d+(\d+){0}$/), Validators.minLength(7), Validators.maxLength(13)]),
      transLangtelephone: new FormControl(null, [CustomValidator.bind(this), Validators.minLength(7), Validators.maxLength(13)]),
    });


    this._sharedService.countryList.subscribe((state: any) => {
      if (state) {
        this.countryList = state;
        // let selectedCountry = this.countryList.find(obj => obj.id == this.userProfile.CountryID);
        // this.selectPhoneCode(selectedCountry);
      }

    });

    this._sharedService.getLocation.subscribe((state: any) => {
      if (state && state.country) {
        let obj = {
          title: state.country
        };
        this.getMapLatlng(obj);
      }
    })
    this.getsocialList();

  }
  getsocialList() {
    this._basicInfoService.socialList().subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        this.socialLink = res.returnObject;
        this.selectedSocialsite = this.socialLink[this.socialLink.length - 1];
        if (this.selectedSocialsite.socialMediaPortalsID === 105) {
          this.businessForm.controls['socialUrl'].setValidators([patternValidator(GEN_URL)]);
        }
      }
    })
  }
  
  getListJobTitle(id) {
    this._basicInfoService.getjobTitles(id).subscribe((res: any) => {
      if (res.returnStatus == 'Success') {
        this.jobTitles = res.returnObject;
        this.businessForm.reset();
        this.personalInfoForm.reset();
      }
    }, (err: HttpErrorResponse) => {
      console.log(err);
    })
  }
  
  getMapLatlng(country) {
    this._userCreationService.getLatlng(country.title).subscribe((res: any) => {
      if (res.status == "OK") {
        this.location = res.results[0].geometry.location;
        if (country.id) {
          let selectedCountry = this.countryList.find(obj => obj.title.toLowerCase() == country.title.toLowerCase());
          // this.selectedLangIdbyCountry = selectedCountry.desc[0].LanguageID;
          this.selectPhoneCode(selectedCountry);
          this.selectTelCode(selectedCountry);
          this.countryWiseMaping(country);
          this.getListJobTitle(country.id);
          this.getCompanyActivities();
        }
      }
    }, (err: HttpErrorResponse) => {
      console.log(err);
    })
  }

  countryWiseMaping(country){
    if (country && country.id){
    this.showTranslatedLangSide = (country.desc[0].RegionCode == 'MET') ? true : false;
      this.transLangEmail = '';
     this.selectedjobTitle = undefined;
    this.businessForm.reset();
    this.personalInfoForm.reset();
    // this.getlabelsDescription();
    this.onRegistrationForm = true;
    }
     else {
      this.onRegistrationForm = false;
    }
  }
  selectCountry(country) {
    if (country && country.id) {
      this.getMapLatlng(country);
    }
  }
  selectedSocialLink(obj) {
    this.selectedSocialsite = obj;
    this.businessForm.controls['socialUrl'].reset();
    if (obj.socialMediaPortalsID === 100) {
      this.businessForm.controls['socialUrl'].setValidators([patternValidator(FACEBOOK_REGEX)]);
      this.socialLinkValidate()
    }
    else if (obj.socialMediaPortalsID === 101) {
      this.businessForm.controls['socialUrl'].setValidators([patternValidator(TWITTER_REGEX)]);
      this.socialLinkValidate()
    } else if (obj.socialMediaPortalsID === 102) {
      this.businessForm.controls['socialUrl'].setValidators([patternValidator(INSTAGRAM_REGEX)]);
      this.socialLinkValidate()
    } else if (obj.socialMediaPortalsID === 103) {
      this.businessForm.controls['socialUrl'].setValidators([patternValidator(LINKEDIN_REGEX)]);
      this.socialLinkValidate()
    } else if (obj.socialMediaPortalsID === 104) {
      this.businessForm.controls['socialUrl'].setValidators([patternValidator(YOUTUBE_REGEX)]);
      this.socialLinkValidate()
    }
    else {
      this.businessForm.controls['socialUrl'].setValidators([patternValidator(GEN_URL)]);
      this.socialLinkValidate()
    }
  }
  socialLinkValidate() {

    if (this.selectedSocialsite && this.businessForm.controls['socialUrl'].value && this.businessForm.controls['socialUrl'].status === 'INVALID') {
      // let index = this.selectedSocialsite.title.toLowerCase().indexOf(this.socialSites.toLowerCase());
      this.socialInputValidate = 'Your social url is not valid';
    }
    else if (!this.businessForm.controls['socialUrl'].value) {
      this.socialInputValidate = '';
    }
    else {
      this.socialInputValidate = '';
    }

  }


  selectPhoneCode(list) {
    this.countryFlagImage = list.code;
    let description = list.desc;
    this.phoneCode = description[0].CountryPhoneCode;
    this.transPhoneCode = description[0].CountryPhoneCode_OtherLang;
    // this.phoneCountryId = list.id
  }

  selectTelCode(list) {
    this.mobileCountFlagImage = list.code;
    let description = list.desc;
    this.mobileCode = description[0].CountryPhoneCode;
    this.transmobileCode = description[0].CountryPhoneCode_OtherLang;
    this.phoneCountryId = list.id
  }
  onModelChange(fromActive, currentActive, $controlName, source, target, $value) {
    if (!this.showTranslatedLangSide) return;
    setTimeout(() => {
      if (currentActive && !fromActive && $value) {
        this.Globalinputfrom = false;
      }
      if (fromActive == false && currentActive && this.businessForm.controls[$controlName].errors || this.Globalinputto) {
        this._commonService.translatedLanguage(source, target, $value).subscribe((res: any) => {
          this.businessForm.controls[$controlName].patchValue(res.data.translations[0].translatedText);
          this.Globalinputto = true;
        })
      }
      else if ($value && currentActive && source && target && fromActive == undefined) {
        this._commonService.translatedLanguage(source, target, $value).subscribe((res: any) => {
          this.businessForm.controls[$controlName].patchValue(res.data.translations[0].translatedText);
        })
      }
      // else if(currentActive && !$value){
      //   this.fromActive(fromActive);
      // }
    }, 100)
  }

  onTransModel(fromActive, currentActive, $controlName, $value) {
    if (!this.showTranslatedLangSide) return;
    if (currentActive && !fromActive && $value) {
      this.Globalinputto = false;
    }
    if (currentActive && fromActive == false && this.businessForm.controls[$controlName].errors || this.Globalinputfrom) {
      this.debounceInput.next($value);
      this.debounceInput.pipe(debounceTime(400), distinctUntilChanged()).subscribe(value => {
        this._commonService.detectedLanguage(value).subscribe((res: any) => {
          let sourceLang = res.data.detections[0][0].language;
          let target = "en";
          if (sourceLang && target && value) {
            this._commonService.translatedLanguage(sourceLang, target, value).subscribe((res: any) => {
              this.businessForm.controls[$controlName].patchValue(res.data.translations[0].translatedText);
              this.Globalinputfrom = true;
            })
          }
        })
      });
    }
    else if (currentActive && $value && fromActive == undefined) {
      if (!this.showTranslatedLangSide) return;
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
              this.businessForm.controls[$controlName].patchValue(res.data.translations[0].translatedText);
            })
          }
        })
      });
    }

  }

  onNameModelChange(fromActive, currentActive, $controlName, source, target, $value) {
    if (!this.showTranslatedLangSide) return;
    setTimeout(() => {
      if (currentActive && !fromActive && $value) {
        this.Globalinputfrom = false;
      }
      if (fromActive == false && currentActive && this.personalInfoForm.controls[$controlName].errors || this.Globalinputto) {
        this._commonService.translatedLanguage(source, target, $value).subscribe((res: any) => {
          this.personalInfoForm.controls[$controlName].patchValue(res.data.translations[0].translatedText);
          this.Globalinputto = true;
        })
      }
      else if ($value && currentActive && source && target && fromActive == undefined) {
        this._commonService.translatedLanguage(source, target, $value).subscribe((res: any) => {
          this.personalInfoForm.controls[$controlName].patchValue(res.data.translations[0].translatedText);

        })
      }
      // else if(currentActive && !$value){
      //   this.fromActive(fromActive);
      // }
    }, 100)
  }

  onTransNameModel(fromActive, currentActive, $controlName, $value) {
    if (!this.showTranslatedLangSide) return;
    if (currentActive && !fromActive && $value) {
      this.Globalinputto = false;
    }
    if (currentActive && fromActive == false && this.personalInfoForm.controls[$controlName].errors || this.Globalinputfrom) {
      this.debounceInput.next($value);
      this.debounceInput.pipe(debounceTime(400), distinctUntilChanged()).subscribe(value => {
        this._commonService.detectedLanguage(value).subscribe((res: any) => {
          let sourceLang = res.data.detections[0][0].language;
          let target = "en";
          if (sourceLang && target && value) {
            this._commonService.translatedLanguage(sourceLang, target, value).subscribe((res: any) => {
              this.personalInfoForm.controls[$controlName].patchValue(res.data.translations[0].translatedText);
              this.Globalinputfrom = true;
            })
          }
        })
      });
    }
    else if (currentActive && $value && fromActive == undefined) {
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
              this.personalInfoForm.controls[$controlName].patchValue(res.data.translations[0].translatedText);
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
  getCompanyActivities() {
    this._basicInfoService.getServiceOffered().subscribe((res: any) => {
      if (res.returnStatus == 'Success') {
        this.serviceOffered = res.returnObject;
      }
    }, (err: HttpErrorResponse) => {
      console.log(err);
    })

  }
  serviceSelection(obj, selectedService) {
    let selectedItem = selectedService.classList;
    if (this.serviceIds && this.serviceIds.length) {
      for (var i = 0; i < this.serviceIds.length; i++) {
        if (this.serviceIds[i] == obj.logServID) {
          this.serviceIds.splice(i, 1);
          selectedItem.remove('active');
          return;
        }
      }

    }
    if ((this.serviceIds && !this.serviceIds.length) || (i == this.serviceIds.length)) {
      selectedItem.add('active');
      this.serviceIds.push(obj.logServID);
    }
  }
  errorValidate() {
    if (this.businessForm.controls.orgName.status == "INVALID" && this.businessForm.controls.orgName.dirty) {
      this.orgNameError = true;
      this.transorgNameError = true;
    }
    if (this.businessForm.controls.transLangOrgName.status == "INVALID" && this.businessForm.controls.transLangOrgName.dirty) {
      this.transorgNameError = true;
      this.orgNameError = true;
    }
    if (this.businessForm.controls.address.status == "INVALID" && this.businessForm.controls.address.dirty) {
      this.addressError = true;
      this.addressArError = true;
    }
    if (this.businessForm.controls.transAddress.status == "INVALID" && this.businessForm.controls.transAddress.dirty) {
      this.addressArError = true;
      this.addressError = true;
    }

    if (this.businessForm.controls.city.status == "INVALID" && this.businessForm.controls.city.dirty) {
      this.cityError = true;
      this.cityArError = true;
    }
    if (this.businessForm.controls.transCity.status == "INVALID" && this.businessForm.controls.transCity.dirty) {
      this.cityError = true;
      this.cityArError = true;
    }
    if (this.businessForm.controls.poBoxNo.status == "INVALID" && this.businessForm.controls.poBoxNo.dirty) {
      this.poBoxError = true;
      this.poBoxArError = true;
    }
    if (this.businessForm.controls.poBoxNoAr.status == "INVALID" && this.businessForm.controls.poBoxNoAr.dirty) {
      this.poBoxError = true;
      this.poBoxArError = true;
    }

    if (this.businessForm.controls.phone.status == "INVALID" && this.businessForm.controls.phone.dirty) {
      this.phoneError = true;
      this.translangPhoneError = true;
    }
    if (this.businessForm.controls.transLangPhone.status == "INVALID" && this.businessForm.controls.transLangPhone.dirty) {
      this.phoneError = true;
      this.translangPhoneError = true;
    }
    if (this.personalInfoForm.controls.firstName.status == "INVALID" && this.personalInfoForm.controls.firstName.dirty) {
      this.firstNameError = true;
      this.transfirstNameError = true;
    }
    if (this.personalInfoForm.controls.transLangfirstName.status == "INVALID" && this.personalInfoForm.controls.transLangfirstName.dirty) {
      this.transfirstNameError = true;
      this.firstNameError = true;
    }
    if (this.personalInfoForm.controls.lastName.status == "INVALID" && this.personalInfoForm.controls.lastName.dirty) {
      this.lastNameError = true;
      this.translastNameError = true;
    }
    if (this.personalInfoForm.controls.transLanglastName.status == "INVALID" && this.personalInfoForm.controls.transLanglastName.dirty) {
      this.translastNameError = true;
      this.lastNameError = true;
    }
    if (this.personalInfoForm.controls.jobTitle.status == "INVALID" && this.personalInfoForm.controls.jobTitle.dirty) {
      this.jobTitleError = true;
      this.transjobTitleError = true;
    }
    if (this.personalInfoForm.controls.transLangjobTitle.status == "INVALID" && this.personalInfoForm.controls.transLangjobTitle.dirty) {
      this.transjobTitleError = true;
      this.jobTitleError = true;
    }
    if (this.personalInfoForm.controls.telephone.status == "INVALID" && this.personalInfoForm.controls.telephone.dirty) {
      this.telephoneError = true;
      this.translangtelephoneError = true;
    }
    if (this.personalInfoForm.controls.transLangtelephone.status == "INVALID" && this.personalInfoForm.controls.transLangtelephone.dirty) {
      this.translangtelephoneError = true;
      this.telephoneError = true;
    }
    if (this.personalInfoForm.controls.email.status == "INVALID" && this.personalInfoForm.controls.email.dirty) {
      this.EmailError = true;
      this.transEmailError = true;
    }
    if (this.personalInfoForm.controls.transLangEmail.status == "INVALID" && this.personalInfoForm.controls.transLangEmail.dirty) {
      this.transEmailError = true;
      this.EmailError = true;
    }
  }
  onModelPhoneChange(fromActive, currentActive, $controlName, $value) {
    if (!this.showTranslatedLangSide) return;
    if (currentActive && !fromActive) {
      let number = $value.split('');
      for (let i = 0; i < number.length; i++) {
        this.arabicNumbers.forEach((obj, index) => {
          if (number[i] == obj.baseNumber) {
            number.splice(i, 1, obj.arabicNumber)
          }
        })
      }
      this.businessForm.controls[$controlName].patchValue(number.reverse().join(''));
    }
  }

  onModelTransPhoneChange(fromActive, currentActive, $controlName, $value) {
    if (!this.showTranslatedLangSide) return;
    if (currentActive && !fromActive) {
      let number = $value.split('');
      for (let i = 0; i < number.length; i++) {
        this.arabicNumbers.forEach((obj, index) => {
          if (number[i] == obj.baseNumber || number[i] == obj.arabicNumber) {
            number.splice(i, 1, obj.baseNumber)
          }
        })

      }
      this.businessForm.controls[$controlName].patchValue(number.join(''));
    }

  }


  onModelTelephoneChange(fromActive, currentActive, $controlName, $value) {
    if (!this.showTranslatedLangSide) return;
    if (currentActive && !fromActive) {
      let number = $value.split('');
      for (let i = 0; i < number.length; i++) {
        this.arabicNumbers.forEach((obj, index) => {
          if (number[i] == obj.baseNumber) {
            number.splice(i, 1, obj.arabicNumber)
          }
        })
      }
      this.personalInfoForm.controls[$controlName].patchValue(number.reverse().join(''));
    }
  }

  onModelTransTelephoneChange(fromActive, currentActive, $controlName, $value) {
    if (!this.showTranslatedLangSide) return;
    if (currentActive && !fromActive) {
      let number = $value.split('');
      for (let i = 0; i < number.length; i++) {
        this.arabicNumbers.forEach((obj, index) => {
          if (number[i] == obj.baseNumber || number[i] == obj.arabicNumber) {
            number.splice(i, 1, obj.baseNumber)
          }
        })

      }
      this.personalInfoForm.controls[$controlName].patchValue(number.join(''));
    }

  }

  onModeljobtitle(fromActive, currentActive, $controlName, source, target, $value) {
    if (!this.showTranslatedLangSide) return;
    setTimeout(() => {
      if (typeof this.selectedjobTitle == 'object') return;
      if ($value && currentActive && source && target && !fromActive) {
        this._commonService.translatedLanguage(source, target, $value).subscribe((res: any) => {
          this.personalInfoForm.controls[$controlName].patchValue(res.data.translations[0].translatedText);
          let obj = {
            baseLanguage: $value,
            otherLanguage: res.data.translations[0].translatedText,
          }
          this.selectedjobTitle = obj
        })
      }

    }, 200)
  }
  onTransModeljobTitle(fromActive, currentActive, $controlName, $value) {
    if (!this.showTranslatedLangSide) return;
    setTimeout(() => {
      if (typeof this.selectedjobTitle == 'object') return;
      if (currentActive && $value && !fromActive) {
        this.debounceInput.next($value);
        this.debounceInput.pipe(debounceTime(400), distinctUntilChanged()).subscribe(value => {
          this._commonService.detectedLanguage(value).subscribe((res: any) => {
            let sourceLang = res.data.detections[0][0].language;
            let target = "en";
            if (sourceLang && target && value) {
              this._commonService.translatedLanguage(sourceLang, target, value).subscribe((res: any) => {
                this.personalInfoForm.controls[$controlName].patchValue(res.data.translations[0].translatedText);
                let obj = {
                  baseLanguage: res.data.translations[0].translatedText,
                  otherLanguage: $value
                }
                this.selectedjobTitle = obj
              })
            }
          })
        });
      }
    }, 200)
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
  spaceHandler(event) {
    if (event.charCode == 32) {
      event.preventDefault();
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

  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      map(term => (!term || term.length < 3) ? []
        : this.countryList.filter(v => v.title.toLowerCase().indexOf(term.toLowerCase()) > -1))
    )
  formatter = (x: { title: string }) => x.title;

  jobSearch = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      map(term => (!term || term.length < 3) ? []
        : this.jobTitles.filter(v => v.baseLanguage.toLowerCase().indexOf(term.toLowerCase()) > -1))
    )
  formatterjob = (x: { baseLanguage: string }) => x.baseLanguage;

  jobSearchOtherLng = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      map((term: string) => (!term || term.length < 3) ? []
        : this.jobTitles.filter(v => v.baseLanguage.toLowerCase().indexOf(term.toLowerCase()) > -1 || (v.otherLanguage && v.otherLanguage.indexOf(term) > -1))))


  formatterjobOtherLng = (x: { otherLanguage: string }) => x.otherLanguage;

  registration() {
    loading(true);
    let valid: boolean = ValidateEmail(this.personalInfoForm.value.email);
    if (this.businessForm.invalid || this.personalInfoForm.invalid || !this.serviceIds.length) {
      loading(false);
      (!this.serviceIds.length) ? this._toastr.error('Please select company activities') : this._toastr.error('Some thing missing', 'Failed');
      return;
    }
    else if (!valid) {
      this._toastr.error('Invalid email entered.', 'Failed');
      loading(false);
      return
    }
    let UserObjectBL = {
      primaryEmail: this.personalInfoForm.value.email,
      firstName: this.personalInfoForm.value.firstName,
      lastName: this.personalInfoForm.value.lastName,
      primaryPhone: this.personalInfoForm.value.telephone,
      countryPhoneCode: this.mobileCode,
      phoneCodeCountryID: this.phoneCountryId,
      jobTitle: (typeof this.selectedjobTitle === "object") ? this.selectedjobTitle.baseLanguage : this.personalInfoForm.value.jobTitle,
    }
    let UserObjectOL = {
      languageID: this.selected_country.id,
      firstName: this.personalInfoForm.value.transLangfirstName,
      lastName: this.personalInfoForm.value.transLanglastName,
      jobTitle: (typeof this.selectedjobTitle === "object") ? this.selectedjobTitle.otherLanguage : this.personalInfoForm.value.transLangjobTitle,
      primaryPhone: this.personalInfoForm.value.transLangtelephone + this.transmobileCode,
    }
    let CompanyObjectOL = {
      companyNameOL: this.businessForm.value.transLangOrgName,
      companyPhone: this.businessForm.value.transLangPhone + this.transPhoneCode,
      POBox: (this.businessForm.value.poBoxNoAr) ? this.businessForm.value.poBoxNoAr : null,
      City: this.businessForm.value.transCity,
      languageID: this.selected_country.id
    }
    let CompanyObjectBL = {
      companyName: this.businessForm.value.orgName,
      companyAddress: this.businessForm.value.address,
      companyPhone: this.phoneCode + this.businessForm.value.phone,
      POBox: (this.businessForm.value.poBoxNo) ? this.businessForm.value.poBoxNo : null,
      City: this.businessForm.value.city
    }

    let obj = {
      logisticServiceID: this.serviceIds,
      countryID: this.selected_country.id,
      socialMediaPortalsID: (this.selectedSocialsite && Object.keys(this.selectedSocialsite).length && this.socialSites) ? this.selectedSocialsite.socialMediaPortalsID : null,
      linkURL: (this.selectedSocialsite && Object.keys(this.selectedSocialsite).length && this.socialSites) ? this.socialSites : null,
      companyOL: (this.showTranslatedLangSide) ? CompanyObjectOL : null,
      companyBL: CompanyObjectBL,
      userBL: UserObjectBL,
      userOL: (this.showTranslatedLangSide) ? UserObjectOL : null,
    }
    this._basicInfoService.createProviderAccount(obj).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        this._toastr.success(res.returnText, '');
        let key = Base64.encode(res.returnObject.userID);
        this._router.navigate(['/password', key])
        loading(false);
      }
      else {
        loading(false);
        this._toastr.error(res.returnText, '');
      }
    }, (err: HttpErrorResponse) => {
      loading(false);
      console.log(err);
    })
  }
}

