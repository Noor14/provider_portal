import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef, NgZone, state } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MapsAPILoader } from '@agm/core';
import { Router } from '@angular/router';
import { } from '@types/googlemaps';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { CustomValidator, ValidateEmail, EMAIL_REGEX } from '../../../../../constants/globalFunctions'
import { UserService } from '../../user.service';
import { UserCreationService } from '../user-creation.service';
import { SharedService } from '../../../../../services/shared.service';
import { CommonService } from '../../../../../services/common.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {
  public selectedjobTitle:any
  public debounceInput: Subject<string> = new Subject();
  public showTranslatedLangSide: boolean;
  public phoneCountryId: any
  public phoneCode: string;
  public transPhoneCode: string;
  public countryFlagImage: string;
  public accountId: number;
  public countryList: any[];
  public accountSetup: any;
  public jobTitles: any;
  public zoomlevel: number = 5;
  public registrationForm: boolean;
  public regForm;
  public selectedRegion = {
    id: undefined,
    code: undefined,
    title: undefined,
  }
  public location = {
    lat: undefined,
    lng: undefined
  }
  public selectedLangIdbyCountry:any;

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


  // model binding

  public transLangEmail: any;


  // form Field Validtaions boolean variable
  public requiredFields: string = "This field is required";
  public requiredFieldsOthrLng: string = "هذه الخانة مطلوبه";
  public firstNameError: boolean;
  public lastNameError: boolean;
  public phoneError: boolean;
  public jobTitleError: boolean;
  public EmailError: boolean;
  public transfirstNameError: boolean;
  public translastNameError: boolean;
  public transjobTitleError: boolean;
  public translangPhoneError: boolean;
  public transEmailError: boolean;

  // when active on inputs
  public activeFirstName: any;
  public activeTransFirstName: any;
  public activeLastName: any;
  public activeTransLastName: any;
  public activejobTitle: any;
  public activeTransjobTitle: any;
  public activePhone: any;
  public activeTransPhone: any;



  // global Input
  public Globalinputfrom: any;
  public Globalinputto: any;


  public lblAccSetupBaseLang: string;
  public lblAccSetupOtherLang: string;
  public lblPersonalInfoBaseLang: string;
  public lblPersonalInfoOtherLang: string;
  public lblContactDetailBaseLang: string;
  public lblContactDetailOtherLang: string;

  public lblFormfirstNameBaseLang: string;
  public lblFormfirstNameOtherLang: string;
  public lblFormlastNameBaseLang: string;
  public lblFormlastNameOtherLang: string;
  public lblFormjobTitleBaseLang: string;
  public lblFormjobTitleOtherLang: string;
  public lblFormMobileBaseLang: string;
  public lblFormMobileOtherLang: string;
  public lblFormEmailBaseLang: string;
  public lblFormEmailOtherLang: string;
  public emailInfoTextBaselang: string;
  public emailInfoTextOtherlang: string;
  public regBtnBaseLang: string;
  public regBtnOtherLang: string;



  constructor(
    private _toastr: ToastrService,
    private _userService: UserService,
    private _commonService: CommonService,
    private _sharedService: SharedService,
    private _userCreationService: UserCreationService,
    private mapsAPILoader: MapsAPILoader,
    private _router: Router,
    private ngZone: NgZone) { }

  ngOnInit() {

    this._sharedService.formProgress.next(0);

    this.regForm = new FormGroup({
      firstName: new FormControl(null, [Validators.required, Validators.pattern(/[a-zA-Z-][a-zA-Z -]*$/), Validators.minLength(2), Validators.maxLength(100)]),
      transLangfirstName: new FormControl(null, [CustomValidator.bind(this), Validators.minLength(2), Validators.maxLength(100)]),
      lastName: new FormControl(null, [Validators.required, Validators.pattern(/[a-zA-Z-][a-zA-Z -]*$/), Validators.minLength(2), Validators.maxLength(100)]),
      transLanglastName: new FormControl(null, [CustomValidator.bind(this), Validators.minLength(2), Validators.maxLength(100)]),
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
      phone: new FormControl(null, [Validators.required, Validators.pattern(/^(?!(\d)\1+(?:\1+){0}$)\d+(\d+){0}$/), Validators.minLength(7), Validators.maxLength(9)]),
      transLangPhone: new FormControl(null, [CustomValidator.bind(this), Validators.minLength(7), Validators.maxLength(9)]),
      jobTitle: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]),
      transLangjobTitle: new FormControl('', [CustomValidator.bind(this), Validators.minLength(3), Validators.maxLength(100)]),
    });

    //   this._commonService.getCountry().subscribe((res:any) => {
    //     if(res && res.length){
    //       res.map((obj) => {
    //         if (typeof (obj.desc) == "string") {
    //           obj.desc = JSON.parse(obj.desc);
    //         }
    //       })
    //       this.countryList = res;
    //    }
    //  });
    this._sharedService.countryList.subscribe((state: any) => {
      this.countryList = state;
    });

    this._sharedService.getLocation.subscribe((state: any) => {
      if (state && state.country) {
        let obj = {
          title: state.country
        };
        this.getMapLatlng(obj);
      }
    })

    this._userCreationService.getjobTitles().subscribe((res: any) => {
      if (res.returnStatus == 'Success') {
        this.jobTitles = res.returnObject;
      }
    })

  }

  errorValidate() {
    if (this.regForm.controls.firstName.status == "INVALID" && this.regForm.controls.firstName.touched) {
      this.firstNameError = true;
    }
    if (this.regForm.controls.transLangfirstName.status == "INVALID" && this.regForm.controls.transLangfirstName.touched) {
      this.transfirstNameError = true;
    }
    if (this.regForm.controls.lastName.status == "INVALID" && this.regForm.controls.lastName.touched) {
      this.lastNameError = true;
    }
    if (this.regForm.controls.transLanglastName.status == "INVALID" && this.regForm.controls.transLanglastName.touched) {
      this.translastNameError = true;
    }
    if (this.regForm.controls.phone.status == "INVALID" && this.regForm.controls.phone.touched) {
      this.phoneError = true;
    }
    if (this.regForm.controls.transLangPhone.status == "INVALID" && this.regForm.controls.transLangPhone.touched) {
      this.translangPhoneError = true;
    }
    if (this.regForm.controls.email.status == "INVALID" && this.regForm.controls.email.touched) {
      this.EmailError = true;
    }
    if (this.regForm.controls.transLangEmail.status == "INVALID" && this.regForm.controls.transLangEmail.touched) {
      this.transEmailError = true;
    }

    if (this.regForm.controls.jobTitle.status == "INVALID" && this.regForm.controls.jobTitle.touched) {
      this.jobTitleError = true;
    }
    if (this.regForm.controls.transLangjobTitle.status == "INVALID" && this.regForm.controls.transLangjobTitle.touched) {
      this.transjobTitleError = true;
    }

  }
  getlabelsDescription() {
    this._userService.getlabelsDescription('registration').subscribe((res: any) => {
      if (res.returnStatus == 'Success') {
        // console.log(res.returnObject);
        // console.log(this.regForm.controls.firstName);
        this.lblAccSetupBaseLang = res.returnObject[0].baseLang;
        this.lblAccSetupOtherLang = res.returnObject[0].otherLang;
        this.lblPersonalInfoBaseLang = res.returnObject[1].baseLang;
        this.lblPersonalInfoOtherLang = res.returnObject[1].otherLang;
        this.lblFormfirstNameBaseLang = res.returnObject[2].baseLang;
        this.lblFormfirstNameOtherLang = res.returnObject[2].otherLang;
        this.lblFormlastNameBaseLang = res.returnObject[3].baseLang;
        this.lblFormlastNameOtherLang = res.returnObject[3].otherLang;
        this.lblFormjobTitleBaseLang = res.returnObject[4].baseLang;
        this.lblFormjobTitleOtherLang = res.returnObject[4].otherLang;
        this.lblContactDetailBaseLang = res.returnObject[5].baseLang;
        this.lblContactDetailOtherLang = res.returnObject[5].otherLang;
        this.lblFormMobileBaseLang = res.returnObject[6].baseLang;
        this.lblFormMobileOtherLang = res.returnObject[6].otherLang;
        this.lblFormEmailBaseLang = res.returnObject[7].baseLang;
        this.lblFormEmailOtherLang = res.returnObject[7].otherLang;
        this.emailInfoTextBaselang = res.returnObject[8].baseLang;
        this.emailInfoTextOtherlang = res.returnObject[8].otherLang;
        this.regBtnBaseLang = res.returnObject[9].baseLang;
        this.regBtnOtherLang = res.returnObject[9].otherLang;
      }
    })
  }
  accountList(region) {
    this._userCreationService.getAccountSetup(region.id).subscribe((res: any) => {
      if (res.returnStatus == 'Success') {
        this.accountSetup = JSON.parse(res.returnObject);
        this.showTranslatedLangSide = (region.desc[0].RegionCode == 'MET') ? true : false;
        this.regForm.reset();
        this.transLangEmail = '';
        this.accountId = undefined;
        this.selectedjobTitle = undefined;
        this.registrationForm = true;
        this.getlabelsDescription();

      }
    })
  }

  getMapLatlng(region) {
    this._userService.getLatlng(region.title).subscribe((res: any) => {
      if (res.status == "OK") {
        this.location = res.results[0].geometry.location;
        if (region.id) {
          let selectedCountry = this.countryList.find(obj => obj.title.toLowerCase() == region.title.toLowerCase());
          this.selectedLangIdbyCountry = selectedCountry.desc[0].LanguageID;
          this.selectPhoneCode(selectedCountry);
          this.accountList(region);
        }
      }
    })
  }

  selectAccountSetup(id, obj) {
    this.accountId = obj.AccountID;
    let elem = document.getElementsByClassName('fancyRadioBoxes') as any;
    for (let i = 0; i < elem.length; i++) {
      if (elem[i].children[0].id == id) {
        elem[i].children[0].checked = true;
      }

    }
  }

  NumberValid(evt) {
    let charCode = (evt.which) ? evt.which : evt.keyCode
    if (charCode > 31 && (charCode < 48 || charCode > 57))
      return false;
    return true;
  }

  textValidation(event) {
    const pattern = /[a-zA-Z-][a-zA-Z -]*$/;
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

  spaceHandler(event) {
    if (event.charCode == 32) {
      event.preventDefault();
      return false;
    }
  }

  selectPhoneCode(list) {
    this.countryFlagImage = list.code;
    let description = list.desc;
    this.phoneCode = description[0].CountryPhoneCode;
    this.transPhoneCode = description[0].CountryPhoneCode_OtherLang;
    this.phoneCountryId = list.id
  }


  getAccountList(region, event) {
    if (region.id) {
      this.getMapLatlng(region);
    }
    else {
      this.registrationForm = false;
    }
  }




  createAccount(data) {
    let valid: boolean = ValidateEmail(data.email);
    if (!this.accountId) {
      this._toastr.error("Account setup field is required", '');
      return;
    }
    if (this.regForm.invalid) {
      return;
    }
    else if (!valid) {
      this._toastr.warning('Invalid email entered.', 'Failed')
      return
    }
    let otherLangObj = {
      firstName: data.transLangfirstName,
      lastName: data.transLanglastName,
      primaryPhone: this.transPhoneCode + data.transLangPhone,
      countryPhoneCode: this.transPhoneCode,
      phoneCodeCountryID: this.phoneCountryId,
      jobTitle: (typeof data.transLangjobTitle === "object")? data.transLangjobTitle.otherLanguage : data.transLangjobTitle 
    };
    let obj = {
      accountSetupID: this.accountId,
      countryID: this.selectedRegion.id,
      primaryEmail: data.email,
      LanguageID : this.selectedLangIdbyCountry,
      redirectUrl: window.location.protocol + "//" + window.location.host + "/otp",
      userBaseLanguageData: {
        firstName: data.firstName,
        lastName: data.lastName,
        primaryPhone: this.phoneCode + data.phone,
        countryPhoneCode: this.phoneCode,
        phoneCodeCountryID: this.phoneCountryId,
        jobTitle: (typeof data.jobTitle === "object")? data.jobTitle.baseLanguage : data.jobTitle
      },
      userOtherLanguageData: (this.showTranslatedLangSide) ? otherLangObj : null
    }

    this._userCreationService.userRegistration(obj).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        this._toastr.success(res.returnText, '');
        this._router.navigate(['/otp', res.returnObject.otpKey])
      }
      else {
        this._toastr.error(res.returnText, '');
      }
    })

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
      this.regForm.controls[$controlName].patchValue(number.reverse().join(''));
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
      this.regForm.controls[$controlName].patchValue(number.join(''));
    }

  }
  onModelChange(fromActive, currentActive, $controlName, source, target, $value) {
    if (!this.showTranslatedLangSide) return;
    setTimeout(() => {
      if (currentActive && !fromActive && $value) {
        this.Globalinputfrom = false;
      }
      if (fromActive == false && currentActive && this.regForm.controls[$controlName].errors || this.Globalinputto) {
        this._commonService.translatedLanguage(source, target, $value).subscribe((res: any) => {
          this.regForm.controls[$controlName].patchValue(res.data.translations[0].translatedText);
          this.Globalinputto = true;
        })
      }
      else if ($value && currentActive && source && target && fromActive == undefined) {
        this._commonService.translatedLanguage(source, target, $value).subscribe((res: any) => {
          this.regForm.controls[$controlName].patchValue(res.data.translations[0].translatedText);
 
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
    if (currentActive && fromActive == false && this.regForm.controls[$controlName].errors || this.Globalinputfrom) {
      this.debounceInput.next($value);
      this.debounceInput.pipe(debounceTime(400), distinctUntilChanged()).subscribe(value => {
        this._commonService.detectedLanguage(value).subscribe((res: any) => {
          let sourceLang = res.data.detections[0][0].language;
          let target = "en";
          if (sourceLang && target && value) {
            this._commonService.translatedLanguage(sourceLang, target, value).subscribe((res: any) => {
              this.regForm.controls[$controlName].patchValue(res.data.translations[0].translatedText);
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
              this.regForm.controls[$controlName].patchValue(res.data.translations[0].translatedText);
            })
          }
        })
      });
    }
    // else if(currentActive && !$value){
    //   this.fromActive(fromActive);    
    // }
  }

  // fromActive(from){
  //   from = undefined;
  //   console.log(from);
  // }
  onModeljobtitle(fromActive, currentActive, $controlName, source, target, $value) {
    if (!this.showTranslatedLangSide) return;
    setTimeout(() => {
      if(typeof this.selectedjobTitle == 'object') return;
    if ($value && currentActive && source && target && !fromActive) {
        this._commonService.translatedLanguage(source, target, $value).subscribe((res: any) => {
          this.regForm.controls[$controlName].patchValue(res.data.translations[0].translatedText);
          let obj={
            baseLanguage: $value,
            otherLanguage : res.data.translations[0].translatedText,
          }
          this.selectedjobTitle = obj
        })
      }

    }, 200)
  }
  onTransModeljobTitle(fromActive, currentActive, $controlName, $value){

    if (!this.showTranslatedLangSide) return;
    setTimeout(() => {
      if(typeof this.selectedjobTitle == 'object') return;
     if (currentActive && $value && !fromActive) {
      this.debounceInput.next($value);
      this.debounceInput.pipe(debounceTime(400), distinctUntilChanged()).subscribe(value => {
        this._commonService.detectedLanguage(value).subscribe((res: any) => {
          let sourceLang = res.data.detections[0][0].language;
          let target = "en";
          if (sourceLang && target && value) {
            this._commonService.translatedLanguage(sourceLang, target, value).subscribe((res: any) => {
              this.regForm.controls[$controlName].patchValue(res.data.translations[0].translatedText);
              let obj={
                baseLanguage: res.data.translations[0].translatedText,
                otherLanguage : $value
              }
              this.selectedjobTitle = obj
            })
          }
        })
      });
    }
  }, 200)
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

}
