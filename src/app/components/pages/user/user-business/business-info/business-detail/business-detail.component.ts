import { Component, OnInit, NgZone, ElementRef, ViewChild, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
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
import { HttpErrorResponse } from '@angular/common/http';
import { DocumentUpload } from '../../../../../../interfaces/document.interface';
import { element } from 'protractor';
import { baseApi } from '../../../../../../constants/base.url';

@Component({
  selector: 'app-business-detail',
  templateUrl: './business-detail.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./business-detail.component.scss']
})
export class BusinessDetailComponent implements OnInit {

  @ViewChild('search') public searchElement: ElementRef;
  @ViewChild('selectService') public serviceMode: ElementRef;
  @ViewChild('tradeDoc') public tradeDoc: ElementRef;

  public debounceInput: Subject<string> = new Subject();
  public requiredFields: string = "This field is required";
  public requiredFieldsOthrLng: string = "هذه الخانة مطلوبه";
  public selectedLicense;
  public selectedLogo;
  public selectedSocialsite: any = {};
  
  public uploadDocs: Array<DocumentUpload> = []

  private config: NgFilesConfig = {
    acceptExtensions: ['jpeg', 'jpg', 'png', 'pdf', 'bmp'],
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
  public addressAr2: any;
  public cityAr: any;

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
  public addressArError2: boolean;
  public addressError2: boolean;
  public cityArError: boolean;
  public cityError: boolean;
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
  public comSubLabelBaseLanguage;
  public comSubLabelOtherLanguage;
  public comLabelBaseLanguage;
  public comLabelOtherLanguage;
  public busLocLabelBaseLanguage;
  public busLocLabelOtherLanguage;
  public addLabelBaseLanguage;
  public addLabelOtherLanguage;
  public addLabel2BaseLanguage;
  public addLabel2OtherLanguage;
  public cityLabelBaseLanguage;
  public cityLabelOtherLanguage;
  public poBoxLabelBaseLanguage;
  public poBoxLabelOtherLanguage;
  public busInfoLabelBaseLanguage;
  public busInfoLabelOtherLanguage;
  public uploadlogoLabelBaseLanguage;
  public uploadlogoLabelOtherLanguage;
  public orgNameLabelBaseLanguage;
  public orgNameLabelOtherLanguage;
  public orgHintLabelBaseLanguage;
  public orgHintLabelOtherLanguage;
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
    private ngFilesService: NgFilesService,
    private sanitizer: DomSanitizer

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
    }
    this.getsocialList();
    this.getOrganizationList();
    this.getTenYears('issue', 0);
    this.getTenYears('expire', 0);
    this.getDates(31, 'both');

    this._userbusinessService.getServiceOffered().subscribe((res: any) => {
      if (res.returnStatus == 'Success') {
        this.serviceOffered = JSON.parse(res.returnObject);
      }
    }, (err: HttpErrorResponse) => {
      console.log(err);
    })

    this._sharedService.countryList.subscribe((state: any) => {
      if (state) {
        this.countryList = state;
        let selectedCountry = this.countryList.find(obj => obj.id == this.userProfile.countryID);
        this.selectPhoneCode(selectedCountry);
        // this.getplacemapLoc(selectedCountry.code.toLowerCase());
        // this.getMapLatlng(selectedCountry.title);
      }

    });

    this.informationForm = new FormGroup({
      licenseNo: new FormControl(null, [Validators.required, Validators.minLength(4), Validators.maxLength(10)]),
      licenseNoAr: new FormControl(null, [CustomValidator.bind(this), Validators.minLength(4), Validators.maxLength(10)]),
      vatNo: new FormControl(null, [Validators.pattern(/^(?!(\d)\1+(?:\1+){0}$)\d+(\d+){0}$/), Validators.minLength(5), Validators.maxLength(12)]),
      vatNoAr: new FormControl(null, [Validators.minLength(5), Validators.maxLength(12)]),

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
      address: new FormControl(null, [Validators.required, Validators.maxLength(200), Validators.minLength(10), Validators.pattern(/^(?=.*?[a-zA-Z])[^%*$=+^<>}{]+$/)]),
      transAddress: new FormControl(null, [CustomValidator.bind(this), Validators.maxLength(200), Validators.minLength(10), Validators.pattern(/^(?=.*?[a-zA-Z])[^%*$=+^<>}{]+$/)]),
      address2: new FormControl(null, [Validators.maxLength(200), Validators.minLength(10), Validators.pattern(/^(?=.*?[a-zA-Z])[^%*$=+^<>}{]+$/)]),
      transAddress2: new FormControl(null, [Validators.maxLength(200), Validators.minLength(10), Validators.pattern(/^(?=.*?[a-zA-Z])[^%*$=+^<>}{]+$/)]),
      city: new FormControl(null, [Validators.required, Validators.maxLength(100), Validators.minLength(3), Validators.pattern(/^(?=.*?[a-zA-Z])[^%*$=+^<>}{]+$/)]),
      transCity: new FormControl(null, [CustomValidator.bind(this), Validators.maxLength(100), Validators.minLength(3), Validators.pattern(/^(?=.*?[a-zA-Z])[^%*$=+^<>}{]+$/)]),  
      poBoxNo: new FormControl(null, [Validators.required, Validators.maxLength(16), Validators.minLength(4)]),
      poBoxNoAr: new FormControl(null, [CustomValidator.bind(this), Validators.maxLength(16), Validators.minLength(4)]),
    });

    this.organizationForm = new FormGroup({
      organizationType: new FormControl(null, [Validators.required]),
      organizationTypeAr: new FormControl(null, [CustomValidator.bind(this)]),
      orgName: new FormControl(null, [Validators.required, Validators.maxLength(100), Validators.minLength(4)]),
      transLangOrgName: new FormControl(null, [CustomValidator.bind(this), Validators.maxLength(100), Validators.minLength(2)]),
    });
    this.contactInfoForm = new FormGroup({
      phone: new FormControl(null, [Validators.required, Validators.pattern(/^(?!(\d)\1+(?:\1+){0}$)\d+(\d+){0}$/), Validators.minLength(7), Validators.maxLength(13)]),
      transLangPhone: new FormControl(null, [CustomValidator.bind(this), Validators.minLength(7), Validators.maxLength(13)]),
      fax: new FormControl(null, [Validators.pattern(/^(?!(\d)\1+(?:\1+){0}$)\d+(\d+){0}$/), Validators.minLength(7), Validators.maxLength(13)]),
      transLangFax: new FormControl(null, [Validators.minLength(7), Validators.maxLength(13)]),
      socialUrl: new FormArray([ new FormControl(null)]),
      // socialUrlOther: new FormArray(null),

    });

    this._sharedService.documentList.subscribe((state: any) => {
      if (state) {
        let copy = Object.assign([], state)
        this.uploadDocs = copy.filter(element => element.BusinessLogic)

      }
    });

  }

  getLabels(obj) {
    this._sharedService.businessProfileJsonLabels.subscribe((state: any) => {
      if (state) {
        let data = state;
        // console.log(data, 'translation')
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
          else if (element.keyCode == "lbl_CompanyActivities") {
            this.comSubLabelBaseLanguage = element.baseLang;
            this.comSubLabelOtherLanguage = element.otherLang;
          }
          else if (element.keyCode == "lbl_CompanyActivitiesHeading") {
            this.comLabelBaseLanguage = element.baseLang;
            this.comLabelOtherLanguage = element.otherLang;
          }
          else if (element.keyCode == "lbl_BusinessLoc") {
            this.busLocLabelBaseLanguage = element.baseLang;
            this.busLocLabelOtherLanguage = element.otherLang;
          }
          else if (element.keyCode == "lbl_Address") {
            this.addLabelBaseLanguage = element.baseLang;
            this.addLabelOtherLanguage = element.otherLang;
          }
          else if (element.keyCode == "lbl_AddressLine2") {
            this.addLabel2BaseLanguage = element.baseLang;
            this.addLabel2OtherLanguage = element.otherLang;
          }
          else if (element.keyCode == "lbl_City") {
            this.cityLabelBaseLanguage = element.baseLang;
            this.cityLabelOtherLanguage = element.otherLang;
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
          else if (element.keyCode == "lbl_OrganizationTextHint") {
            this.orgHintLabelBaseLanguage = element.baseLang;
            this.orgHintLabelOtherLanguage = element.otherLang;
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
          // this.businessLocForm.controls['address'].setValue(place.formatted_address);
          // this.businessLocForm.controls['transAddress'].setValue(place.formatted_address);

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
    if (this.businessLocForm.controls.address2.status == "INVALID" && this.businessLocForm.controls.address2.touched) {
      this.addressError2 = true;
    }
    if (this.businessLocForm.controls.transAddress2.status == "INVALID" && this.businessLocForm.controls.transAddress2.touched) {
      this.addressArError2 = true;
    }
    if (this.businessLocForm.controls.city.status == "INVALID" && this.businessLocForm.controls.city.touched) {
      this.cityError = true;
    }
    if (this.businessLocForm.controls.transCity.status == "INVALID" && this.businessLocForm.controls.transCity.touched) {
      this.cityArError = true;
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
        this.selectedSocialsite = this.socialLink.pop();
        // console.log(this.socialLink);
      }
    })
  }

  markerDragEnd($event) {
    // console.log($event);
    this.geoCoder.geocode({ 'location': { lat: $event.coords.lat, lng: $event.coords.lng } }, (results, status) => {
      console.log(results);
      console.log(status);
      if (status === 'OK') {
        if (results[0]) {
          console.log('aaaa');
          console.log(results[0].formatted_address);
          // this.businessLocForm.controls['address'].setValue(results[0].formatted_address);
          // this.businessLocForm.controls['transAddress'].setValue(results[0].formatted_address);
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
        this.monthndatefill(selectedMonth.name, "month");
        this.fillerValidate(selectedMonth.name, type, "month");
        for (const key in this.dateValObj) {
          if (this.dateValObj.hasOwnProperty(key)) {
            let obj = this.dateValObj[key].find(obj => (obj.name == name || obj.arabicName == name));
            if (obj && Object.keys(obj).length) {
              this.getDates(key, type);
              // this.issueValidate(selectedMonth.name, type, "month");
              return;
            }
            else if (!obj && name == 'Feb' || name == 'فبراير') {
              this.leapValid(type, 'month');
              // this.issueValidate(selectedMonth.name, type, "month");
              return;
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
        this.fillerValidate(selectedMonth.name, type, "month");

        // for (const key in this.dateValObj) {
        //   if (this.dateValObj.hasOwnProperty(key)) {
        //     let obj = this.dateValObj[key].find(obj => (obj.name == name || obj.arabicName == name));
        //     if (obj && Object.keys(obj).length) {
        //       this.getDates(key, type);
        //       // this.issueValidate(selectedMonth.name, type, "month");
        //       return
        //     }
        //     else if (!obj && name == 'Feb' || name == 'فبراير') {
        //       this.leapValid(type, 'month');
        //       // this.issueValidate(selectedMonth.name, type, "month");
        //       return
        //     }

        //   }
        // }
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
    (<FormArray>this.contactInfoForm.get('socialUrl')).push(new FormControl(null))
    // this.countAccount++
    // this.socialAccounts.push(this.countAccount);
  }
  removeSocialSite(index){
    (<FormArray>this.contactInfoForm.get('socialUrl')).removeAt(index)
  }

  selectDate(date, type) {
    if (type == "issue") {
      if (date && date != 'undefined') {
        let selectedDate = this.issueDates.find(obj => (obj.dateNormal == date || obj.dateArabic == date));
        this.IssueDate = selectedDate;
        this.datenMonthValidator(selectedDate.dateNormal, type);
        // this.issueValidate(selectedDate.dateNormal, type, "date");
        this.fillerValidate(selectedDate.dateNormal, type, "date");
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
        // this.datenMonthValidator(selectedDate.dateNormal, type);
        this.fillerValidate(selectedDate.dateNormal, type, 'date');
        // this.issueValidate(selectedDate.dateNormal, type, 'date');
        this.selectedExpireDate = selectedDate.dateNormal;
        this.selectedExpireDateAr = selectedDate.dateArabic;

      }
      else {
        this.ExpireDate = {};
        // this.datenMonthValidator(date, type);
        this.selectedExpireDate = date;
        this.selectedExpireDateAr = date;

      }
    }
  

  }


  validateDates():boolean{

      let elemissueDate = document.getElementById('100') as any;
      let elemissueMonth = document.getElementById('101') as any;
      let elemissueYear = document.getElementById('102') as any;
      let elemExpDate = document.getElementById('106') as any;
      let elemExpMonth = document.getElementById('107') as any;
      let elemExpYear = document.getElementById('108') as any;

    return (
      elemExpDate.value == 'DD' || elemExpMonth.value == 'MM' || elemExpYear.value == "YYYY" || elemissueDate.value == 'DD' || elemissueMonth.value == 'MM' || elemissueYear.value == "YYYY" ||
      elemExpDate.value == 'undefined' || elemExpMonth.value == 'undefined' || elemExpYear.value == "undefined" || elemissueDate.value == 'undefined' || elemissueMonth.value == 'undefined' || elemissueYear.value == "undefined"
    );

    
  }
  monthSorter(date){
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

  expireDateSorter(month){
       for (const key in this.dateValObj) {
              if (this.dateValObj.hasOwnProperty(key)) {
                let obj = this.dateValObj[key].find(obj => (obj.name == month));
                if (obj && Object.keys(obj).length) {
                  this.expiryDate(1, key);
                  return
                }
                else if (!obj && this.selectedExpireMonth == 'Feb' || this.selectedExpireMonthAr == 'فبراير') {
                  // this.leapValid('issue', type)
                  return
                }
         }
        }
  }

  fillerValidate(date, type, from) {

    if (type == 'issue') {
      if (from == 'date') {
        if (this.selectedIssueMonth != undefined) {
          let index = this.months.map(obj => obj.name).indexOf(this.selectedIssueMonth);
          if (index == this.date.getMonth()) {
            if (date <= this.date.getDate()) {
              this.getTenYears(type, 0);
            }
            else {
              this.getTenYears(type, 1);
            }
          }
          else if (index < this.date.getMonth()) {
            this.getTenYears(type, 0);
          }
          else {
            this.getTenYears(type, 1);
          }
        }
      }
      else if (from == 'month') {
        if (this.selectedIssueDate != undefined) {
          let index = this.months.map(obj => obj.name).indexOf(date);
          if (index == this.date.getMonth()) {
            if (this.selectedIssueDate <= this.date.getDate()) {
              this.getTenYears(type, 0);
            }
            else {
              this.getTenYears(type, 1);
            }
          }
          else if (index < this.date.getMonth()) {
            this.getTenYears(type, 0);
          }
          else {
            this.getTenYears(type, 1);
          }
        }
      }

    }
    
    else if (type == 'expire') {
      if (from == 'date') {
        this.monthSorter(date);
        if (this.selectedExpireMonth != undefined) {
          let index = this.months.map(obj => obj.name).indexOf(this.selectedExpireMonth);
          if (index < this.date.getMonth()) {
            this.getTenYears(type, 1);
          }
          else if (index == this.date.getMonth()) {
            if (date <= this.date.getDate()) {
              this.getTenYears(type, 1);
            }
            else {
              this.getTenYears(type, 0);
            }
          }
          else if (index < this.date.getMonth()) {
            this.getTenYears(type, 1);
          }
          else {
            this.getTenYears(type, 0);
          }
        }
        // else if (this.selectedExpiryYear != undefined){
        //   if (this.selectedExpiryYear == this.date.getFullYear()){
        //     let months = Object.assign([], this.months);
        //       this.expiryMonths = [];
        //       this.expiryMonths = months.slice(this.date.getMonth());
        //   }
        //   else {
        //     this.expiryMonths = this.months;
        //   }
        // }
      }
      else if (from == 'month') {
        if (this.selectedExpireDate && this.selectedExpireDate != "undefined" && !this.selectedExpiryYear) {
          let index = this.months.map(obj => obj.name).indexOf(date);
          if (index < this.date.getMonth()) {
            this.getTenYears(type, 1);
            this.expireDateSorter(date);
          }
          else if (index == this.date.getMonth()) {
            if (this.selectedExpireDate <= this.date.getDate()) {
              this.getTenYears(type, 1);
              this.expireDateSorter(date);
              
            }
            else {
              this.getTenYears(type, 0);
              this.expireDateSorter(date);
                
            }
          }
          else {
            this.getTenYears(type, 0);
            this.expireDateSorter(date);
          }
        }
        else if (this.selectedExpireDate && this.selectedExpireDate != "undefined" && this.selectedExpiryYear && this.selectedExpiryYear != 'undefined'){
          if (this.selectedExpiryYear == this.date.getFullYear()){
          let index = this.months.map(obj => obj.name).indexOf(date);
          if (index == this.date.getMonth()){
            if (this.selectedExpireDate > this.date.getDate()) {
              this.getTenYears(type, 0);
            }
            for (const key in this.dateValObj) {
              if (this.dateValObj.hasOwnProperty(key)) {
                let obj = this.dateValObj[key].find(obj => (obj.name == date));
                if (obj && Object.keys(obj).length) {
                  this.expiryDate(this.date.getDate()+1, key);
                  return
                }
              }
            }
        
          }
          else if (index < this.date.getMonth()){
            this.getTenYears(type, 1);
            this.expireDateSorter(date);
            
          }
          else{
            this.getTenYears(type, 0);
            this.expireDateSorter(date);
            
          }
          }
          else if(this.selectedExpiryYear > this.date.getFullYear()){
            let index = this.months.map(obj => obj.name).indexOf(date);
            if (index < this.date.getMonth()) {
              this.getTenYears(type, 1);
              this.expireDateSorter(date);
              }
            else if (index > this.date.getMonth()) {
              this.getTenYears(type, 0);
              this.expireDateSorter(date);
            }
            else{
              if (this.selectedExpireDate > this.date.getDate()) {
                this.getTenYears(type, 0);
                this.expireDateSorter(date);
                for (const key in this.dateValObj) {
                  if (this.dateValObj.hasOwnProperty(key)) {
                    let obj = this.dateValObj[key].find(obj => (obj.name == date));
                    if (obj && Object.keys(obj).length) {
                      this.expiryDate(this.date.getDate() + 1, key);
                      return
                    }
                  }
                }
              }
              else {
                for (const key in this.dateValObj) {
                  if (this.dateValObj.hasOwnProperty(key)) {
                    let obj = this.dateValObj[key].find(obj => (obj.name == date));
                    if (obj && Object.keys(obj).length) {
                      this.getDates(key, 'expire');
                      return
                    }
                  }
                }
              }
       
            }
          }
          
        }
        else{
          let index = this.months.map(obj => obj.name).indexOf(date);
          if (index == this.date.getMonth() && this.selectedExpiryYear == this.date.getFullYear()) {
            if (this.selectedExpireDate > this.date.getDate()) {
              this.getTenYears(type, 0);
              for (const key in this.dateValObj) {
                if (this.dateValObj.hasOwnProperty(key)) {
                  let obj = this.dateValObj[key].find(obj => (obj.name == date));
                  if (obj && Object.keys(obj).length) {
                    this.expiryDate(this.date.getDate() + 1, key);
                    return
                  }
                }
              }
            }
            else{
            for (const key in this.dateValObj) {
              if (this.dateValObj.hasOwnProperty(key)) {
                let obj = this.dateValObj[key].find(obj => (obj.name == date));
                if (obj && Object.keys(obj).length) {
                  this.getDates(key, 'expire');
                  return
                }
              }
            }
            }

          }
          else{
            this.expireDateSorter(date);
          }
        }
        //   let index = this.months.map(obj => obj.name).indexOf(date);
        //   if (index == this.date.getMonth() && this.selectedExpiryYear == this.date.getFullYear()) {
        //     for (const key in this.dateValObj) {
        //       if (this.dateValObj.hasOwnProperty(key)) {
        //         let obj = this.dateValObj[key].find(obj => (obj.name == this.selectedExpireMonth || obj.arabicName == this.selectedExpireMonthAr));
        //         if (obj && Object.keys(obj).length) {
        //           this.expiryDate(this.date.getDate()+1, key);
        //           return
        //         }
        //         else if (!obj && this.selectedExpireMonth == 'Feb' || this.selectedExpireMonthAr == 'فبراير') {
        //           this.leapValid('issue', type)
        //           return

        //         }
        //       }
        //     }
           
        //   }
        //   else{
        //     for (const key in this.dateValObj) {
        //       if (this.dateValObj.hasOwnProperty(key)) {
        //         let obj = this.dateValObj[key].find(obj => (obj.name == this.selectedExpireMonth || obj.arabicName == this.selectedExpireMonthAr));
        //         if (obj && Object.keys(obj).length) {
        //           this.getDates(key, type);
        //           return
        //         }
        //         else if (!obj && this.selectedExpireMonth == 'Feb' || this.selectedExpireMonthAr == 'فبراير') {
        //           this.leapValid('issue', type)
        //           return

        //         }
        //       }
        //     }
        //   }
        // }
      }

    }
  }



  expiryDate(startLimit, endLimit){
    let persianDigits = "۰۱۲۳۴۵۶۷۸۹";
    let persianMap = persianDigits.split("");
      this.expiryDates = [];
      for (let i = startLimit; i <= endLimit; i++) {
        let convertedNumber = i.toString().replace(/\d/g, (m: string) => {
          return persianMap[parseInt(m)]
        });
        this.expiryDates.push({ dateNormal: i, dateArabic: convertedNumber });
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

  socialLinkValidate() {
    let title = 'Website';
    if (this.socialSites && this.selectedSocialsite && this.selectedSocialsite.title) {
      let index = this.selectedSocialsite.title.toLowerCase().indexOf(this.socialSites.toLowerCase());
      this.socialInputValidate = (index < 0) ? 'Your social url is not valid' : '';
    }
    else {
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
        // this.issueValidate(selectedYear.yearNormal, type, 'year');
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
        this.expirymonthFiller(year);
        // this.leapValid(type, 'year');
        // this.issueValidate(selectedYear.yearNormal, type, 'year');
      }
      else {
        this.ExpiryYear = {};
        this.selectedExpiryYear = year;
        this.selectedExpiryYearAr = year
      }
    }
  }

  expirymonthFiller(year){
    let months = Object.assign([], this.months);
    if(year == this.date.getFullYear()){
      this.expiryMonths = [];
      this.expiryMonths = months.slice(this.date.getMonth());
      if(this.selectedExpireMonth != undefined){
        let index = this.months.map(obj => obj.name).indexOf(this.selectedExpireMonth);
        if (index == this.date.getMonth()) {
          for (const key in this.dateValObj) {
            if (this.dateValObj.hasOwnProperty(key)) {
              let obj = this.dateValObj[key].find(obj => (obj.name == this.selectedExpireMonth || obj.arabicName == this.selectedExpireMonthAr));
              if (obj && Object.keys(obj).length) {
                this.expiryDate(this.date.getDate() + 1, key);
                return
              }
              else if (!obj && this.selectedExpireMonth == 'Feb' || this.selectedExpireMonthAr == 'فبراير') {
                this.leapValid('expire', 'year')
                return

              }
            }
          }

        }
        else if (index > this.date.getMonth()){
          for (const key in this.dateValObj) {
            if (this.dateValObj.hasOwnProperty(key)) {
              let obj = this.dateValObj[key].find(obj => (obj.name == this.selectedExpireMonth || obj.arabicName == this.selectedExpireMonthAr));
              if (obj && Object.keys(obj).length) {
                this.getDates(key, 'expire');
                return
              }
              else if (!obj && this.selectedExpireMonth == 'Feb' || this.selectedExpireMonthAr == 'فبراير') {
                this.leapValid('expire', 'year')
                return

              }
            }
          }
        }
      }
    }
    else{
      this.expiryMonths = months;
      for (const key in this.dateValObj) {
        if (this.dateValObj.hasOwnProperty(key)) {
          let obj = this.dateValObj[key].find(obj => (obj.name == this.selectedExpireMonth || obj.arabicName == this.selectedExpireMonthAr));
          if (obj && Object.keys(obj).length) {
            this.getDates(key, 'expire');
            return
          }
          else if (!obj && this.selectedExpireMonth == 'Feb' || this.selectedExpireMonthAr == 'فبراير') {
            this.leapValid('expire', 'year')
            return

          }
        }
      }
    }
  }

  leapValid(type, from) {
    if (type == 'issue') {
      if (from == 'month') {
        if (this.selectedIssueYear != undefined) {
          (!leapYear(this.selectedIssueYear)) ? this.getDates(28, 'issue') : this.getDates(29, 'issue');
        }
        else{
          this.getDates(28, 'issue');
        }
      }
      else if (from == 'year') {
        if (this.selectedIssueMonth == 'Feb') {
          (!leapYear(this.selectedIssueYear)) ? this.getDates(28, 'issue') : this.getDates(29, 'issue');
        }
      }
    }

    else if (type == 'expire') {
      if (from == 'month') {
        if (this.selectedExpiryYear != undefined) {
          (!leapYear(this.selectedExpiryYear)) ? this.getDates(28, 'expire') : this.getDates(29, 'expire');
        }
        else{
          this.getDates(28, 'expire');
        }
      }
      else if (from == 'year') {
        if (this.selectedExpireMonth != undefined) {
          for (const key in this.dateValObj) {
            if (this.dateValObj.hasOwnProperty(key)) {
              let obj = this.dateValObj[key].find(obj => (obj.name == this.selectedExpireMonth || obj.arabicName == this.selectedExpireMonthAr));
              if (obj && Object.keys(obj).length) {
                this.getDates(key, 'expire');
                return
              }
              else if (!obj && this.selectedExpireMonth == 'Feb' || this.selectedExpireMonthAr == 'فبراير') {
                (!leapYear(this.selectedExpiryYear)) ? this.getDates(28, 'expire') : this.getDates(29, 'expire');
                return

              }
            }
          }
        }
      }
    }
  }
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
          else if (this.selectedIssueMonth != undefined) {
            for (const key in this.dateValObj) {
              if (this.dateValObj.hasOwnProperty(key)) {
                let obj = this.dateValObj[key].find(obj => (obj.name == this.selectedIssueMonth || obj.arabicName == this.selectedIssueMonthAr));
                if (obj && Object.keys(obj).length) {
                  this.getDates(key, 'issue');
                  return
                }
                else if (!obj && this.selectedIssueMonth == 'Feb' || this.selectedIssueMonthAr == 'فبراير') {
                  // this.getDates(28, 'issue');
                  this.leapValid('issue', type)
                  return

                }
              }
            }
          }
        }
      }
      else {
        this.issueMonths = Object.assign([], this.months);
        if (this.selectedIssueMonth == undefined || !this.selectedIssueMonth) {
          this.getDates(31, 'issue');
        }
        else if (this.selectedIssueMonth != undefined) {
          for (const key in this.dateValObj) {
            if (this.dateValObj.hasOwnProperty(key)) {
              let obj = this.dateValObj[key].find(obj => (obj.name == this.selectedIssueMonth || obj.arabicName == this.selectedIssueMonthAr));
              if (obj && Object.keys(obj).length) {
                this.getDates(key, 'issue');
                return
              }
              else if (!obj && this.selectedIssueMonth == 'Feb' || this.selectedIssueMonthAr == 'فبراير') {
                this.leapValid('issue', type)
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
        if (index == this.date.getMonth() && this.selectedIssueYear == this.date.getFullYear()) this.getDates(this.date.getDate(), 'issue');
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
      this.glowElement();
      
    }
    console.log(this.serviceIds);

  }

  getTenYears(type, limit) {
    let date = new Date();
    let persianDigits = "۰۱۲۳۴۵۶۷۸۹";
    let persianMap = persianDigits.split("");
    if (type == 'issue') {
      this.pastYears = [];
      for (let i = limit; i < 11; i++) {
        let pastyear = date.getFullYear() - i;
        let convertedPastYear = pastyear.toString().replace(/\d/g, (m: string) => {
          return persianMap[parseInt(m)]
        });
        this.pastYears.push({ yearNormal: pastyear, yearArabic: convertedPastYear });
      };
    }
    else if (type == 'expire') {
      this.futureYears = [];
      for (let i = limit; i < 2; i++) {
        let futureyear = date.getFullYear() + i
        let convertedFutureYear = futureyear.toString().replace(/\d/g, (m: string) => {
          return persianMap[parseInt(m)]
        });
        this.futureYears.push({ yearNormal: futureyear, yearArabic: convertedFutureYear });

      }
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
      // location: this.location,
      logisticsService: this.serviceIds,
      licenseDocx: this.selectedLicense,
      logo: this.selectedLogo,
      license: this.selectedLicense,
      busiType: this.orgType,
      OtherLangPhoneCode: this.transPhoneCode,
      baseLangPhoneCode: this.phoneCode,
      socialSites: this.selectedSocialsite

    }
    this._sharedService.businessDetailObj.next(businessDetail);

  }

  removeSelectedDocx(type, obj) {
    if (type == "license") {
      this.selectedLicense = {};
    }
    else if (type == "logo") {
      this.selectedLogo = {}
    }
    this.removeDoc(obj);


  }

  removeDoc(obj) {
    obj.DocumentFile = obj.DocumentFile.split(baseApi.split("/api").shift()).pop();
    this._userbusinessService.removeDoc(obj).subscribe((res: any) => {
      if (res.returnStatus == 'Success') {
        this._toastr.success('Remove selected document succesfully', "");
      }
      else {
        this._toastr.error('Error Occured', "");
      }
    }, (err: HttpErrorResponse) => {
      console.log(err);
    })
  }
  inputValidate(id) {
    for (var index = id - 1; index > 0; index--) {
      divElement = undefined;
      let elem = document.getElementById(index.toString()) as any;
      if (!elem && !this.showTranslatedLangSide && index % 2 == 0) continue;
      if (index <= 3) {
        var datanumber = index;
      }
      if (index >= 4) {
        this.glowElement();
      }
      if (index == 3 || index == 4 || index == 7 || index == 8 || index == 19 || index == 20) continue;
    
      if (elem.nodeName == 'DIV') {
        var divElement = elem;
        elem = elem.children[1];
      }
      
      let value = elem.value;
      if (!value || value == "undefined") {
        // this.regForm.controls[elem.name].errors=true;
        (divElement && divElement.nodeName == 'DIV')? divElement.classList.add('inputError'):elem.classList.add('inputError');
      }
      else {
        // this.regForm.controls[elem.name].errors=false;
        (divElement && divElement.nodeName == 'DIV') ? divElement.classList.remove('inputError') : elem.classList.remove('inputError');
        
      }
    
    }
    if (index == 0 && datanumber <= 3) {
      this.issueExpirySelectborder();
    }
  }
  

  glowElement(){

  let mainELement = this.serviceMode.nativeElement.parentElement.parentElement.children;
    if(!this.serviceIds.length){
      for (let index = 0; index < mainELement.length; index++) {
        mainELement[index].children[0].classList.add('glowElement');
      }
    }
    else {
      for (let index = 0; index < mainELement.length; index++) {
        if (mainELement[index].children[0].classList.contains('glowElement')){
          mainELement[index].children[0].classList.remove('glowElement');
      }
      }
    }
    (!this.selectedLicense || this.selectedLicense && !this.selectedLicense.DocumentFileName)?
      this.tradeDoc.nativeElement.classList.add('glowElement') : this.tradeDoc.nativeElement.classList.remove('glowElement');

  }

  issueExpirySelectborder(){
    for (var index = 100; index < 112; index++) {

      let elem = document.getElementById(index.toString()) as any;
      if (!elem && !this.showTranslatedLangSide) continue;
      let value = elem.value;
      if (!value || value == "undefined") {
        // this.regForm.controls[elem.name].errors=true;
        elem.classList.add('inputError');
      }
      else {
        // this.regForm.controls[elem.name].errors=false;
        elem.classList.remove('inputError');
      }

    }
  }



  SelectDocx(selectedFiles: NgFilesSelected, type): void {

    if (type == 'license') {
      if (selectedFiles.status !== NgFilesStatus.STATUS_SUCCESS) {
        if (selectedFiles.status == 1) this._toastr.error('Please select only one (1) file to upload.', '')
        else if (selectedFiles.status == 2) this._toastr.error('File size should not exceed 4 MB. Please upload smaller file.', '')
        else if (selectedFiles.status == 4) this._toastr.error('File format is not supported. Please upload supported format file.', '')
        return;
      } else {
        try {
          this.onFileChange(selectedFiles, 'license')
        } catch (error) {
          console.log(error);
        }
      }

    }
    else if (type == 'logo') {

      if (selectedFiles.status !== NgFilesStatus.STATUS_SUCCESS) {
        if (selectedFiles.status == 1) this._toastr.error('Please select only one (1) file to upload.', '')
        else if (selectedFiles.status == 2) this._toastr.error('File size should not exceed 4 MB. Please upload smaller file.', '')
        else if (selectedFiles.status == 4) this._toastr.error('File format is not supported. Please upload supported format file.', '')
        return;
      } else {
        try {
          this.onFileChange(selectedFiles, 'logo')
        } catch (error) {
          console.log(error);
        }
      }
    }
  }

  onFileChange(event, type) {
    let reader = new FileReader();

    if (event) {
      try {
        let file = event.files[0];
        reader.readAsDataURL(file);
        reader.onload = () => {
          let selectedFile: DocumentFile = {
            fileName: file.name,
            fileType: file.type,
            fileUrl: reader.result,
            fileBaseString: reader.result.split(',')[1]
          }
          // console.log('you file content:', selectedFile);
          if (type === 'license') {
            this.uploadDocx(selectedFile, 'TRADE_LICENSE');
          }

          else if (type === 'logo') {
            this.uploadDocx(selectedFile, 'COMPANY_LOGO');
          }
        }

      } catch (err) {
        console.log(err);
      }
    }
  }



  uploadDocx(selectedFile, type){
    let object = this.uploadDocs.find(Obj => Obj.BusinessLogic == type);
    // if (docObj.BusinessLogic === 'COMPANY_LOGO' && selectedFile && selectedFile.fileBaseString) {
      object.UserID = this.userProfile.userID;
      object.ProviderID = this.userProfile.providerID;
      object.DocumentFileContent = null;
      object.DocumentName = null;
      object.DocumentUploadedFileType = null;
      object.FileContent = [
        {
          documentFileName: selectedFile.fileName,
          documentFile: selectedFile.fileBaseString,
          documentUploadedFileType: selectedFile.fileType.split('/').pop()
        }
      ]
    // if (docObj.BusinessLogic === 'TRADE_LICENSE' && selectedFile && selectedFile.fileBaseString) {
    //   docObj.DocumentFileContent = null;
    //   docObj.DocumentName = null;
    //   docObj.DocumentUploadedFileType = null;
    //   docObj.FileContent = [
    //     {
    //       documentFileName: selectedFile.fileName,
    //       documentFile: selectedFile.fileBaseString,
    //       documentUploadedFileType: selectedFile.fileType
    //     }
    //   ]

    this._userbusinessService.docUpload(object).subscribe((res:any)=>{
      if(res.returnStatus='Success'){
        let resObj = JSON.parse(res.returnText);
        
        if (type == 'TRADE_LICENSE'){
          this.selectedLicense = JSON.parse(resObj.DocumentFile)[0];
          this.selectedLicense.DocumentFile = baseApi.split("/api").shift() + this.selectedLicense.DocumentFile;
          this.selectedLicense.DocumentID = resObj.DocumentID;
          this.glowElement();
        }
        else{
          this.selectedLogo = JSON.parse(resObj.DocumentFile)[0];
          this.selectedLogo.DocumentFile = baseApi.split("/api").shift() + this.selectedLogo.DocumentFile;
          this.selectedLogo.DocumentID = resObj.DocumentID;
          
        }
        this._toastr.success("File upload successfully", "");
      }
      else{
        this._toastr.error("Error occured on upload", "");
      }
    },(err:HttpErrorResponse)=>{
      console.log(err);
    })


}








  sanitize(url: string) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  selectedSocialLink(obj) {
    console.log(obj)
    // this.selectedSocialsite = {
    //   mediaId: obj.socialMediaPortalsID,
    //   // mediaUrl: Object.assign('', this.socialSites)
    // }
    // this.socialLinkValidate();
  }

}

export interface DocumentFile {
  fileBaseString: string
  fileName: string
  fileType: string
  fileUrl: string
  docId?: string
}
