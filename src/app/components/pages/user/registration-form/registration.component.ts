import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef, NgZone, state } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MapsAPILoader } from '@agm/core';
import { Router } from '@angular/router';
import { } from '@types/googlemaps';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { UserService } from '../user.service';
import { SharedService } from '../../../../services/shared.service';
import { CommonService } from '../../../../services/common.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {

  // @ViewChild('search') public searchElement: ElementRef;
  public debounceInput: Subject<string> = new Subject();
  public phoneCountryId: any
  public phoneCode: any;
  public countryFlagImage: string;
  public accountId: number;
  public countryList: any[];
  public accountSetup: any;
  public serviceOffered: any;
  public zoomlevel: number = 5;
  public serviceIds: any[] = [];
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


  // model binding

  public transLangEmail: any;
  public transLangphone: any;


  // form Field Validtaions boolean variable
  public requiredFields: string = "This field is required";

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
  public activeLastName:any;
  public activeTransLastName:any;
  public activejobTitle: any;
  public activeTransjobTitle: any;



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
    private mapsAPILoader: MapsAPILoader,
    private _router: Router,
    private ngZone: NgZone) { }

  ngOnInit() {

    this._sharedService.formProgress.next(0);

    this.regForm = new FormGroup({
      firstName: new FormControl(null, [Validators.required, Validators.pattern(/[a-zA-Z-][a-zA-Z -]*$/), Validators.minLength(2), Validators.maxLength(100)]),
      transLangfirstName: new FormControl(null, [Validators.required, Validators.minLength(2), Validators.maxLength(100)]),
      lastName: new FormControl(null, [Validators.required, Validators.pattern(/[a-zA-Z-][a-zA-Z -]*$/), Validators.minLength(2), Validators.maxLength(100)]),
      transLanglastName: new FormControl(null, [Validators.required, Validators.minLength(2), Validators.maxLength(100)]),
      email: new FormControl(null, [
        Validators.required,
        Validators.pattern(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
        Validators.maxLength(320)
      ]),
      transLangEmail: new FormControl(null, [
        Validators.required,
        Validators.pattern(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
        Validators.maxLength(320)
      ]),
      phone: new FormControl(null, [Validators.required, Validators.pattern(/^(?!(\d)\1+(?:\1+){0}$)\d+(\d+){0}$/), Validators.minLength(7), Validators.maxLength(12)]),
      transLangPhone: new FormControl(null, [Validators.required, Validators.pattern(/^(?!(\d)\1+(?:\1+){0}$)\d+(\d+){0}$/), Validators.minLength(7), Validators.maxLength(12)]),
      jobTitle: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(25)]),
      transLangjobTitle: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(25)]),
    });


    this._sharedService.countryList.subscribe((state: any) => {
      let List = state;
      List.map((obj) => {
        if (typeof (obj.desc) == "string") {
          obj.desc = JSON.parse(obj.desc);
        }
      })
      this.countryList = List;
    });

    this._sharedService.getLocation.subscribe((state: any) => {
      if (state && state.country) {
        let obj = {
          title: state.country
        };
        let selectedCountry = this.countryList.find(obj => obj.title == state.country);
        this.selectPhoneCode(selectedCountry);
        this.getMapLatlng(obj);
      }
    })

    // this.mapsAPILoader.load().then(() => {
    //   let autoComplete = new google.maps.places.Autocomplete(this.searchElement.nativeElement, { types: ["(cities)"] });
    //   autoComplete.addListener('places_changed', () => {
    //     this.ngZone.run(() => {
    //       let place: google.maps.places.PlaceResult = autoComplete.getPlace();
    //       this.lat = place.geometry.location.lat();
    //       this.lng = place.geometry.location.lng();
    //       if (place.geometry === undefined || place.geometry === null) {
    //         return
    //       }
    //     })
    //   })
    // })

    this._userService.getServiceOffered().subscribe((res: any) => {
      if (res.returnStatus == 'Success') {
        this.serviceOffered = res.returnObject;
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
  getlabelsDescription(){
    this._userService.getlabelsDescription('registration').subscribe((res:any)=>{
      if(res.returnStatus =='Success'){
        // console.log(res.returnObject);
       this.lblAccSetupBaseLang = res.returnObject[0].baseLang;
       this.lblAccSetupOtherLang = res.returnObject[0].otherLang;
       this.lblPersonalInfoBaseLang = res.returnObject[1].baseLang;
       this.lblPersonalInfoOtherLang = res.returnObject[1].otherLang; 
       this.lblFormfirstNameBaseLang = res.returnObject[2].baseLang  
       this.lblFormfirstNameOtherLang = res.returnObject[2].otherLang  
       this.lblFormlastNameBaseLang = res.returnObject[3].baseLang  
       this.lblFormlastNameOtherLang = res.returnObject[3].otherLang  
       this.lblFormjobTitleBaseLang = res.returnObject[4].baseLang  
       this.lblFormjobTitleOtherLang = res.returnObject[4].otherLang    
       this.lblContactDetailBaseLang = res.returnObject[5].baseLang;
       this.lblContactDetailOtherLang = res.returnObject[5].otherLang;
       this.lblFormMobileBaseLang = res.returnObject[6].baseLang  
       this.lblFormMobileOtherLang = res.returnObject[6].otherLang   
       this.lblFormEmailBaseLang = res.returnObject[7].baseLang  
       this.lblFormEmailOtherLang = res.returnObject[7].otherLang 
       this.emailInfoTextBaselang = res.returnObject[8].baseLang  
       this.emailInfoTextOtherlang = res.returnObject[8].otherLang 
       this.regBtnBaseLang = res.returnObject[9].baseLang   
       this.regBtnOtherLang = res.returnObject[9].otherLang   
      }
    })
  }
  accountList(id) {
    this._userService.getAccountSetup(id).subscribe((res: any) => {
      if (res.returnStatus == 'Success') {
        this.accountSetup = JSON.parse(res.returnObject);
        this.registrationForm = true;
        this.getlabelsDescription()

      }
    })
  }

  getMapLatlng(region) {
    this._userService.getLatlng(region.title).subscribe((res: any) => {
      if (res.status == "OK") {
        this.location = res.results[0].geometry.location;
        if (region.id) {
          this.accountList(region.id);
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
        else if(event.charCode == 32 && !pattern.test(inputChar)){
          return true;
        }
        else{
          return false;
        }
      }
      else {
        return false;
      }
    }
    else{
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

  serviceSelection(obj, selectedService) {
    let index = this.serviceIds.indexOf(obj.ServiceID);
    let selectedItem = selectedService.classList;
    if (index < 0) {
      selectedItem.add('active');
      this.serviceIds.push(obj.ServiceID);
    }
    else {
      this.serviceIds.splice(index, 1);
      selectedItem.remove('active');
    }
  }


  createAccount(data) {
      if(!this.accountId){
            this._toastr.error("Account setup field is required", '');
            return;
      }
    let obj = {
      accountSetupID: this.accountId,
      countryID: this.selectedRegion.id,
      primaryEmail: data.email,
      redirectUrl: window.location.protocol + "//" + window.location.host + "/otp",
      userBaseLanguageData: {
        firstName: data.firstName,
        lastName: data.lastName,
        primaryPhone: this.phoneCode + data.phone,
        countryPhoneCode: this.phoneCode,
        phoneCodeCountryID: this.phoneCountryId,
        jobTitle: data.jobTitle
      },
      userOtherLanguageData: {
        firstName: data.transLangfirstName,
        lastName: data.transLanglastName,
        primaryPhone: this.phoneCode + data.transLangPhone,
        countryPhoneCode: this.phoneCode,
        phoneCodeCountryID: this.phoneCountryId,
        jobTitle: data.transLangjobTitle
      }
    }

    this._userService.userRegistration(obj).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        this._toastr.success(res.returnText,'');
        this._router.navigate(['/otp', res.returnObject.otpKey])
      }
      else{
        this._toastr.error(res.returnText,'');
      }
    })

  }
  onModelEmailPhoneChange($controlName, $event){
    // let value = $event.split('').pop();
    // var arabicNumbers = [
    //   {baseNumber:'0',arabicNumber:'۰'},
    //   {baseNumber:'1',arabicNumber:'۱'},
    //   {baseNumber:'2',arabicNumber:'۲'},
    //   {baseNumber:'3',arabicNumber:'۳'},
    //   {baseNumber:'4',arabicNumber:'۴'},
    //   {baseNumber:'5',arabicNumber:'۵'},
    //   {baseNumber:'6',arabicNumber:'۶'},
    //   {baseNumber:'7',arabicNumber:'۷'},
    //   {baseNumber:'8',arabicNumber:'۸'},
    //   {baseNumber:'9',arabicNumber:'۹'}
    // ]
    // let convertValue= arabicNumbers.find(obj => obj.baseNumber == value);
    // this.regForm.controls[$controlName].patchValue(convertValue.arabicNumber);
  this.regForm.controls[$controlName].patchValue($event);
}
  onModelChange(fromActive, currentActive, $controlName, source, target, $value) {
    setTimeout(() => {
      if(currentActive && !fromActive && $value){
        this.Globalinputfrom = false;
      }
      if(fromActive == false && currentActive && this.regForm.controls[$controlName].errors || this.Globalinputto){
        this._commonService.translatedLanguage(source, target, $value).subscribe((res: any) => {
          this.regForm.controls[$controlName].patchValue(res.data.translations[0].translatedText);
          this.Globalinputto = true;
        })
      }
     else if ($value && currentActive && source && target && fromActive==undefined) {
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
    if(currentActive && !fromActive && $value){
      this.Globalinputto = false;
    }
    if(currentActive && fromActive == false && this.regForm.controls[$controlName].errors || this.Globalinputfrom){
      this.debounceInput.next($value);
      this.debounceInput.pipe(debounceTime(400),distinctUntilChanged()).subscribe(value => {
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
      else if (currentActive && $value && fromActive==undefined) {
        this.debounceInput.next($value);
        this.debounceInput.pipe(debounceTime(400),distinctUntilChanged()).subscribe(value => {
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


  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      map(term => (!term || term.length < 3) ? []
        : this.countryList.filter(v => v.title.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
    )
  formatter = (x: { title: string }) => x.title;

}
