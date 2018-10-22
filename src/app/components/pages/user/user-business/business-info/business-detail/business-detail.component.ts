import { Component, OnInit, NgZone, ElementRef, ViewChild, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SharedService } from '../../../../../../services/shared.service';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { UserService } from '../../../user.service';
import { MapsAPILoader } from '@agm/core';
import { } from '@types/googlemaps';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from '../../../../../../services/common.service';
import { NgFilesService, NgFilesConfig, NgFilesStatus, NgFilesSelected } from '../../../../../../directives/ng-files';
import { CustomValidator, ValidateEmail, EMAIL_REGEX, leapYear } from '../../../../../../constants/globalFunctions'
import { UserBusinessService } from '../../user-business.service';

@Component({
  selector: 'app-business-detail',
  templateUrl: './business-detail.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./business-detail.component.scss']
})
export class BusinessDetailComponent implements OnInit {

  @ViewChild('search') public searchElement: ElementRef;
  public debounceInput: Subject<string> = new Subject();
  public requiredFields: string = "This field is required";
  public requiredFieldsOthrLng: string = "هذه الخانة مطلوبه";
  public selectedLicense;
  public selectedLogo;
  public selectedSocialsite: any = {};

  private config: NgFilesConfig = {
    acceptExtensions: ['jpg', 'png', 'pdf', 'bmp'],
    maxFilesCount: 1,
    maxFileSize: 4096000,
    totalFilesSize: 4096000
  };

  // private namedConfig: NgFilesConfig = {
  //   acceptExtensions: ['js', 'doc', 'mp4'],
  //   maxFilesCount: 5,
  // };


  public showTranslatedLangSide: boolean;
  public zoomlevel: number = 6;
  public draggable: boolean = true;
  public location: any = { lat: undefined, lng: undefined };
  public countAccount = 1
  public socialAccounts: any[] = [this.countAccount];
  public geoCoder;
  public socialLink: any;
  public organizationList: any;
  public serviceIds: any[] = [];
  public selectedIssueYear;
  public selectedIssueYearAr;
  public selectedExpiryYear;
  public selectedExpiryYearAr;
  public selectedIssueMonth;
  public selectedIssueMonthAr;
  public selectedExpireMonth;
  public selectedExpireMonthAr;
  public selectedIssueDate;
  public selectedIssueDateAr;
  public selectedExpireDate;
  public selectedExpireDateAr;
  public selectedOrgType;
  public selectedOrgTypeAr;
  public serviceOffered: any;
  public orgType;
  public IssueYear: any;
  public IssueMonth: any;
  public IssueDate: any;
  public ExpiryYear: any;
  public ExpireMonth: any;
  public ExpireDate: any;
  public pastYears: any[] = [];
  public futureYears: any[] = [];
  public issueDates: any[] = [];
  public expiryDates: any[] = [];

  public date = new Date();
  public months: any[] = [
    {
      name: 'Jan',
      arabicName: 'يناير'
    },
    {
      name: 'Feb',
      arabicName: 'فبراير'
    },
    {
      name: 'Mar',
      arabicName: 'مارس'
    },
    {
      name: 'Apr',
      arabicName: 'أبريل'
    },
    {
      name: 'May',
      arabicName: 'مايو'
    },
    {
      name: 'Jun',
      arabicName: 'يونيو'
    },
    {
      name: 'Jul',
      arabicName: 'يوليو'
    },
    {
      name: 'Aug',
      arabicName: 'أغسطس'
    },
    {
      name: 'Sep',
      arabicName: 'سبتمبر'
    },
    {
      name: 'Oct',
      arabicName: 'أكتوبر'
    },
    {
      name: 'Nov',
      arabicName: 'نوفمبر'
    },
    {
      name: 'Dec',
      arabicName: 'ديسمبر'
    }
  ]

  public issueMonths = Object.assign([], this.months);
  public expiryMonths = Object.assign([], this.months);

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


  public dateValObj: any = {
    31: [
      {
        name: 'Jan',
        arabicName: 'يناير'
      },
      {
        name: 'Mar',
        arabicName: 'مارس'
      },

      {
        name: 'May',
        arabicName: 'مايو'
      },

      {
        name: 'Jul',
        arabicName: 'يوليو'
      },
      {
        name: 'Aug',
        arabicName: 'أغسطس'
      },

      {
        name: 'Oct',
        arabicName: 'أكتوبر'
      },

      {
        name: 'Dec',
        arabicName: 'ديسمبر'
      }],
    30: [
      {
        name: 'Apr',
        arabicName: 'أبريل'
      },

      {
        name: 'Jun',
        arabicName: 'يونيو'
      },


      {
        name: 'Sep',
        arabicName: 'سبتمبر'
      },

      {
        name: 'Nov',
        arabicName: 'نوفمبر'
      }
    ],
    allMonths: Object.assign([], this.months)
  }
  public countryList: any;
  public countryFlagImage: string;
  public phoneCode: string;
  public transPhoneCode: string;
  public phoneCountryId: any;
  public licenseNoAr: any;
  public vatNoAr: any;
  public poBoxAr: any;
  public addressAr: any;

  // global Input
  public Globalinputfrom: any;
  public Globalinputto: any;

  public informationForm;
  public businessLocForm;
  public organizationForm;
  public contactInfoForm;


  public activePhone: any;
  public activeTransPhone: any;
  public activeFax: any;
  public activeTransFax: any;
  public activeOrgName: any;
  public activeTransOrgName: any;

  public orgNameError: boolean;
  public transorgNameError: boolean;
  public addressArError: boolean;
  public addressError: boolean;
  public vatError: boolean;
  public vatNoArError: boolean;
  public poBoxError: boolean;
  public poBoxArError: boolean;
  public translicenseError: boolean
  public licenseError: boolean
  public phoneError: boolean;
  public translangPhoneError: boolean;
  public faxError: boolean;
  public translangFaxError: boolean;

  public userProfile;


  public socialSites;
  public socialInputValidate;


  //--------------- labels


  public headingBaseLanguage;
  public headingOtherLanguage;
  public statementBaseLanguage
  public statementOtherLanguage;
  public infoFormBaseLanguage;
  public infoFormOtherLanguage;
  public tradeLabelBaseLanguage;
  public tradeLabelOtherLanguage;
  public issueDateLabelBaseLanguage;
  public issueDateLabelOtherLanguage;
  public expiryDateLabelBaseLanguage;
  public expiryDateLabelOtherLanguage;
  public vatNoLabelBaseLanguage;
  public vatNoLabelOtherLanguage;
  public tradeliscenseLabelBaseLanguage;
  public tradeliscenseLabelOtherLanguage;
  public docLabelBaseLanguage;
  public docLabelOtherLanguage;
  public busLocLabelBaseLanguage;
  public busLocLabelOtherLanguage;
  public addLabelBaseLanguage;
  public addLabelOtherLanguage;
  public poBoxLabelBaseLanguage;
  public poBoxLabelOtherLanguage;
  public busInfoLabelBaseLanguage;
  public busInfoLabelOtherLanguage;
  public uploadlogoLabelBaseLanguage;
  public uploadlogoLabelOtherLanguage;
  public orgNameLabelBaseLanguage;
  public orgNameLabelOtherLanguage;
  public orgTypeLabelBaseLanguage;
  public orgTypeLabelOtherLanguage;
  public conDetailLabelBaseLanguage;
  public conDetailLabelOtherLanguage;
  public telPhoneLabelBaseLanguage;
  public telPhoneLabelOtherLanguage;
  public faxLabelBaseLanguage;
  public faxLabelOtherLanguage;
  public socialMedLabelBaseLanguage;
  public socialMedLabelOtherLanguage;
  public moreAccLabelBaseLanguage;
  public moreAccLabelOtherLanguage;
  public btnLabelBaseLanguage;
  public btnLabelOtherLanguage;
  public selectLabelBaseLanguage;
  public selectLabelOtherLanguage;



  constructor(
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    private _sharedService: SharedService,
    private _userService: UserService,
    private _userbusinessService: UserBusinessService,
    private _toastr: ToastrService,
    private _commonService: CommonService,
    private ngFilesService: NgFilesService

  ) {
  }

  ngOnInit() {

    this.ngFilesService.addConfig(this.config, 'docConfig');
    // this.ngFilesService.addConfig(this.namedConfig);
    this._sharedService.formProgress.next(40);

    let userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo && userInfo.returnObject) {
      this.userProfile = userInfo.returnObject;
      this.showTranslatedLangSide = (this.userProfile.regionCode == "MET") ? true : false;
      this.getLabels(this.userProfile);
      // this.firstNameBL = userInfo.returnObject.firstNameBL;
    }
    this.getsocialList();
    this.getOrganizationList();
    this.getTenYears();
    this.getDates(31, 'both');

    this._userbusinessService.getServiceOffered().subscribe((res: any) => {
      if (res.returnStatus == 'Success') {
        this.serviceOffered = JSON.parse(res.returnObject);
      }
    })
    this._sharedService.countryList.subscribe((state: any) => {
      if (state) {
        this.countryList = state;
        let selectedCountry = this.countryList.find(obj => obj.id == this.userProfile.countryID);
        this.selectPhoneCode(selectedCountry);
        this.getplacemapLoc(selectedCountry.code.toLowerCase());
        this.getMapLatlng(selectedCountry.title);
      }

    });

    this.informationForm = new FormGroup({
      licenseNo: new FormControl(null, [Validators.required, Validators.minLength(4), Validators.maxLength(10)]),
      licenseNoAr: new FormControl(null, [CustomValidator.bind(this), Validators.minLength(4), Validators.maxLength(10)]),
      vatNo: new FormControl(null, [Validators.required, Validators.pattern(/^(?!(\d)\1+(?:\1+){0}$)\d+(\d+){0}$/), Validators.minLength(5), Validators.maxLength(12)]),
      vatNoAr: new FormControl(null, [CustomValidator.bind(this), Validators.minLength(5), Validators.maxLength(12)]),

      issueDate: new FormControl(null, [Validators.required]),
      issueMonth: new FormControl(null, [Validators.required]),
      issueYear: new FormControl(null, [Validators.required]),
      issueDateArabic: new FormControl(null, [CustomValidator.bind(this)]),
      issueMonthArabic: new FormControl(null, [CustomValidator.bind(this)]),
      issueYearArabic: new FormControl(null, [CustomValidator.bind(this)]),
      expireDate: new FormControl(null, [Validators.required]),
      expireMonth: new FormControl(null, [Validators.required]),
      expiryYear: new FormControl(null, [Validators.required]),
      expireDateArabic: new FormControl(null, [CustomValidator.bind(this)]),
      expireMonthArabic: new FormControl(null, [CustomValidator.bind(this)]),
      expiryYearArabic: new FormControl(null, [CustomValidator.bind(this)]),
    });
    this.businessLocForm = new FormGroup({
      address: new FormControl(null, [Validators.required, Validators.maxLength(200), Validators.minLength(20)]),
      transAddress: new FormControl(null, [CustomValidator.bind(this), Validators.maxLength(200), Validators.minLength(20)]),
      poBoxNo: new FormControl(null, [Validators.required, Validators.maxLength(16), Validators.minLength(4)]),
      poBoxNoAr: new FormControl(null, [CustomValidator.bind(this), Validators.maxLength(16), Validators.minLength(4)]),
    });

    this.organizationForm = new FormGroup({
      organizationType: new FormControl(null, [Validators.required]),
      organizationTypeAr: new FormControl(null, [CustomValidator.bind(this)]),
      orgName: new FormControl(null, [Validators.required, Validators.maxLength(100), Validators.minLength(4)]),
      transLangOrgName: new FormControl(null, [CustomValidator.bind(this), Validators.maxLength(100), Validators.minLength(4)]),
    });
    this.contactInfoForm = new FormGroup({
      phone: new FormControl(null, [Validators.required, Validators.pattern(/^(?!(\d)\1+(?:\1+){0}$)\d+(\d+){0}$/), Validators.minLength(7), Validators.maxLength(13)]),
      transLangPhone: new FormControl(null, [CustomValidator.bind(this), Validators.minLength(7), Validators.maxLength(13)]),
      fax: new FormControl(null, [Validators.required, Validators.pattern(/^(?!(\d)\1+(?:\1+){0}$)\d+(\d+){0}$/), Validators.minLength(7), Validators.maxLength(13)]),
      transLangFax: new FormControl(null, [CustomValidator.bind(this), Validators.minLength(7), Validators.maxLength(13)]),
      socialUrl: new FormControl(null, [Validators.required, Validators.minLength(15), Validators.maxLength(25)]),
      socialUrlOther: new FormControl(null, [CustomValidator.bind(this), Validators.minLength(15), Validators.maxLength(25)]),

    });



  }

  getLabels(obj) {
    this._sharedService.businessProfileJsonLabels.subscribe((state: any) => {
      if (state) {
        let data = state;
        console.log(data,'translation')
        data.forEach(element => {

          if (element.keyCode == "lbl_Heading") {
            this.headingBaseLanguage = element.baseLang.replace('{firstName}', obj.firstNameBL);
            this.headingOtherLanguage = element.otherLang.replace('{firstName}', obj.firstNameOL);
          }
          else if (element.keyCode == "lbl_Content") {
            this.statementBaseLanguage = element.baseLang;
            this.statementOtherLanguage = element.otherLang;
          }
          else if (element.keyCode == "lbl_KeyInfo") {
            this.infoFormBaseLanguage = element.baseLang;
            this.infoFormOtherLanguage = element.otherLang;
          }
          else if (element.keyCode == "lbl_TradeLicenseNo") {
            this.tradeLabelBaseLanguage = element.baseLang;
            this.tradeLabelOtherLanguage = element.otherLang;
          }
          else if (element.keyCode == "lbl_IssueDate") {
            this.issueDateLabelBaseLanguage = element.baseLang;
            this.issueDateLabelOtherLanguage = element.otherLang;
          }
          else if (element.keyCode == "lbl_ExpiryDate") {
            this.expiryDateLabelBaseLanguage = element.baseLang;
            this.expiryDateLabelOtherLanguage = element.otherLang;
          }
          else if (element.keyCode == "lbl_VATNo") {
            this.vatNoLabelBaseLanguage = element.baseLang;
            this.vatNoLabelOtherLanguage = element.otherLang;
          }
          else if (element.keyCode == "lbl_TradeLicense") {
            this.tradeliscenseLabelBaseLanguage = element.baseLang;
            this.tradeliscenseLabelOtherLanguage = element.otherLang;
          }
          else if (element.keyCode == "lbl_Document") {
            this.docLabelBaseLanguage = element.baseLang;
            this.docLabelOtherLanguage = element.otherLang;
          }
          else if (element.keyCode == "lbl_BusinessLoc") {
            this.busLocLabelBaseLanguage = element.baseLang;
            this.busLocLabelOtherLanguage = element.otherLang;
          }
          else if (element.keyCode == "lbl_Address") {
            this.addLabelBaseLanguage = element.baseLang;
            this.addLabelOtherLanguage = element.otherLang;
          }
          else if (element.keyCode == "lbl_POBox") {
            this.poBoxLabelBaseLanguage = element.baseLang;
            this.poBoxLabelOtherLanguage = element.otherLang;
          }
          else if (element.keyCode == "lbl_BusinessInfo") {
            this.busInfoLabelBaseLanguage = element.baseLang;
            this.busInfoLabelOtherLanguage = element.otherLang;
          }
          else if (element.keyCode == "lbl_UploadLogo") {
            this.uploadlogoLabelBaseLanguage = element.baseLang;
            this.uploadlogoLabelOtherLanguage = element.otherLang;
          }
          else if (element.keyCode == "lbl_OrganizationName") {
            this.orgNameLabelBaseLanguage = element.baseLang;
            this.orgNameLabelOtherLanguage = element.otherLang;
          }
          else if (element.keyCode == "lbl_OrganizationType") {
            this.orgTypeLabelBaseLanguage = element.baseLang;
            this.orgTypeLabelOtherLanguage = element.otherLang;
          }
          else if (element.keyCode == "lbl_ContactDetails") {
            this.conDetailLabelBaseLanguage = element.baseLang;
            this.conDetailLabelOtherLanguage = element.otherLang;
          }
          else if (element.keyCode == "lbl_Telephone") {
            this.telPhoneLabelBaseLanguage = element.baseLang;
            this.telPhoneLabelOtherLanguage = element.otherLang;
          }
          else if (element.keyCode == "lbl_Fax") {
            this.faxLabelBaseLanguage = element.baseLang;
            this.faxLabelOtherLanguage = element.otherLang;
          }
          else if (element.keyCode == "lbl_SocialMedia") {
            this.socialMedLabelBaseLanguage = element.baseLang;
            this.socialMedLabelOtherLanguage = element.otherLang;
          }
          else if (element.keyCode == "lbl_MoreAccounts") {
            this.moreAccLabelBaseLanguage = element.baseLang;
            this.moreAccLabelOtherLanguage = element.otherLang;
          }
          else if (element.keyCode == "btn_Next") {
            this.btnLabelBaseLanguage = element.baseLang;
            this.btnLabelOtherLanguage = element.otherLang;
          }
          else if (element.keyCode == "lbl_Select") {
            this.selectLabelBaseLanguage = element.baseLang;
            this.selectLabelOtherLanguage = element.otherLang;
          }

        });
      }
    });

  }

  getDates(limit, type) {
    let persianDigits = "۰۱۲۳۴۵۶۷۸۹";
    let persianMap = persianDigits.split("");
    if (type == 'issue') {
      this.issueDates = [];
      for (var i = 1; i <= limit; i++) {
        let convertedNumber = i.toString().replace(/\d/g, (m: string) => {
          return persianMap[parseInt(m)]
        });
        this.issueDates.push({ dateNormal: i, dateArabic: convertedNumber });

      }
    }
    else if (type == 'expire') {
      this.expiryDates = [];
      for (let i = 1; i <= limit; i++) {
        let convertedNumber = i.toString().replace(/\d/g, (m: string) => {
          return persianMap[parseInt(m)]
        });
        this.expiryDates.push({ dateNormal: i, dateArabic: convertedNumber });
      }
    }
    else if (type == 'both') {
      for (let i = 1; i <= limit; i++) {
        let convertedNumber = i.toString().replace(/\d/g, (m: string) => {
          return persianMap[parseInt(m)]
        });
        this.issueDates.push({ dateNormal: i, dateArabic: convertedNumber });
        this.expiryDates.push({ dateNormal: i, dateArabic: convertedNumber });
      }
    }
  }

  getMapLatlng(region) {
    this._userService.getLatlng(region).subscribe((res: any) => {
      if (res.status == "OK") {
        this.location = res.results[0].geometry.location;
      }
    })
  }

  getplacemapLoc(countryBound) {
    this.mapsAPILoader.load().then(() => {
      this.geoCoder = new google.maps.Geocoder;
      let autocomplete = new google.maps.places.Autocomplete(this.searchElement.nativeElement);
      autocomplete.setComponentRestrictions(
        { 'country': [countryBound] });
      autocomplete.addListener("place_changed", () => {
        this.ngZone.run(() => {
          //get the place result
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();
          console.log(place)
          this.businessLocForm.controls['address'].setValue(place.formatted_address);
          this.businessLocForm.controls['transAddress'].setValue(place.formatted_address);

          //verify result
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }

          //set latitude, longitude and zoom
          this.location.lat = place.geometry.location.lat();
          this.location.lng = place.geometry.location.lng();
          this.zoomlevel = 14;
        });
      });
    });

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

  errorValidate() {
    if (this.organizationForm.controls.orgName.status == "INVALID" && this.organizationForm.controls.orgName.touched) {
      this.orgNameError = true;
    }
    if (this.organizationForm.controls.transLangOrgName.status == "INVALID" && this.organizationForm.controls.transLangOrgName.touched) {
      this.transorgNameError = true;
    }
    if (this.businessLocForm.controls.address.status == "INVALID" && this.businessLocForm.controls.address.touched) {
      this.addressError = true;
    }
    if (this.businessLocForm.controls.transAddress.status == "INVALID" && this.businessLocForm.controls.transAddress.touched) {
      this.addressArError = true;
    }
    if (this.businessLocForm.controls.poBoxNo.status == "INVALID" && this.businessLocForm.controls.poBoxNo.touched) {
      this.poBoxError = true;
    }
    if (this.businessLocForm.controls.poBoxNoAr.status == "INVALID" && this.businessLocForm.controls.poBoxNoAr.touched) {
      this.poBoxArError = true;
    }

    if (this.informationForm.controls.licenseNo.status == "INVALID" && this.informationForm.controls.licenseNo.touched) {
      this.licenseError = true;
    }
    if (this.informationForm.controls.licenseNoAr.status == "INVALID" && this.informationForm.controls.licenseNoAr.touched) {
      this.translicenseError = true;
    }
    if (this.informationForm.controls.vatNo.status == "INVALID" && this.informationForm.controls.vatNo.touched) {
      this.vatError = true;
    }
    if (this.informationForm.controls.vatNoAr.status == "INVALID" && this.informationForm.controls.vatNoAr.touched) {
      this.vatNoArError = true;
    }

    if (this.contactInfoForm.controls.phone.status == "INVALID" && this.contactInfoForm.controls.phone.touched) {
      this.phoneError = true;
    }
    if (this.contactInfoForm.controls.transLangPhone.status == "INVALID" && this.contactInfoForm.controls.transLangPhone.touched) {
      this.translangPhoneError = true;
    }

    if (this.contactInfoForm.controls.fax.status == "INVALID" && this.contactInfoForm.controls.fax.touched) {
      this.faxError = true;
    }
    if (this.contactInfoForm.controls.transLangFax.status == "INVALID" && this.contactInfoForm.controls.transLangFax.touched) {
      this.translangFaxError = true;
    }


  }

  spaceHandler(event) {
    if (event.charCode == 32) {
      event.preventDefault();
      return false;
    }
  }

  getOrganizationList() {
    this._userbusinessService.getOrganizationType().subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        this.organizationList = JSON.parse(res.returnObject);
      }
    })
  }
  getsocialList() {
    this._userbusinessService.socialList().subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        this.socialLink = res.returnObject;
        console.log(this.socialLink);
      }
    })
  }

  markerDragEnd($event) {
    console.log($event);
    this.geoCoder.geocode({ 'location': { lat: $event.coords.lat, lng: $event.coords.lng } }, (results, status) => {
      console.log(results);
      console.log(status);
      if (status === 'OK') {
        if (results[0]) {
          console.log('aaaa');
          console.log(results[0].formatted_address);
          this.businessLocForm.controls['address'].setValue(results[0].formatted_address);
          this.businessLocForm.controls['transAddress'].setValue(results[0].formatted_address);
          this.searchElement.nativeElement.value = results[0].formatted_address;
          // console.log(this.searchElementRef.nativeElement.value);
          // infowindow.setContent(results[0].formatted_address);
        } else {
          this._toastr.error('No results found', '');
        }
      } else {
        this._toastr.error('Geocoder failed due to: ' + status, '');
      }

    });
  }

  selectMonth(name, type) {
    if (type == "issue") {
      if (name && name != 'undefined') {
        let selectedMonth = this.months.find(obj => (obj.name == name || obj.arabicName == name));
        this.IssueMonth = selectedMonth;
        this.selectedIssueMonth = selectedMonth.name;
        this.selectedIssueMonthAr = selectedMonth.arabicName;
        for (const key in this.dateValObj) {
          if (this.dateValObj.hasOwnProperty(key)) {
            let obj = this.dateValObj[key].find(obj => (obj.name == name || obj.arabicName == name));
            if (obj && Object.keys(obj).length) {
              this.getDates(key, type);
              this.issueValidate(selectedMonth.name, type, "month");
              this.monthndatefill(selectedMonth.name, "month");
              return
            }
            else if (!obj && name == 'Feb' || name == 'فبراير') {
              this.getDates(28, type);
              this.issueValidate(selectedMonth.name, type, "month");
              this.issueValidate(selectedMonth.name, type, "month");
              return
            }

          }
        }
      }
      else {
        this.IssueMonth = {};
        this.selectedIssueMonth = name;
        this.selectedIssueMonthAr = name;
        this.getDates(31, type);
      }
    }
    else if (type == "expire") {
      if (name && name != 'undefined') {
        let selectedMonth = this.months.find(obj => (obj.name == name || obj.arabicName == name));
        this.ExpireMonth = selectedMonth;
        this.selectedExpireMonth = selectedMonth.name;
        this.selectedExpireMonthAr = selectedMonth.arabicName;
        for (const key in this.dateValObj) {
          if (this.dateValObj.hasOwnProperty(key)) {
            let obj = this.dateValObj[key].find(obj => (obj.name == name || obj.arabicName == name));
            if (obj && Object.keys(obj).length) {
              this.getDates(key, type);
              this.issueValidate(selectedMonth.name, type, "month");
              return
            }
            else if (!obj && name == 'Feb' || name == 'فبراير') {
              this.getDates(28, type);
              this.issueValidate(selectedMonth.name, type, "month");
              return
            }

          }
        }
      }
      else {
        this.ExpireMonth = {};
        this.selectedExpireMonth = name;
        this.selectedExpireMonthAr = name;
        this.getDates(31, type);

      }
    }
  }
  onModelFaxChange(fromActive, currentActive, $controlName, $value) {
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
      this.contactInfoForm.controls[$controlName].patchValue(number.reverse().join(''));
    }
  }

  onModelTransFaxChange(fromActive, currentActive, $controlName, $value) {
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
      this.contactInfoForm.controls[$controlName].patchValue(number.join(''));
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
      this.contactInfoForm.controls[$controlName].patchValue(number.reverse().join(''));
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
      this.contactInfoForm.controls[$controlName].patchValue(number.join(''));
    }

  }

  onModelChange(fromActive, currentActive, $controlName, source, target, $value) {
    if (!this.showTranslatedLangSide) return;
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
    if (!this.showTranslatedLangSide) return;
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
    // else if(currentActive && !$value){
    //   this.fromActive(fromActive);    
    // }
  }





  addmoreSocialLink() {
    this.countAccount++
    this.socialAccounts.push(this.countAccount);
  }

  selectDate(date, type) {
    if (type == "issue") {
      if (date && date != 'undefined') {
        let selectedDate = this.issueDates.find(obj => (obj.dateNormal == date || obj.dateArabic == date));
        this.IssueDate = selectedDate;
        this.datenMonthValidator(selectedDate.dateNormal, type);
        this.issueValidate(selectedDate.dateNormal, type, "date");
        this.selectedIssueDate = selectedDate.dateNormal;
        this.selectedIssueDateAr = selectedDate.dateArabic;
      }
      else {
        this.IssueDate = {};
        this.datenMonthValidator(date, type)
        this.selectedIssueDate = date;
        this.selectedIssueDateAr = date;

      }
    }
    else if (type == "expire") {
      if (date && date != 'undefined') {
        let selectedDate = this.expiryDates.find(obj => (obj.dateNormal == date || obj.dateArabic == date));
        this.ExpireDate = selectedDate;
        this.datenMonthValidator(selectedDate.dateNormal, type);
        this.issueValidate(selectedDate.dateNormal, type, 'date');
        this.selectedExpireDate = selectedDate.dateNormal;
        this.selectedExpireDateAr = selectedDate.dateArabic;

      }
      else {
        this.ExpireDate = {};
        this.datenMonthValidator(date, type);
        this.selectedExpireDate = date;
        this.selectedExpireDateAr = date;

      }
    }
  }
  issueValidate(date, type, from) {
    if (type == "issue" && from == 'date') {
      if (this.selectedIssueMonth != undefined && this.selectedIssueYear != undefined) {
        if (this.selectedIssueYear < this.date.getFullYear()) return;
        else if (this.selectedIssueYear == this.date.getFullYear()) {
          for (let index = 0; index < this.months.length; index++) {
            if (this.months[index].name == this.selectedIssueMonth) {
              if (index == this.date.getMonth()) {
                if (date < this.date.getDate()) return;
                else if (date > this.date.getDate()) {
                  let dateValidate = "Issue date can not exceed from current date";
                  this._toastr.error(dateValidate, '');
                  console.log(dateValidate);
                  return;
                };
              }
              else if (index < this.date.getMonth()) return;
              else {
                let dateValidate = "Issue date can not exceed from current date";
                this._toastr.error(dateValidate, '');
                return;
              }
            }
          }
        }
      }
    }
    else if (type == "issue" && from == 'month') {
      if (this.selectedIssueDate != undefined && this.selectedIssueYear != undefined) {
        if (this.selectedIssueYear < this.date.getFullYear()) return;
        else if (this.selectedIssueYear == this.date.getFullYear()) {
          for (let index = 0; index < this.months.length; index++) {
            if (this.months[index].name == date) {
              if (index == this.date.getMonth()) {
                if (this.selectedIssueDate < this.date.getDate()) return;
                else if (date > this.date.getDate()) {
                  let dateValidate = "Issue date can not exceed from current date";
                  this._toastr.error(dateValidate, '');
                  return;
                };
              }
              else if (index < this.date.getMonth()) return;
              else {
                let dateValidate = "Issue date can not exceed from current date";
                this._toastr.error(dateValidate, '');
                return;
              }
            }
          }
        }
      }
    }
    else if (type == "issue" && from == 'year') {
      if (this.selectedIssueDate != undefined && this.selectedIssueMonth != undefined) {
        if (date < this.date.getFullYear()) return;
        else if (date == this.date.getFullYear()) {
          for (let index = 0; index < this.months.length; index++) {
            if (this.months[index].name == this.selectedIssueMonth) {
              if (index == this.date.getMonth()) {
                if (this.selectedIssueDate < this.date.getDate()) return;
                else if (this.selectedIssueDate > this.date.getDate()) {
                  let dateValidate = "Issue date can not exceed from current date";
                  this._toastr.error(dateValidate, '');
                  return;
                };
              }
              else if (index < this.date.getMonth()) return;
              else {
                let dateValidate = "Issue date can not exceed from current date";
                this._toastr.error(dateValidate, '');
                return;
              }
            }
          }
        }
      }
    }
    else if (type == "expire" && from == 'date') {
      if (this.selectedExpireMonth != undefined && this.selectedExpiryYear != undefined) {
        if (this.selectedIssueYear != undefined && this.selectedIssueYear == this.selectedExpiryYear) {
          let expiryIndex = this.months.map((obj) => obj.name).indexOf(this.selectedExpireMonth);
          let issueIndex = this.months.map((obj) => obj.name).indexOf(this.selectedIssueMonth);
          if (issueIndex < expiryIndex) return;
          else if (issueIndex == expiryIndex) {
            if (this.selectedIssueDate <= date) return;
            else {
              let dateValidate = "Expiry date can not be less than from issue date";
              this._toastr.error(dateValidate, '');
              return;
            }
          }
          else {
            let dateValidate = "Expiry date can not be less than from issue date";
            this._toastr.error(dateValidate, '');
            return;
          }
        }
      }
    }
    else if (type == "expire" && from == 'month') {
      if (this.selectedExpireDate != undefined && this.selectedExpiryYear != undefined) {
        if (this.selectedIssueYear != undefined && this.selectedIssueYear == this.selectedExpiryYear) {
          let expiryIndex = this.months.map((obj) => obj.name).indexOf(date);
          let issueIndex = this.months.map((obj) => obj.name).indexOf(this.selectedIssueMonth);
          if (issueIndex < expiryIndex) return;
          else if (issueIndex == expiryIndex) {
            if (this.selectedIssueDate <= this.selectedExpireDate) return;
            else {
              let dateValidate = "Expiry date can not be less than from issue date";
              this._toastr.error(dateValidate, '');
              return;
            }
          }
          else {
            let dateValidate = "Expiry date can not be less than from issue date";
            this._toastr.error(dateValidate, '');
            return;
          }
        }
      }
    }
    else if (type == "expire" && from == 'year') {
      if (this.selectedExpireMonth != undefined && this.selectedExpireDate != undefined) {
        if (this.selectedIssueYear != undefined && this.selectedIssueYear == date) {
          let expiryIndex = this.months.map((obj) => obj.name).indexOf(this.selectedExpireMonth);
          let issueIndex = this.months.map((obj) => obj.name).indexOf(this.selectedIssueMonth);
          if (issueIndex < expiryIndex) return;
          else if (issueIndex == expiryIndex) {
            if (this.selectedIssueDate <= this.selectedExpireDate) return;
            else {
              let dateValidate = "Expiry date can not be less than from issue date";
              this._toastr.error(dateValidate, '');
              return;
            }
          }
          else {
            let dateValidate = "Expiry date can not be less than from issue date";
            this._toastr.error(dateValidate, '');
            return;
          }
        }
      }
    }
  }
  datenMonthValidator(date, type) {

    if (type == 'issue') {
      if (date >= 30) {
        for (let key in this.dateValObj) {
          if (key == date && date != 30) {
            this.issueMonths = this.dateValObj[key];
            return;
          }
          else if (key == date && date == 30) {
            let arr = this.dateValObj[key].concat(this.dateValObj[31]);
            this.issueMonths = arr.sort((a, b) => {
              return this.months.map(obj => obj.name).indexOf(a.name) - this.months.map(obj => obj.name).indexOf(b.name);
            });
            return;
          }
        }
      }
      else {
        this.issueMonths = this.dateValObj.allMonths;
      }
    }
    else if (type == 'expire') {
      if (date >= 30) {
        for (let key in this.dateValObj) {
          if (key == date && date != 30) {
            this.expiryMonths = this.dateValObj[key];
          }
          else if (key == date && date == 30) {
            let arr = this.dateValObj[key].concat(this.dateValObj[31]);
            this.expiryMonths = arr.sort((a, b) => {
              return this.months.map(obj => obj.name).indexOf(a.name) - this.months.map(obj => obj.name).indexOf(b.name);
            });
            return;
          }
        }
      }
      else {
        this.expiryMonths = this.dateValObj.allMonths;
      }
    }
  }
  organizationType(type) {
    if (type && type != 'undefined') {
      let selectedOrganization = this.organizationList.find(obj => (obj.BaseLang == type || obj.OtherLang == type));
      this.orgType = selectedOrganization;
      this.selectedOrgType = selectedOrganization.BaseLang;
      this.selectedOrgTypeAr = selectedOrganization.OtherLang;
    }
    else {
      this.orgType = {};
      this.selectedOrgType = type;
      this.selectedOrgTypeAr = type;
    }
  }
  NumberValid(evt) {
    let charCode = (evt.which) ? evt.which : evt.keyCode
    if (charCode > 31 && (charCode < 48 || charCode > 57))
      return false;
    return true;
  }

  socialLinkValidate(){
    let title = 'Website';
    if (this.socialSites && this.selectedSocialsite && this.selectedSocialsite.title){
      let index = this.selectedSocialsite.title.toLowerCase().indexOf(this.socialSites.toLowerCase());
    this.socialInputValidate =  (index < 0)? 'Your social url is not valid':'';
    }
    else{
      let index = title.toLowerCase().indexOf(this.socialSites.toLowerCase());
      this.socialInputValidate = (index < 0) ? 'Your social url is not valid' : ''; 
    }
  }


  selectPhoneCode(list) {
    this.countryFlagImage = list.code;
    let description = list.desc;
    this.phoneCode = description[0].CountryPhoneCode;
    this.transPhoneCode = description[0].CountryPhoneCode_OtherLang;
    this.phoneCountryId = list.id
  }
  selectYear(year, type) {
    if (type == "issue") {
      if (year && year != 'undefined') {
        let selectedYear = this.pastYears.find(obj => (obj.yearNormal == year || obj.yearArabic == year));
        this.IssueYear = selectedYear;
        this.selectedIssueYear = selectedYear.yearNormal;
        this.selectedIssueYearAr = selectedYear.yearArabic;
        this.issueValidate(selectedYear.yearNormal, type, 'year');
        this.monthndatefill(selectedYear.yearNormal, 'year');
      }
      else {
        this.IssueYear = {};
        this.selectedIssueYear = year;
        this.selectedIssueYearAr = year;
      }
    }
    else if (type == "expire") {
      if (year && year != 'undefined') {
        let selectedYear = this.futureYears.find(obj => (obj.yearNormal == year || obj.yearArabic == year));
        this.ExpiryYear = selectedYear;
        this.selectedExpiryYear = selectedYear.yearNormal;
        this.selectedExpiryYearAr = selectedYear.yearArabic;
        this.issueValidate(selectedYear.yearNormal, type, 'year');
      }
      else {
        this.ExpiryYear = {};
        this.selectedExpiryYear = year;
        this.selectedExpiryYearAr = year
      }
    }
  }
  // leapvalid(type){
  //   if(type=='issue'){
  //     if(this.selectedIssueDate !=undefined && this.selectedIssueDate == 29 &&  this.selectedIssueYear !=undefined){
  //       if(!leapYear(this.selectedIssueYear)){
  //         let index= this.issueMonths.map(obj=>obj.name).indexOf('Feb');
  //         this.issueMonths.splice(0,index);
  //       }
  //        else{
  //          this.issueMonths =this.months;
  //        }
  //     }
  //   }

  // }
  monthndatefill(val, type) {
    if (type == 'year') {
      if (val != undefined && val == this.date.getFullYear()) {
        let months = Object.assign([], this.months);
        this.issueMonths = months.slice(0, this.date.getMonth() + 1);
        if (this.selectedIssueMonth) {
          let ind = this.months.map(obj => obj.name).indexOf(this.selectedIssueMonth);
          if (ind == this.date.getMonth()) {
            this.getDates(this.date.getDate(), 'issue');
          }
        }
      }
      else {
        this.issueMonths = Object.assign([], this.months);
        if (this.selectedIssueMonth == undefined || !this.selectedIssueMonth) {
        this.getDates(31, 'issue');
        }
        else if (this.selectedIssueMonth != undefined){
            for (const key in this.dateValObj) {
              if (this.dateValObj.hasOwnProperty(key)) {
                let obj = this.dateValObj[key].find(obj => (obj.name == this.selectedIssueMonth || obj.arabicName == this.selectedIssueMonthAr));
                if (obj && Object.keys(obj).length) {
                  this.getDates(key, 'issue');
                  return
                }
                else if (!obj && this.selectedIssueMonth == 'Feb' || this.selectedIssueMonthAr == 'فبراير') {
                  this.getDates(28, 'issue');
                  return

              }
            }
          }
        }
      }
    }
    else if (type == 'month') {
      if (val != undefined) {
        let index = this.months.map(obj => obj.name).indexOf(val);
        if (index == this.date.getMonth()) this.getDates(this.date.getDate(), 'issue');
        if (this.selectedIssueYear == this.date.getFullYear()) {
          let months = Object.assign([], this.months);
          this.issueMonths = months.slice(0, this.date.getMonth() + 1);
        }
      }
      else {
        this.getDates(31, 'issue');
        this.issueMonths = Object.assign([], this.months);

      }
    }

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
    console.log(this.serviceIds);

  }

  getTenYears() {
    let date = new Date();
    let persianDigits = "۰۱۲۳۴۵۶۷۸۹";
    let persianMap = persianDigits.split("");
    for (let i = 0; i < 11; i++) {
      let pastyear = date.getFullYear() - i;
      let convertedPastYear = pastyear.toString().replace(/\d/g, (m: string) => {
        return persianMap[parseInt(m)]
      });
      this.pastYears.push({ yearNormal: pastyear, yearArabic: convertedPastYear });
    };
    for (let i = 0; i < 2; i++) {
      let futureyear = date.getFullYear() + i
      let convertedFutureYear = futureyear.toString().replace(/\d/g, (m: string) => {
        return persianMap[parseInt(m)]
      });
      this.futureYears.push({ yearNormal: futureyear, yearArabic: convertedFutureYear });

    }
  }



  nextForm() {
    this._sharedService.formChange.next(false);
    this._sharedService.formProgress.next(50);
    console.log(this.informationForm.value);


    let businessDetail = {
      informationForm: this.informationForm.value,
      businessLocForm: this.businessLocForm.value,
      organizationForm: this.organizationForm.value,
      contactInfoForm: this.contactInfoForm.value,
      issueDate: this.informationForm.value.issueDate + '/' + this.informationForm.value.issueMonth + '/' + this.informationForm.value.issueYear,
      expiryDate: this.informationForm.value.expireDate + '/' + this.informationForm.value.expireMonth + '/' + this.informationForm.value.expiryYear,
      location: this.location,
      logisticsService: this.serviceIds,
      licenseDocx: this.selectedLicense,
      logo: this.selectedLogo,
      license: this.selectedLicense,
      busiType: this.orgType,
      OtherLangPhoneCode: this.transPhoneCode,
      baseLangPhoneCode: this.phoneCode

    }
    this._sharedService.businessDetailObj.next(businessDetail);

  }

  removeSelectedDocx(type) {
    if (type == "license") {
      this.selectedLicense = {}
    }
    else if (type == "logo") {
      this.selectedLogo = {}
    }
  }



  SelectDocx(selectedFiles: any, type): void {
    console.log(selectedFiles)
    if (type == 'license') {

      // if (selectedFiles.status !== NgFilesStatus.STATUS_SUCCESS) {
      //   if (selectedFiles.status == 1) this._toastr.error('Please select only one file to upload', '')
      //   else if (selectedFiles.status == 2) this._toastr.error('File format is not supported please select supported format file', '')
      //   // this.selectedFiles = selectedFiles.status;
      //   console.log('in if');
      //   return;
      // } else {
      // console.log('in else ');

      try {
        this.onFileChange(selectedFiles, 'license')
      } catch (error) {
        console.log(error);
      }
      // }
    }
    else if (type == 'logo') {

      // if (selectedFiles.status !== NgFilesStatus.STATUS_SUCCESS) {
      //   if (selectedFiles.status == 1) this._toastr.error('Please select only one file to upload', '')
      //   else if (selectedFiles.status == 2) this._toastr.error('File format is not supported please select supported format file', '')
      //   // this.selectedFiles = selectedFiles.status;
      //   console.log('in if');
      //   return;
      // } else {
      //   console.log('in else ');

      try {
        this.onFileChange(selectedFiles, 'logo')
      } catch (error) {
        console.log(error);
      }
      // }
    }
  }

  onFileChange(event, type) {
    let reader = new FileReader();

    if (event) {
      try {
        let file = event[0];
        reader.readAsDataURL(file);
        reader.onload = () => {

          let selectedFile: DocumentFile = {
            fileName: file.name,
            fileType: file.type,
            fileBaseString: reader.result.split(',')[1]
          }

          console.log('you file content:', selectedFile);

          if (type === 'license') {
            this.selectedLicense = selectedFile
          }

          if (type === 'logo') {
            this.selectedLogo = selectedFile
          }

        };
      } catch (err) {
        console.log(err);
      }
    }
  }


  selectedSocialLink(obj, index) {
    this.selectedSocialsite = obj;
    this.socialLinkValidate();

  }

}

export interface DocumentFile {
  fileBaseString: string
  fileName: string
  fileType: string
}
