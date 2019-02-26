import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { JsonResponse } from '../../../../interfaces/JsonResponse';
import { BasicInfoService } from '../../user-creation/basic-info/basic-info.service';
import { ToastrService } from 'ngx-toastr';
import { DocumentFile } from '../../../../interfaces/document.interface';
import { baseExternalAssets } from '../../../../constants/base.url';
import { HttpErrorResponse } from '@angular/common/http';
import { NgFilesService, NgFilesConfig, NgFilesStatus, NgFilesSelected } from '../../../../directives/ng-files';
import { SettingService } from './setting.service';
import { EMAIL_REGEX, isJSON, loading } from '../../../../constants/globalFunctions';
import { FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { SharedService } from '../../../../services/shared.service';

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


  // personalInfo
  public personalInfoForm: any;
  public credentialInfoForm: any;
  public jobTitles: any;
  public cityList: any;
  public regionList: any[] = [];
  public currencyList: any[] = [];

  //businessInfo
  public businessInfoForm: any;

  // Association 
  public allAssociations: any[] = [];
  public assocService: any[] = [];
  // Value Added Services
  public valAddedServices: any[] = [];
  public valueService: any[] = [];

  //  freightServices
  public freightServices: any[] = [];
  public frtService: any[] = [];

  // about Editor
  public editorContent:any;
  public editable:boolean
  public editorOptions= {
    placeholder: "insert content..."
  };

  constructor(
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
      mobile: new FormControl(null, [Validators.required, Validators.minLength(7), Validators.maxLength(13)]),
    });

    this.businessInfoForm = new FormGroup({
      orgName: new FormControl(null, [Validators.required, Validators.maxLength(100), Validators.minLength(4), Validators.pattern(/^(?=.*?[a-zA-Z])[^.]+$/)]),
      phone: new FormControl(null, [Validators.required, Validators.minLength(7), Validators.maxLength(13)]),
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
    this.getUserDetail(this.userProfile.UserID);
  }

  onContentChanged({ quill, html, text }) {
      this.editorContent = html
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

  getListJobTitle(id, info) {
    this._basicInfoService.getjobTitles(id).subscribe((res: any) => {
      if (res.returnStatus == 'Success') {
        this.jobTitles = res.returnObject;
        this.getCities(info);
      }
    }, (err: HttpErrorResponse) => {
      console.log(err);
    })
  }

  getUserDetail(UserID) {
    loading(true);
    this._settingService.getSettingInfo(UserID).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        let info = res.returnObject
        let countryId = res.returnObject.CountryID;
        this.allAssociations = res.returnObject.Association;
        this.galleriesDocx = res.returnObject.Gallery;
        this.certficateDocx = res.returnObject.AwardCertificate;
        this.companyLogoDocx = res.returnObject.CompanyLogo;
        this.liscenceDocx = res.returnObject.TradeLicense;
        this.assocService = this.allAssociations.filter(obj => obj.IsSelected && obj.ProviderAssnID);
        this.valAddedServices = res.returnObject.ValueAddedServices;
        this.valueService = this.valAddedServices.filter(obj => obj.IsSelected && obj.ProvLogServID);
        this.freightServices = res.returnObject.LogisticService;
        this.frtService = this.freightServices.filter(obj => obj.IsSelected && obj.ProvLogServID);
        if (res.returnObject.About) {
          this.editorContent = res.returnObject.About;
          this.editable = false;
        }
        if (res.returnObject.UploadedCompanyLogo && res.returnObject.UploadedCompanyLogo[0].DocumentFileName &&
          res.returnObject.UploadedCompanyLogo[0].DocumentFileName != "[]" &&
          isJSON(res.returnObject.UploadedCompanyLogo[0].DocumentFileName)) {
          let logo = res.returnObject.UploadedCompanyLogo[0];
          this.uploadedlogo = JSON.parse(logo.DocumentFileName)[0];
          this.docTypeIdLogo = this.uploadedlogo.DocumentID;
          this.uploadedlogo.DocumentFile = this.baseExternalAssets + this.uploadedlogo.DocumentFile
        }
        if (res.returnObject.UploadedGallery && res.returnObject.UploadedGallery[0].DocumentFileName &&
          res.returnObject.UploadedGallery[0].DocumentFileName != "[]" &&
          isJSON(res.returnObject.UploadedGallery[0].DocumentFileName)) {
          let gallery = res.returnObject.UploadedGallery[0];
          this.uploadedGalleries = JSON.parse(gallery.DocumentFileName);
          this.docTypeIdGallery = this.uploadedGalleries[0].DocumentID;
          this.uploadedGalleries.map(obj => {
            obj.DocumentFile = this.baseExternalAssets + obj.DocumentFile;
          })
        }
        if (res.returnObject.UploadedAwardCertificate && res.returnObject.UploadedAwardCertificate[0].DocumentFileName &&
          res.returnObject.UploadedAwardCertificate[0].DocumentFileName != "[]" &&
          isJSON(res.returnObject.UploadedAwardCertificate[0].DocumentFileName)) {
          let certificate = res.returnObject.UploadedAwardCertificate[0];
          this.uploadedCertificates = JSON.parse(certificate.DocumentFileName);
          this.docTypeIdCert = this.uploadedCertificates[0].DocumentID;
          this.uploadedCertificates.map(obj => {
            obj.DocumentFile = this.baseExternalAssets + obj.DocumentFile;
          })
        }
        if (res.returnObject.UploadedTradeLicense && res.returnObject.UploadedTradeLicense[0].DocumentFileName &&
          res.returnObject.UploadedTradeLicense[0].DocumentFileName != "[]" &&
          isJSON(res.returnObject.UploadedTradeLicense[0].DocumentFileName)) {
          let tradeLiscence = res.returnObject.UploadedTradeLicense[0];
          this.uploadedLiscence = JSON.parse(tradeLiscence.DocumentFileName);
          this.docTypeIdLiscence = this.uploadedLiscence[0].DocumentID;
          this.uploadedLiscence.map(obj => {
            obj.DocumentFile = this.baseExternalAssets + obj.DocumentFile;
          })
        }
        this.getListJobTitle(countryId, info);
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
      this.personalInfoForm.controls['jobTitle'].setValue(obj);

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

    this.personalInfoForm.controls['mobile'].setValue(info.PrimaryPhone);
  }



  setBusinessInfo(info) {
    this.businessInfoForm.controls['orgName'].setValue(info.ProviderName);
    this.businessInfoForm.controls['address'].setValue(info.ProviderAddress);
    this.businessInfoForm.controls['poBoxNo'].setValue(info.POBox);
    if (info.ProviderCityID) {
      let obj = this.cityList.find(elem => elem.id == info.ProviderCityID);
      this.businessInfoForm.controls['city'].setValue(obj);
    }
    this.businessInfoForm.controls['phone'].setValue(info.ProviderPhone);
    this.businessInfoForm.controls['profileUrl'].setValue(info.ProfileID);
  }



  freightService(obj, selectedService) {
    let selectedItem = selectedService.classList;
    if (this.frtService && this.frtService.length) {
      for (var i = 0; i < this.frtService.length; i++) {
        if (this.frtService[i].LogServID == obj.LogServID) {
          if (this.frtService.length > 1 && obj.IsRemovable){
            this.frtService.splice(i, 1);
            selectedItem.remove('active');
            this.removeServices(obj);
          }
          else{
            if (!obj.IsRemovable){
              this._toastr.info("Service can not be removed. Please first removed the rates", '')
            }
            else{
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



  selectServices(obj) {
    let object = {
      providerID: this.userProfile.ProviderID,
      createdBy: this.userProfile.LoginID,
      serviceID: obj.LogServID,
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
      logServID: obj.LogServID
    }
    this._settingService.deSelectService(object).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        obj.ProvLogServID = null;
      }
      else{
        this._toastr.error(res.returnText,'');
      }
    })
  }

  companyAboutUs(){
    let object = {
      providerID: this.userProfile.ProviderID,
      about: this.editorContent,
      ModifiedBy: this.userProfile.LoginID
    }
    this._settingService.companyAbout(object).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        this.editable = false;
        this._toastr.success('Updated Successfully.', '');
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
      if (selectedFiles.status == 1) this._toastr.error('Please select twelve or less file(s) to upload.', '')
      else if (selectedFiles.status == 2) this._toastr.error('File size should not exceed 5 MB. Please upload smaller file.', '')
      else if (selectedFiles.status == 4) this._toastr.error('File format is not supported. Please upload supported format file.', '')
      return;
    }
    else {
      try {
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
            this.docTypeIdLiscence= resObj.DocumentID;
            this.fileStatusLiscence = resObj.DocumentLastStaus;
          }
          let fileObj = JSON.parse(resObj.DocumentFile);
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
    this._settingService.deactivateAccount(this.userProfile.UserID, this.userProfile.UserID).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        this._toastr.info(res.returnText, "")
      }
      else {
        this._toastr.info(res.returnText, "")
      }
    })
  }
  updatePersonalInfo() {
    let obj = {
      userID: this.userProfile.UserID,
      firstName: this.personalInfoForm.value.firstName,
      lastName: this.personalInfoForm.value.lastName,
      jobTitle: this.personalInfoForm.value.jobTitle.baseLanguage,
      cityID: this.personalInfoForm.value.city.id,
      mobileNumber: this.personalInfoForm.value.mobile,
      regionID: this.personalInfoForm.value.region,
      currencyID: this.personalInfoForm.value.currency.id
    }
    this._settingService.personalSetting(obj).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        this._toastr.success('Personal Information Updated', '')
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
      website: this.businessInfoForm.value.socialUrl,
      ModifiedBy : this.userProfile.LoginID
    }
    this._settingService.businessSetting(obj).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        this._toastr.success('Business Information Updated', '')
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
