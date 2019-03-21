import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { JsonResponse } from '../../../../interfaces/JsonResponse';
import { BasicInfoService } from '../../user-creation/basic-info/basic-info.service';
import { ToastrService } from 'ngx-toastr';
import { DocumentFile } from '../../../../interfaces/document.interface';
import { baseExternalAssets } from '../../../../constants/base.url';
import { HttpErrorResponse } from '@angular/common/http';
import { NgFilesService, NgFilesConfig, NgFilesStatus, NgFilesSelected } from '../../../../directives/ng-files';
import { SettingService } from './setting.service';
import { EMAIL_REGEX, isJSON, loading, GEN_URL, patternValidator, FACEBOOK_REGEX, TWITTER_REGEX, INSTAGRAM_REGEX, LINKEDIN_REGEX, YOUTUBE_REGEX } from '../../../../constants/globalFunctions';
import { FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SharedService } from '../../../../services/shared.service';
import { ConfirmDeleteDialogComponent } from '../../../../shared/dialogues/confirm-delete-dialog/confirm-delete-dialog.component';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  public baseExternalAssets: string = baseExternalAssets;
  public activeAccordions: string[] = ['PersonalInfo', 'BusinessInfo', 'BusinessProfile', 'Gallery', 'AwardsCert', 'ChangePassword'];
  public selectedDocxlogo: any;
  private docTypeIdLogo = null;
  private docTypeIdCert = null;
  private docTypeIdGallery = null;
  private docTypeIdLiscence = null;
  public uploadedlogo: any;
  public companyLogoDocx: any;
  public certficateDocx: any;
  public galleriesDocx: any;
  public liscenceDocx: any;
  public uploadedGalleries: any[] = [];
  public uploadedCertificates: any[] = [];
  public uploadedLiscence: any[] = [];
  private fileStatusLogo = undefined;
  private fileStatusGallery = undefined;
  private fileStatusCert = undefined;
  private fileStatusLiscence = undefined;
  private userProfile: any;

  public config: NgFilesConfig = {
    acceptExtensions: ['jpg', 'png', 'bmp'],
    maxFilesCount: 12,
    maxFileSize: 12 * 1024 * 1000,
    totalFilesSize: 12 * 12 * 1024 * 1000
  };

  // SettingInfo
  private info: any;

  // personalInfo
  public personalInfoForm: any;
  public credentialInfoForm: any;
  public jobTitles: any;
  public cityList: any;
  public regionList: any[] = [];
  public currencyList: any[] = [];
  public countryList: any[] = [];


  public countryFlagImage: string;
  public mobileCountFlagImage: string;
  public phoneCountryId: any;
  public mobileCountryId: any;
  public phoneCode;
  public mobileCode;

  public personalInfoToggler: boolean = false;
  public businessInfoToggler: boolean = false;




  //businessInfo
  public businessInfoForm: any;
  public isPrivateMode: boolean;

  // Association 
  public allAssociations: any[] = [];
  public assocService: any[] = [];
  // Value Added Services
  public valAddedServices: any[] = [];
  public valueService: any[] = [];

  // social
  public socialWebs: any[] = [];
  public selectedSocialsite: any;
  public socialInputValidate: string;
  public socialSites;


  //  freightServices
  public freightServices: any[] = [];
  public frtService: any[] = [];
  public wareHouseTypeToggler: boolean = false;
  public IsRealEstate: boolean = false;

  // about Editor
  public editorContent: any;
  public editable: boolean
  private toolbarOptions = [
    ['bold', 'italic', 'underline'],        // toggled buttons

    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'script': 'sub' }, { 'script': 'super' }],      // superscript/subscript
    [{ 'direction': 'rtl' }],                         // text direction

    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

    [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
    [{ 'align': [] }],

    ['clean']                                         // remove formatting button
  ];
  public editorOptions = {
    placeholder: "insert content...",
    modules: {
      toolbar: this.toolbarOptions
    }
  };


  // show more
  public showTogglerText: string;
  private showMoreTextLength: number = 700;

  constructor(
    private modalService: NgbModal,
    private _basicInfoService: BasicInfoService,
    private _toastr: ToastrService,
    private ngFilesService: NgFilesService,
    private _settingService: SettingService,
    private _sharedService: SharedService,
  ) { }

  ngOnInit() {
    this.ngFilesService.addConfig(this.config, 'config');
    let userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo && userInfo.returnText) {
      this.userProfile = JSON.parse(userInfo.returnText);
    }
    this.credentialInfoForm = new FormGroup({
      currentPassword: new FormControl(null, { validators: [Validators.required, Validators.minLength(6), Validators.maxLength(30)], updateOn: 'blur' }),
      newPassword: new FormControl(null, { validators: [Validators.required, Validators.minLength(6), Validators.maxLength(30)], updateOn: 'blur' }),
      confirmPassword: new FormControl('', { validators: [Validators.required, Validators.minLength(6), Validators.maxLength(30)], updateOn: 'blur' }),
    });
    this.personalInfoForm = new FormGroup({
      firstName: new FormControl(null, [Validators.required, Validators.pattern(/[a-zA-Z-][a-zA-Z -]*$/), Validators.minLength(2), Validators.maxLength(100)]),
      lastName: new FormControl(null, [Validators.required, Validators.pattern(/[a-zA-Z-][a-zA-Z -]*$/), Validators.minLength(2), Validators.maxLength(100)]),
      jobTitle: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]),
      city: new FormControl(null, [Validators.required, Validators.maxLength(100), Validators.minLength(3)]),
      currency: new FormControl(null, [Validators.required, Validators.maxLength(5), Validators.minLength(2)]),
      region: new FormControl(null, [Validators.required, Validators.maxLength(50), Validators.minLength(3)]),
      email: new FormControl(null, [
        Validators.required,
        Validators.pattern(EMAIL_REGEX),
        Validators.maxLength(320)
      ]),
      mobile: new FormControl(null, [Validators.required, Validators.pattern(/^(?!(\d)\1+(?:\1+){0}$)\d+(\d+){0}$/), Validators.minLength(7), Validators.maxLength(13)]),
    });

    this.businessInfoForm = new FormGroup({
      orgName: new FormControl(null, [Validators.required, Validators.maxLength(100), Validators.minLength(4)]),
      phone: new FormControl(null, [Validators.required, Validators.pattern(/^(?!(\d)\1+(?:\1+){0}$)\d+(\d+){0}$/), Validators.minLength(7), Validators.maxLength(13)]),
      address: new FormControl(null, [Validators.required, Validators.maxLength(200), Validators.minLength(10)]),
      city: new FormControl(null, [Validators.required, Validators.maxLength(100), Validators.minLength(3)]),
      poBoxNo: new FormControl(null, [Validators.maxLength(16), Validators.minLength(4)]),
      socialUrl: new FormControl(null),
      profileUrl: new FormControl(null, [Validators.required]),
    });


    this._sharedService.regionList.subscribe((state: any) => {
      if (state) {
        this.regionList = state;
      }
    });
    this._sharedService.currencyList.subscribe((state: any) => {
      if (state) {
        this.currencyList = state;
      }
    });
    this._sharedService.countryList.subscribe((state: any) => {
      if (state) {
        this.countryList = state;
      }

    });
    this.getUserDetail(this.userProfile.UserID);
    this.onChanges();
  }

  onChanges(): void {
    this.personalInfoForm.valueChanges.subscribe(val => {
      for (const key in this.personalInfoForm.controls) {
        if (this.personalInfoForm.controls.hasOwnProperty(key)) {
          if (this.personalInfoForm.controls[key].dirty) {
            this.personalInfoToggler = true;
          }

        }
      }
    });
    this.businessInfoForm.valueChanges.subscribe(val => {
      for (const key in this.businessInfoForm.controls) {
        if (this.businessInfoForm.controls.hasOwnProperty(key)) {
          if (this.businessInfoForm.controls[key].dirty) {
            this.businessInfoToggler = true;
          }

        }
      }
    });
  }
  onContentChanged({ quill, html, text }) {
    this.editorContent = html
  }

  selectedSocialLink(obj) {
    this.selectedSocialsite = obj;
    this.businessInfoForm.controls['socialUrl'].reset();
    if (obj.socialMediaPortalsID === 100) {
      this.businessInfoForm.controls['socialUrl'].setValidators([patternValidator(FACEBOOK_REGEX)]);
      this.socialLinkValidate()
    }
    else if (obj.socialMediaPortalsID === 101) {
      this.businessInfoForm.controls['socialUrl'].setValidators([patternValidator(TWITTER_REGEX)]);
      this.socialLinkValidate()
    } else if (obj.socialMediaPortalsID === 102) {
      this.businessInfoForm.controls['socialUrl'].setValidators([patternValidator(INSTAGRAM_REGEX)]);
      this.socialLinkValidate()
    } else if (obj.socialMediaPortalsID === 103) {
      this.businessInfoForm.controls['socialUrl'].setValidators([patternValidator(LINKEDIN_REGEX)]);
      this.socialLinkValidate()
    } else if (obj.socialMediaPortalsID === 104) {
      this.businessInfoForm.controls['socialUrl'].setValidators([patternValidator(YOUTUBE_REGEX)]);
      this.socialLinkValidate()
    }
    else {
      this.businessInfoForm.controls['socialUrl'].setValidators([patternValidator(GEN_URL)]);
      this.socialLinkValidate()
    }
  }
  socialLinkValidate() {

    if (this.selectedSocialsite && this.businessInfoForm.controls['socialUrl'].value && this.businessInfoForm.controls['socialUrl'].status === 'INVALID') {
      // let index = this.selectedSocialsite.title.toLowerCase().indexOf(this.socialSites.toLowerCase());
      this.socialInputValidate = 'Your social url is not valid';
    }
    else if (!this.businessInfoForm.controls['socialUrl'].value) {
      this.socialInputValidate = '';
    }
    else {
      this.socialInputValidate = '';
    }

  }
  getCities(info) {
    this._sharedService.cityList.subscribe((state: any) => {
      if (state) {
        this.cityList = state;
        this.setPersonalInfo(info);
        this.setBusinessInfo(info);
        loading(false);
      }
    });
  }

  getListJobTitle(info) {
    this._basicInfoService.getjobTitles(info.CountryID).subscribe((res: any) => {
      if (res.returnStatus == 'Success') {
        this.jobTitles = res.returnObject;
        this.getCities(info);
      }
    }, (err: HttpErrorResponse) => {
      console.log(err);
    })
  }
  showToggler(type) {
    let elem = document.getElementsByClassName('editor')[0];
    if (elem.classList.contains('showMore')) {
      elem.classList.remove('showMore');
      this.showTogglerText = "Show Less"
    }
    else {
      elem.classList.add('showMore');
      this.showTogglerText = "Show More"
    }
  }
  getUserDetail(UserID) {
    loading(true);
    this._settingService.getSettingInfo(UserID).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        this.info = res.returnObject;
        this.isPrivateMode = this.info.IsPrivateMode;
        this.socialWebs = this.info.SocialMedia;
        this.allAssociations = this.info.Association;
        this.galleriesDocx = this.info.Gallery;
        this.certficateDocx = this.info.AwardCertificate;
        this.companyLogoDocx = this.info.CompanyLogo;
        this.liscenceDocx = this.info.TradeLicense;
        this.assocService = this.allAssociations.filter(obj => obj.IsSelected && obj.ProviderAssnID);
        this.valAddedServices = this.info.ValueAddedServices;
        this.valueService = this.valAddedServices.filter(obj => obj.IsSelected && obj.ProvLogServID);
        this.freightServices = this.info.LogisticService;
        this.frtService = this.freightServices.filter(obj => obj.IsSelected && obj.ProvLogServID);
        if (this.frtService && this.frtService.length) {
          let data = this.frtService.find(obj => obj.LogServCode == 'WRHS');
          if (data && Object.keys(data).length) {
            this.wareHouseTypeToggler = true;
            this.IsRealEstate = data.IsRealEstate
          }
        }
        if (this.info.About) {
          this.editorContent = this.info.About;
          this.editable = false;
          if (this.editorContent.length > this.showMoreTextLength) {
            let elem = document.getElementsByClassName('editor')[0];
            if (elem.classList.contains('showMore')) {
              elem.classList.remove('showMore');
              this.showTogglerText = "Show Less"
            }
            else {
              elem.classList.add('showMore');
              this.showTogglerText = "Show More"
            }
          }
        }
        if (this.info.UploadedCompanyLogo && this.info.UploadedCompanyLogo[0].DocumentFileName &&
          this.info.UploadedCompanyLogo[0].DocumentFileName != "[]" &&
          isJSON(this.info.UploadedCompanyLogo[0].DocumentFileName)) {
          let logo = this.info.UploadedCompanyLogo[0];
          this.uploadedlogo = JSON.parse(logo.DocumentFileName)[0];
          this.docTypeIdLogo = this.uploadedlogo.DocumentID;
          this.uploadedlogo.DocumentFile = this.baseExternalAssets + this.uploadedlogo.DocumentFile
        }
        if (this.info.UploadedGallery && this.info.UploadedGallery[0].DocumentFileName &&
          this.info.UploadedGallery[0].DocumentFileName != "[]" &&
          isJSON(this.info.UploadedGallery[0].DocumentFileName)) {
          let gallery = this.info.UploadedGallery[0];
          this.uploadedGalleries = JSON.parse(gallery.DocumentFileName);
          this.docTypeIdGallery = this.uploadedGalleries[0].DocumentID;
          this.uploadedGalleries.map(obj => {
            obj.DocumentFile = this.baseExternalAssets + obj.DocumentFile;
          })
        }
        if (this.info.UploadedAwardCertificate && this.info.UploadedAwardCertificate[0].DocumentFileName &&
          this.info.UploadedAwardCertificate[0].DocumentFileName != "[]" &&
          isJSON(this.info.UploadedAwardCertificate[0].DocumentFileName)) {
          let certificate = this.info.UploadedAwardCertificate[0];
          this.uploadedCertificates = JSON.parse(certificate.DocumentFileName);
          this.docTypeIdCert = this.uploadedCertificates[0].DocumentID;
          this.uploadedCertificates.map(obj => {
            obj.DocumentFile = this.baseExternalAssets + obj.DocumentFile;
          })
        }
        if (this.info.UploadedTradeLicense && this.info.UploadedTradeLicense[0].DocumentFileName &&
          this.info.UploadedTradeLicense[0].DocumentFileName != "[]" &&
          isJSON(this.info.UploadedTradeLicense[0].DocumentFileName)) {
          let tradeLiscence = this.info.UploadedTradeLicense[0];
          this.uploadedLiscence = JSON.parse(tradeLiscence.DocumentFileName);
          this.docTypeIdLiscence = this.uploadedLiscence[0].DocumentID;
          this.uploadedLiscence.map(obj => {
            obj.DocumentFile = this.baseExternalAssets + obj.DocumentFile;
          })
        }
        this.getListJobTitle(this.info);
      }
    })
  }

  updatePassword() {
    if (this.credentialInfoForm.value.currentPassword === this.credentialInfoForm.value.newPassword) {
      this._toastr.error('New password must be different from current password', '');
      return;
    }
    let obj = {
      email: this.userProfile.LoginID,
      password: this.credentialInfoForm.value.newPassword,
      confirmPassword: this.credentialInfoForm.value.confirmPassword,
      currentPassword: this.credentialInfoForm.value.currentPassword
    }
    this._settingService.changePassword(obj).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        this.credentialInfoForm.reset();
        this._toastr.success(res.returnText, '');
      } else {
        this._toastr.error(res.returnText, '');
      }
    })
  }
  setPersonalInfo(info) {
    this.personalInfoForm.controls['email'].setValue(info.LoginID);
    this.personalInfoForm.controls['firstName'].setValue(info.FirstName);
    this.personalInfoForm.controls['lastName'].setValue(info.LastName);
    if (info.JobTitle) {
      let obj = this.jobTitles.find(elem => elem.baseLanguage == info.JobTitle);
      if (obj && Object.keys(obj).length) {
        this.personalInfoForm.controls['jobTitle'].setValue(obj);
      }
      else {
        let obj = {
          baseLanguage: info.JobTitle
        }
        this.personalInfoForm.controls['jobTitle'].setValue(obj);
      }
    }
    if (info.CityID) {
      let obj = this.cityList.find(elem => elem.id == info.CityID);
      this.personalInfoForm.controls['city'].setValue(obj);
    }
    if (info.CurrencyID) {
      let obj = this.currencyList.find(elem => elem.id == info.CurrencyID);
      this.personalInfoForm.controls['currency'].setValue(obj);
    }
    if (info.RegionID) {
      let obj = this.regionList.find(elem => elem.regionID == info.RegionID);
      this.personalInfoForm.controls['region'].setValue(obj.regionID);
    }
    let selectedCountry = this.countryList.find(obj => obj.id == info.PhoneCodeCountryID);
    if (selectedCountry && Object.keys(selectedCountry).length) {
      this.selectPhoneCode(selectedCountry);
    }
    else {
      selectedCountry = this.countryList.find(obj => obj.id == info.CountryID);
      if (selectedCountry && Object.keys(selectedCountry).length) {
        this.selectPhoneCode(selectedCountry);
      }
    }
    if (selectedCountry && typeof selectedCountry == 'object' && Object.keys(selectedCountry).length) {
      let description = selectedCountry.desc;
      info.PrimaryPhone = info.PrimaryPhone.replace(description[0].CountryPhoneCode, "");
    }
    this.personalInfoForm.controls['mobile'].setValue(info.PrimaryPhone);
    this.personalInfoToggler = false;
  }
  resetPersonalInfo() {
    this.personalInfoForm.reset();
    this.setPersonalInfo(this.info);
  }
  resetbusinessInfo() {
    this.businessInfoForm.reset();
    this.setBusinessInfo(this.info);
  }



  setBusinessInfo(info) {
    this.businessInfoForm.controls['orgName'].setValue(info.ProviderName);
    this.businessInfoForm.controls['address'].setValue(info.ProviderAddress);
    this.businessInfoForm.controls['poBoxNo'].setValue(info.POBox);
    this.businessInfoForm.controls['profileUrl'].setValue(info.ProfileID);
    if (info.ProviderCityID) {
      let obj = this.cityList.find(elem => elem.id == info.ProviderCityID);
      this.businessInfoForm.controls['city'].setValue(obj);
    }
    let selectedCountry = this.countryList.find(obj => obj.id == info.ProviderPhoneCodeCountryID);
    if (selectedCountry && Object.keys(selectedCountry).length) {
      this.selectTelCode(selectedCountry);
    }
    else {
      selectedCountry = this.countryList.find(obj => obj.id == info.CountryID);
      if (selectedCountry && Object.keys(selectedCountry).length) {
        this.selectTelCode(selectedCountry);
      }
    }
    if (selectedCountry && typeof selectedCountry == 'object' && Object.keys(selectedCountry).length) {
      let description = selectedCountry.desc;
      info.ProviderPhone = info.ProviderPhone.replace(description[0].CountryPhoneCode, "");
    }
    this.businessInfoForm.controls['phone'].setValue(info.ProviderPhone);
    if (info.SocialMediaAccountID && info.ProviderWebAdd) {
      let obj = this.socialWebs.find(elem => elem.SocialMediaPortalsID == info.SocialMediaAccountID);
      this.selectedSocialLink(obj);
      this.businessInfoForm.controls['socialUrl'].setValue(info.ProviderWebAdd);
    }
    else {
      this.selectedSocialsite = this.socialWebs[this.socialWebs.length - 1];
      if (this.selectedSocialsite.socialMediaPortalsID === 105) {
        this.businessInfoForm.controls['socialUrl'].setValidators([patternValidator(GEN_URL)]);
      }
    }
    this.businessInfoToggler = false
  }


  freightService(obj, selectedService) {
    let selectedItem = selectedService.classList;
    if (this.frtService && this.frtService.length) {
      for (var i = 0; i < this.frtService.length; i++) {
        if (this.frtService[i].LogServID == obj.LogServID) {
          if (this.frtService.length > 1 && obj.IsRemovable) {
            this.frtService.splice(i, 1);
            selectedItem.remove('active');
            if (obj.LogServCode == "WRHS") {
              this.wareHouseTypeToggler = false;
              this.IsRealEstate = false;
            }
            this.removeServices(obj);
          }
          else {
            if (!obj.IsRemovable) {
              if (obj.LogServCode == "WRHS"){
                this._toastr.info("Service can not be removed. Please first removed the warehouse", '')
              }else{
                this._toastr.info("Service can not be removed. Please first removed the rates", '')
              }
            }
            else {
              this._toastr.info("At least one service is mandatory.", '')
            }
          }
          return;
        }
      }
    }
    if ((this.frtService && !this.frtService.length) || (i == this.frtService.length)) {
      selectedItem.add('active');
      this.frtService.push(obj);
      this.selectServices(obj);
      if (obj.LogServCode == "WRHS") {
        this.wareHouseTypeToggler = true;
      }
    }
  }
  selectAssociation(obj, selectedService) {
    let selectedItem = selectedService.classList;
    if (this.assocService && this.assocService.length) {
      for (var i = 0; i < this.assocService.length; i++) {
        if (this.assocService[i].AssnWithID == obj.AssnWithID) {
          this.assocService.splice(i, 1);
          selectedItem.remove('active');
          this.removeAssocServices(obj);
          return;
        }
      }
    }
    if ((this.assocService && !this.assocService.length) || (i == this.assocService.length)) {
      selectedItem.add('active');
      this.assocService.push(obj);
      this.selectAssocServices(obj);
    }
  }
  valAdded(obj, selectedService) {
    let selectedItem = selectedService.classList;
    if (this.valueService && this.valueService.length) {
      for (var i = 0; i < this.valueService.length; i++) {
        if (this.valueService[i].LogServID == obj.LogServID) {
          this.valueService.splice(i, 1);
          selectedItem.remove('active');
          this.removeServices(obj);
          return;
        }
      }
    }
    if ((this.valueService && !this.valueService.length) || (i == this.valueService.length)) {
      selectedItem.add('active');
      this.valueService.push(obj);
      this.selectServices(obj);

    }
  }

  selectAssocServices(obj) {
    let object = {
      providerID: this.userProfile.ProviderID,
      createdBy: this.userProfile.LoginID,
      serviceID: obj.AssnWithID
    }
    this._settingService.selectAssociationService(object).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        obj.ProviderAssnID = res.returnObject;
      }
    })
  }
  removeAssocServices(obj) {
    let object = {
      providerID: this.userProfile.ProviderID,
      createdBy: this.userProfile.LoginID,
      serviceID: obj.ProviderAssnID
    }
    this._settingService.deSelectAssociationService(object).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        obj.ProviderAssnID = null;
      }
    })
  }

  selectPhoneCode(list) {
    this.mobileCountFlagImage = list.code;
    let description = list.desc;
    this.mobileCode = description[0].CountryPhoneCode;
    this.mobileCountryId = list.id
  }
  selectTelCode(list) {
    this.countryFlagImage = list.code;
    let description = list.desc;
    this.phoneCode = description[0].CountryPhoneCode;
    this.phoneCountryId = list.id
  }
  selectServices(obj) {
    let object = {
      providerID: this.userProfile.ProviderID,
      createdBy: this.userProfile.LoginID,
      serviceID: obj.LogServID,
      logServCode: obj.LogServCode,
    }
    this._settingService.selectProviderService(object).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        obj.ProvLogServID = res.returnObject;
      }
    })
  }
  removeServices(obj) {
    let object = {
      providerID: this.userProfile.ProviderID,
      createdBy: this.userProfile.LoginID,
      serviceID: obj.ProvLogServID,
      serviceType: obj.ServiceType,
      logServCode: obj.LogServCode,
      logServID: obj.LogServID
    }
    this._settingService.deSelectService(object).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        obj.ProvLogServID = null;
      }
      else {
        this._toastr.error(res.returnText, '');
      }
    })
  }

  realEstateSel(type, event) {
    let wareHouseTypeSel = this.frtService.some(obj => obj.LogServCode == "WRHS" && obj.IsRemovable);
    if (!wareHouseTypeSel){
        event.preventDefault();
        if (this.IsRealEstate && type != 'realEstate'){
          this._toastr.info("Service can not be update. Please first removed the warehouse", '')
        }
        else if (!this.IsRealEstate && type != 'owner'){
          this._toastr.info("Service can not be update. Please first removed the warehouse", '')
        }
      return;
    } 
    this.IsRealEstate = (type == 'owner') ? false : true;
    let object = {
      providerID: this.userProfile.ProviderID,
      modifiedBy: this.userProfile.LoginID,
      isRealEstate: this.IsRealEstate,
    }
    this._settingService.updateRealRstate(object).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        this._toastr.success('Updated successfully', '');
      }
      else {
        this._toastr.error('Error Occured', '');
      }
    })
  }


  companyAboutUs() {
    let object = {
      providerID: this.userProfile.ProviderID,
      about: this.editorContent,
      ModifiedBy: this.userProfile.LoginID
    }
    this._settingService.companyAbout(object).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        this.editable = false;
        this._toastr.success('Updated Successfully.', '');
        if (this.editorContent.length > this.showMoreTextLength) {
          let elem = document.getElementsByClassName('editor')[0];
          if (elem.classList.contains('showMore')) {
            elem.classList.remove('showMore');
            this.showTogglerText = "Show Less"
          }
          else {
            elem.classList.add('showMore');
            this.showTogglerText = "Show More"
          }
        }
      }
      else {
        this._toastr.error(res.returnText, '');
      }
    })
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
  spaceHandler(event) {
    if (event.charCode == 32) {
      event.preventDefault();
      return false;
    }
  }
  numberValid(evt) {
    let charCode = (evt.which) ? evt.which : evt.keyCode
    if (charCode > 31 && (charCode < 48 || charCode > 57))
      return false;
    return true;
  }
  removeSelectedDocx(index, obj, type) {
    obj.DocumentFile = obj.DocumentFile.split(baseExternalAssets).pop();
    if (type == 'logo') {
      obj.DocumentID = this.docTypeIdLogo;
    }
    else if (type == 'gallery') {
      obj.DocumentID = this.docTypeIdGallery;
    }
    else if (type == 'certificate') {
      obj.DocumentID = this.docTypeIdCert;
    }
    else if (type == 'liscence') {
      obj.DocumentID = this.docTypeIdLiscence;
    }

    this._basicInfoService.removeDoc(obj).subscribe((res: any) => {
      if (res.returnStatus == 'Success') {
        this._toastr.success('Remove selected document succesfully', "");
        if (type == 'logo') {
          this.uploadedlogo = {};
        }
        else if (type == 'gallery') {
          this.uploadedGalleries.splice(index, 1);
          if (!this.uploadedGalleries || (this.uploadedGalleries && !this.uploadedGalleries.length)) {
            this.docTypeIdGallery = null;
          }
        }
        else if (type == 'certificate') {
          this.uploadedCertificates.splice(index, 1);
          if (!this.uploadedCertificates || (this.uploadedCertificates && !this.uploadedCertificates.length)) {
            this.docTypeIdCert = null;
          }
        }

        else if (type == 'liscence') {
          this.uploadedLiscence.splice(index, 1);
          if (!this.uploadedLiscence || (this.uploadedLiscence && !this.uploadedLiscence.length)) {
            this.docTypeIdLiscence = null;
          }
        }
      }
      else {
        this._toastr.error('Error Occured', "");
      }
    }, (err: HttpErrorResponse) => {
      console.log(err);
    })
  }



  selectDocx(selectedFiles: NgFilesSelected, type): void {
    if (selectedFiles.status !== NgFilesStatus.STATUS_SUCCESS) {
      if (selectedFiles.status == 1) this._toastr.error('Please select 12 or less file(s) to upload.', '')
      else if (selectedFiles.status == 2) this._toastr.error('File size should not exceed 5 MB. Please upload smaller file.', '')
      else if (selectedFiles.status == 4) this._toastr.error('File format is not supported. Please upload supported format file.', '')
      return;
    }
    else {
      try {
        if (type == 'certificate') {
          if (this.uploadedCertificates.length + selectedFiles.files.length > this.config.maxFilesCount) {
            this._toastr.error('Please select 12 or less file(s) to upload.', '');
            return;
          }
        }
        else if (type == 'logo') {
          if (selectedFiles.files.length > 1) {
            this._toastr.error('Please select only 1 file to upload.', '')
            return;
          }
        }
        else if (type == 'liscence') {
          if (this.uploadedLiscence.length + selectedFiles.files.length > this.config.maxFilesCount) {
            this._toastr.error('Please select 12 or less file(s) to upload.', '')
            return;
          }
        }
        else if (type == 'gallery') {
          if (this.uploadedGalleries.length + selectedFiles.files.length > this.config.maxFilesCount) {
            this._toastr.error('Please select 12 or less file(s) to upload.', '')
            return;
          }
        }
        this.onFileChange(selectedFiles, type)
      } catch (error) {
        console.log(error);
      }

    }
  }

  onFileChange(event, type) {
    let flag = 0;
    if (event) {
      try {
        const allDocsArr = []
        const fileLenght: number = event.files.length
        for (let index = 0; index < fileLenght; index++) {
          let reader = new FileReader();
          const element = event.files[index];
          let file = element
          reader.readAsDataURL(file);
          reader.onload = () => {
            const selectedFile: DocumentFile = {
              fileName: file.name,
              fileType: file.type,
              fileUrl: reader.result,
              fileBaseString: (reader as any).result.split(',').pop()
            }
            if (event.files.length <= this.config.maxFilesCount) {
              const docFile = JSON.parse(this.generateDocObject(selectedFile, type));
              allDocsArr.push(docFile);
              flag++
              if (flag === fileLenght) {
                this.uploadDocuments(allDocsArr, type)
              }
            }
            else {
              this._toastr.error('Please select only ' + this.config.maxFilesCount + 'file to upload', '');
            }
          }
        }
      }
      catch (err) {
        console.log(err);
      }
    }

  }

  generateDocObject(selectedFile, type): any {
    let object
    if (type == 'logo') {
      object = this.companyLogoDocx;
      object.DocumentID = this.docTypeIdLogo;
      object.DocumentLastStatus = this.fileStatusLogo;

    }
    else if (type == 'gallery') {
      object = this.galleriesDocx;
      object.DocumentID = this.docTypeIdGallery;
      object.DocumentLastStatus = this.fileStatusGallery;

    }
    else if (type == 'certificate') {
      object = this.certficateDocx;
      object.DocumentID = this.docTypeIdCert;
      object.DocumentLastStatus = this.fileStatusCert;
    }
    else if (type == 'liscence') {
      object = this.liscenceDocx;
      object.DocumentID = this.docTypeIdLiscence;
      object.DocumentLastStatus = this.fileStatusLiscence;
    }
    object.UserID = this.userProfile.UserID;
    object.ProviderID = this.userProfile.ProviderID;
    object.DocumentFileContent = null;
    object.DocumentName = null;
    object.DocumentUploadedFileType = null;
    object.FileContent = [{
      documentFileName: selectedFile.fileName,
      documentFile: selectedFile.fileBaseString,
      documentUploadedFileType: selectedFile.fileType.split('/').pop()
    }]
    return JSON.stringify(object);
  }

  async uploadDocuments(docFiles: Array<any>, type) {
    const totalDocLenght: number = docFiles.length
    for (let index = 0; index < totalDocLenght; index++) {
      try {
        const resp: JsonResponse = await this.docSendService(docFiles[index])
        if (resp.returnStatus = 'Success') {
          let resObj = JSON.parse(resp.returnText);
          if (type == 'logo') {
            this.docTypeIdLogo = resObj.DocumentID;
            this.fileStatusLogo = resObj.DocumentLastStaus;
          }
          else if (type == 'gallery') {
            this.docTypeIdGallery = resObj.DocumentID;
            this.fileStatusGallery = resObj.DocumentLastStaus;
          }
          else if (type == 'certificate') {
            this.docTypeIdCert = resObj.DocumentID;
            this.fileStatusCert = resObj.DocumentLastStaus;
          }
          else if (type == 'liscence') {
            this.docTypeIdLiscence = resObj.DocumentID;
            this.fileStatusLiscence = resObj.DocumentLastStaus;
          }
          let fileObj = JSON.parse(resObj.DocumentFile);
          if (type == 'logo') {
            // without baseExternalAssets
            let avatar = Object.assign([], fileObj)
            this._sharedService.updateAvatar.next(avatar);
          }
          fileObj.forEach(element => {
            element.DocumentFile = baseExternalAssets + element.DocumentFile;
          });
          if (index !== (totalDocLenght - 1)) {
            docFiles[index + 1].DocumentID = resObj.DocumentID;
            docFiles[index + 1].DocumentLastStatus = resObj.DocumentLastStaus;
          }

          if (type == 'logo') {
            this.uploadedlogo = fileObj[0];
          }
          else if (type == 'gallery') {
            this.uploadedGalleries = fileObj;
          }
          else if (type == 'certificate') {
            this.uploadedCertificates = fileObj;
          }
          else if (type == 'liscence') {
            this.uploadedLiscence = fileObj;
          }
          this._toastr.success("File upload successfully", "");
        }
        else {
          this._toastr.error("Error occured on upload", "");
        }
      } catch (error) {
        this._toastr.error("Error occured on upload", "");
      }
    }
  }

  async docSendService(doc: any) {
    const resp: JsonResponse = await this._basicInfoService.docUpload(doc).toPromise()
    return resp
  }


  deactivate() {
    const modalRef = this.modalService.open(ConfirmDeleteDialogComponent, {
      size: 'lg',
      centered: true,
      windowClass: 'small-modal',
      backdrop: 'static',
      keyboard: false
    });
    let obj = {
      data: this.userProfile.UserID,
      type: "DelAccount"
    }
    modalRef.componentInstance.deleteIds = obj;
    setTimeout(() => {
      if (document.getElementsByTagName('body')[0].classList.contains('modal-open')) {
        document.getElementsByTagName('html')[0].style.overflowY = 'hidden';
      }
    }, 0);
  }
  updatePersonalInfo() {
    let obj = {
      userID: this.userProfile.UserID,
      firstName: this.personalInfoForm.value.firstName,
      lastName: this.personalInfoForm.value.lastName,
      jobTitle: this.personalInfoForm.value.jobTitle.baseLanguage,
      cityID: this.personalInfoForm.value.city.id,
      mobileNumber: this.personalInfoForm.value.mobile,
      countryPhoneCode: this.mobileCode,
      phoneCodeCountryID: this.mobileCountryId,
      regionID: this.personalInfoForm.value.region,
      currencyID: this.personalInfoForm.value.currency.id
    }
    this._settingService.personalSetting(obj).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        this._toastr.success('Personal Information Updated', '')
        this.personalInfoToggler = false;
        let userObj = JSON.parse(localStorage.getItem('userInfo'));
        let userData = JSON.parse(userObj.returnText);
        userData.CurrencyID = this.personalInfoForm.value.currency.id;
        userObj.returnText = JSON.stringify(userData);
        localStorage.setItem('userInfo', JSON.stringify(userObj));
      }
    })
  }
  updatebussinesInfo() {
    let obj = {
      userID: this.userProfile.UserID,
      providerID: this.userProfile.ProviderID,
      address: this.businessInfoForm.value.address,
      poBox: this.businessInfoForm.value.poBoxNo,
      cityID: this.businessInfoForm.value.city.id,
      telephone: this.businessInfoForm.value.phone,
      isPrivateMode: this.isPrivateMode,
      countryPhoneCode: this.phoneCode,
      phoneCodeCountryID: this.phoneCountryId,
      socialMediaAccountID: (this.selectedSocialsite && Object.keys(this.selectedSocialsite).length && this.socialSites) ? this.selectedSocialsite.SocialMediaPortalsID : null,
      website: (this.selectedSocialsite && Object.keys(this.selectedSocialsite).length && this.socialSites) ? this.socialSites : null,
      ModifiedBy: this.userProfile.LoginID
    }
    this._settingService.businessSetting(obj).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        this._toastr.success('Business Information Updated', '');
        this.businessInfoToggler = false;
      }
    })
  }

  jobSearch = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      map(term => (!term || term.length < 2) ? []
        : this.jobTitles.filter(v => v.baseLanguage.toLowerCase().indexOf(term.toLowerCase()) > -1))
    )
  formatterjob = (x: { baseLanguage: string }) => x.baseLanguage;

  searchCity = (text$: Observable<string>) =>
    text$
      .debounceTime(200)
      .map(term => (!term || term.length < 3) ? []
        : this.cityList.filter(v => v.title.toLowerCase().indexOf(term.toLowerCase()) > -1));
  formatterCity = (x: { title: string }) => x.title;

  currency = (text$: Observable<string>) =>
    text$
      .debounceTime(200)
      .map(term => (!term || term.length < 3) ? []
        : this.currencyList.filter(v => v.shortName.toLowerCase().indexOf(term.toLowerCase()) > -1));
  formatterCurrency = (x: { shortName: string }) => x.shortName;
}
