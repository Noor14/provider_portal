import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SharedService } from '../../../../../../services/shared.service';
import { EMAIL_REGEX, CustomValidator, loading } from '../../../../../../constants/globalFunctions';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { CommonService } from '../../../../../../services/common.service';
import { NgFilesService, NgFilesConfig, NgFilesStatus, NgFilesSelected } from '../../../../../../directives/ng-files';
import { UserBusinessService } from '../../user-business.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { element } from 'protractor';
import { DocumentUpload } from '../../../../../../interfaces/document.interface';
import { HttpErrorResponse } from '@angular/common/http';



@Component({
  selector: 'app-directorinfo',
  templateUrl: './directorinfo.component.html',
  styleUrls: ['./directorinfo.component.scss'],
  encapsulation: ViewEncapsulation.None,

})
export class DirectorinfoComponent implements OnInit {


  public showTranslatedLangSide: boolean;
  public activeIds = ["directorInfo", "managementInfo"];
  public panelObj: any = {};
  public panelObjDr: any = {};
  public selectedDocx: any[] = [];
  private sharedConfig: NgFilesConfig = {
    acceptExtensions: ['jpg', 'png', , 'pdf', 'bmp'],
    maxFilesCount: 2,
    maxFileSize: 4096000,
    totalFilesSize: 8192000
  };

  public debounceInput: Subject<string> = new Subject();
  public debounceInputMang: Subject<string> = new Subject();
  public countryFlagImage: string;
  public phoneCode: string;
  public transPhoneCode: string;
  public phoneCountryId: any
  public countryList: any[];

  public nextState: boolean
  // form Field Validtaions boolean variable
  public requiredFields: string = "This field is required";
  public requiredFieldsOthrLng: string = "هذه الخانة مطلوبه";

  public firstNameError: boolean;
  public lastNameError: boolean;
  public phoneError: boolean;
  public EmailError: boolean;
  public transfirstNameError: boolean;
  public translastNameError: boolean;
  public translangPhoneError: boolean;
  public transEmailError: boolean;

  public activeFirstName: any;
  public activeTransFirstName: any;
  public activeLastName: any;
  public activeTransLastName: any;
  public activePhone: any;
  public activeTransPhone: any;


  public firstNameErrorMng: boolean;
  public lastNameErrorMng: boolean;
  public transfirstNameErrorMng: boolean;
  public translastNameErrorMng: boolean;

  public activeFirstNameMng: any;
  public activeTransFirstNameMng: any;
  public activeLastNameMng: any;
  public activeTransLastNameMng: any;


  // model binding

  public transLangEmail: any;

  // global Input
  public Globalinputfrom: any;
  public Globalinputto: any;
  public GlobalinputfromMng: any;
  public GlobalinputtoMng: any;

  public userProfile: any;

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



  public docxId: any;
  public docTypes: any = [];
  public jobTypeList: any = [];
  public selectedjobDesg;
  public selectedjobDesgAr;
  public desgType;

  public directorNameBaseLanguage
  public directorNameOtherLanguage;
  public managementNameBaseLanguage
  public managementNameOtherLanguage;
  public statementBaseLanguage;
  public statementOtherLanguage;
  public firstNameBaseLanguage
  public firstNameOtherLanguage;
  public lastNameBaseLanguage
  public lastNameOtherLanguage;
  public emailLblBaseLanguage
  public emailLblOtherLanguage;
  public mobLblBaseLanguage
  public mobLblOtherLanguage;
  public jobtitleLblBaseLanguage;
  public jobtitleLblOtherLanguage;
  public addmoreLblBaseLanguage
  public addmoreLblOtherLanguage;
  public textBackbtnBaseLanguage;
  public textBackbtnOtherLanguage;
  public textbtnSubmitBaseLanguage
  public textbtnSubmitOtherLanguage;
  public identityLblBaseLanguage;
  public identityLblOtherLanguage;
  public identityTypeLblBaseLanguage;
  public identityTypeLblOtherLanguage;


  directorForm;
  managementForm;

  public formOneObj;
  // public uploadDocs: Array<DocumentUpload> = []

  constructor(
    private _sharedService: SharedService,
    private _commonService: CommonService,
    private _userbusinessService: UserBusinessService,
    private ngFilesService: NgFilesService,
    private _toastr: ToastrService,
    private _router: Router,
    private sanitizer: DomSanitizer
    
  ) {

 }

  ngOnInit() {
    this.ngFilesService.addConfig(this.sharedConfig, 'config');
    this.getLabels();
    let userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo && userInfo.returnObject) {
      this.userProfile = userInfo.returnObject;
      this.showTranslatedLangSide = (this.userProfile.regionCode == "MET") ? true : false;
    }

    this.directorForm = new FormGroup({
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
      phone: new FormControl(null, [Validators.required, Validators.pattern(/^(?!(\d)\1+(?:\1+){0}$)\d+(\d+){0}$/), Validators.minLength(7), Validators.maxLength(13)]),
      transLangPhone: new FormControl(null, [CustomValidator.bind(this), Validators.minLength(7), Validators.maxLength(13)]),
    });


    this.managementForm = new FormGroup({
      firstName: new FormControl(null, [Validators.required, Validators.pattern(/[a-zA-Z-][a-zA-Z -]*$/), Validators.minLength(2), Validators.maxLength(100)]),
      transLangfirstName: new FormControl(null, [CustomValidator.bind(this), Validators.minLength(2), Validators.maxLength(100)]),
      lastName: new FormControl(null, [Validators.required, Validators.pattern(/[a-zA-Z-][a-zA-Z -]*$/), Validators.minLength(2), Validators.maxLength(100)]),
      transLanglastName: new FormControl(null, [CustomValidator.bind(this), Validators.minLength(2), Validators.maxLength(100)]),
      jobDesgType: new FormControl(null, [Validators.required]),
      jobDesgTypeAr: new FormControl(null, [CustomValidator.bind(this)]),
    });


    this._sharedService.countryList.subscribe((state: any) => {
      this.countryList = state;
      if (this.userProfile.countryID) {
        let selectedCountry = this.countryList.find(obj => obj.id == this.userProfile.countryID);
        this.selectPhoneCode(selectedCountry);
      }
    });

    this._sharedService.documentList.subscribe((state: any) => {
      if (state) {
        let copy = Object.assign([], state)
        this.docTypes = copy.filter(element => !element.BusinessLogic)
        // this.uploadDocs = copy.filter(element => element.BusinessLogic)

      }
    });


    this._sharedService.jobTitleList.subscribe((state: any) => {
      if (state){
      this.jobTypeList = state;
      this.desgType = this.jobTypeList[0];
      this.selectedjobDesg = this.desgType.BaseLang;
      this.selectedjobDesgAr = this.desgType.OtherLang;
      }
    });


    this._sharedService.businessDetailObj.subscribe((state: any) => {
      this.formOneObj = state;
    });
  }
  
  getLabels() {
    this._sharedService.businessProfileJsonLabels.subscribe((state: any) => {
      if (state) {
        let data = state;
        data.forEach(element => {
          if (element.keyCode == "lbl_DirectorInfo") {
            this.directorNameBaseLanguage = element.baseLang;
            this.directorNameOtherLanguage = element.otherLang;
          }
          else if (element.keyCode == "lbl_ManagementInfo") {
            this.managementNameBaseLanguage = element.baseLang;
            this.managementNameOtherLanguage = element.otherLang;
          }
          else if (element.keyCode == "lbl_Content") {
            this.statementBaseLanguage = element.baseLang;
            this.statementOtherLanguage = element.otherLang;
          }
         else if (element.keyCode == "lbl_FirstName") {
            this.firstNameBaseLanguage = element.baseLang;
            this.firstNameOtherLanguage = element.otherLang;
          }
          else if (element.keyCode == "lbl_LastName") {
            this.lastNameBaseLanguage = element.baseLang;
            this.lastNameOtherLanguage = element.otherLang;
          }
          else if (element.keyCode == "lbl_Email") {
            this.emailLblBaseLanguage = element.baseLang;
            this.emailLblOtherLanguage = element.otherLang;
          }
          else if (element.keyCode == "lbl_Mobile") {
            this.mobLblBaseLanguage = element.baseLang;
            this.mobLblOtherLanguage = element.otherLang;
          }
          else if (element.keyCode == "lbl_JobTitle") {
            this.jobtitleLblBaseLanguage = element.baseLang;
            this.jobtitleLblOtherLanguage = element.otherLang;
          }
          else if (element.keyCode == 'lbl_Identity'){
            this.identityLblBaseLanguage = element.baseLang;
            this.identityLblOtherLanguage = element.otherLang;
          }
          else if (element.keyCode == 'lbl_IdType') {
            this.identityTypeLblBaseLanguage = element.baseLang;
            this.identityTypeLblOtherLanguage = element.otherLang;
          }
          else if (element.keyCode == "lbl_AddMore") {
            this.addmoreLblBaseLanguage = element.baseLang;
            this.addmoreLblOtherLanguage = element.otherLang;
          }
          else if (element.keyCode == "btn_Back") {
            this.textBackbtnBaseLanguage = element.baseLang;
            this.textBackbtnOtherLanguage = element.otherLang;
          }
          else if (element.keyCode == "btn_Submit") {
            this.textbtnSubmitBaseLanguage = element.baseLang;
            this.textbtnSubmitOtherLanguage = element.otherLang;
          }
         
        });
      }
    });

  }
  
  panelChanger(event){
    if(event.panelId == 'directorInfo'){
       this.panelObjDr = {
      panelId:event.panelId,
      openState: event.nextState
    }
    }
      else{
       this.panelObj = {
      panelIdMang:event.panelId,
      openState: event.nextState
    }
    }
  
  }
  


  jobType(type) {
    if (type && type != 'undefined') {
      let selectedDesg = this.jobTypeList.find(obj => (obj.BaseLang == type || obj.OtherLang == type));
      this.desgType = selectedDesg;
      this.selectedjobDesg = selectedDesg.BaseLang;
      this.selectedjobDesgAr = selectedDesg.OtherLang;
    }
    else {
      this.desgType = {};
      this.selectedjobDesg = type;
      this.selectedjobDesgAr = type;
    }
  }

  selectdocType(id, obj) {
    this.docxId = obj.DocumentTypeID;
    let elem = document.getElementsByClassName('fancyRadioBoxes') as any;
    for (let i = 0; i < elem.length; i++) {
      if (elem[i].children[0].id == id) {
        elem[i].children[0].checked = true;
      }

    }
  }

  previousForm() {
    this._sharedService.formChange.next(true);
    this._sharedService.formProgress.next(40);

  }

  errorValidate() {

    if (this.managementForm.controls.firstName.status == "INVALID" && this.managementForm.controls.firstName.touched) {
      this.firstNameErrorMng = true;
    }
    if (this.managementForm.controls.transLangfirstName.status == "INVALID" && this.managementForm.controls.transLangfirstName.touched) {
      this.transfirstNameErrorMng = true;
    }
    if (this.managementForm.controls.lastName.status == "INVALID" && this.managementForm.controls.lastName.touched) {
      this.lastNameErrorMng = true;
    }
    if (this.managementForm.controls.transLanglastName.status == "INVALID" && this.managementForm.controls.transLanglastName.touched) {
      this.translastNameErrorMng = true;
    }

    if (this.directorForm.controls.firstName.status == "INVALID" && this.directorForm.controls.firstName.touched) {
      this.firstNameError = true;
    }
    if (this.directorForm.controls.transLangfirstName.status == "INVALID" && this.directorForm.controls.transLangfirstName.touched) {
      this.transfirstNameError = true;
    }
    if (this.directorForm.controls.lastName.status == "INVALID" && this.directorForm.controls.lastName.touched) {
      this.lastNameError = true;
    }
    if (this.directorForm.controls.transLanglastName.status == "INVALID" && this.directorForm.controls.transLanglastName.touched) {
      this.translastNameError = true;
    }
    if (this.directorForm.controls.phone.status == "INVALID" && this.directorForm.controls.phone.touched) {
      this.phoneError = true;
    }
    if (this.directorForm.controls.transLangPhone.status == "INVALID" && this.directorForm.controls.transLangPhone.touched) {
      this.translangPhoneError = true;
    }
    if (this.directorForm.controls.email.status == "INVALID" && this.directorForm.controls.email.touched) {
      this.EmailError = true;
    }
    if (this.directorForm.controls.transLangEmail.status == "INVALID" && this.directorForm.controls.transLangEmail.touched) {
      this.transEmailError = true;
    }



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

  NumberValid(evt) {
    let charCode = (evt.which) ? evt.which : evt.keyCode
    if (charCode > 31 && (charCode < 48 || charCode > 57))
      return false;
    return true;
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

  onModelPhoneChange(fromActive, currentActive, $controlName, $value) {

    if (currentActive && !fromActive) {
      let number = $value.split('');
      for (let i = 0; i < number.length; i++) {
        this.arabicNumbers.forEach((obj, index) => {
          if (number[i] == obj.baseNumber) {
            number.splice(i, 1, obj.arabicNumber)
          }
        })
      }
      this.directorForm.controls[$controlName].patchValue(number.reverse().join(''));
    }
  }

  onModelChange(fromActive, currentActive, $controlName, source, target, $value) {
    setTimeout(() => {
      if (currentActive && !fromActive && $value) {
        this.Globalinputfrom = false;
      }
      if (fromActive == false && currentActive && this.directorForm.controls[$controlName].errors || this.Globalinputto) {
        this._commonService.translatedLanguage(source, target, $value).subscribe((res: any) => {
          this.directorForm.controls[$controlName].patchValue(res.data.translations[0].translatedText);
          this.Globalinputto = true;
        })
      }
      else if ($value && currentActive && source && target && fromActive == undefined) {
        this._commonService.translatedLanguage(source, target, $value).subscribe((res: any) => {
          this.directorForm.controls[$controlName].patchValue(res.data.translations[0].translatedText);
        })
      }
      // else if(currentActive && !$value){
      //   this.fromActive(fromActive);
      // }
    }, 100)
  }

  onTransModel(fromActive, currentActive, $controlName, $value) {

    if (currentActive && !fromActive && $value) {
      this.Globalinputto = false;
    }
    if (currentActive && fromActive == false && this.directorForm.controls[$controlName].errors || this.Globalinputfrom) {
      this.debounceInput.next($value);
      this.debounceInput.pipe(debounceTime(400), distinctUntilChanged()).subscribe(value => {
        this._commonService.detectedLanguage(value).subscribe((res: any) => {
          let sourceLang = res.data.detections[0][0].language;
          let target = "en";
          if (sourceLang && target && value) {
            this._commonService.translatedLanguage(sourceLang, target, value).subscribe((res: any) => {
              this.directorForm.controls[$controlName].patchValue(res.data.translations[0].translatedText);
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
              this.directorForm.controls[$controlName].patchValue(res.data.translations[0].translatedText);
            })
          }
        })
      });
    }
    // else if(currentActive && !$value){
    //   this.fromActive(fromActive);    
    // }
  }


  onModelChangeMng(fromActive, currentActive, $controlName, source, target, $value) {
    setTimeout(() => {
      if (currentActive && !fromActive && $value) {
        this.GlobalinputfromMng = false;
      }
      if (fromActive == false && currentActive && this.managementForm.controls[$controlName].errors || this.GlobalinputtoMng) {
        this._commonService.translatedLanguage(source, target, $value).subscribe((res: any) => {
          this.managementForm.controls[$controlName].patchValue(res.data.translations[0].translatedText);
          this.GlobalinputtoMng = true;
        })
      }
      else if ($value && currentActive && source && target && fromActive == undefined) {
        this._commonService.translatedLanguage(source, target, $value).subscribe((res: any) => {
          this.managementForm.controls[$controlName].patchValue(res.data.translations[0].translatedText);
        })
      }
      // else if(currentActive && !$value){
      //   this.fromActive(fromActive);
      // }
    }, 100)
  }

  onTransModelMng(fromActive, currentActive, $controlName, $value) {

    if (currentActive && !fromActive && $value) {
      this.GlobalinputtoMng = false;
    }
    if (currentActive && fromActive == false && this.managementForm.controls[$controlName].errors || this.GlobalinputfromMng) {
      this.debounceInputMang.next($value);
      this.debounceInputMang.pipe(debounceTime(400), distinctUntilChanged()).subscribe(value => {
        this._commonService.detectedLanguage(value).subscribe((res: any) => {
          let sourceLang = res.data.detections[0][0].language;
          let target = "en";
          if (sourceLang && target && value) {
            this._commonService.translatedLanguage(sourceLang, target, value).subscribe((res: any) => {
              this.managementForm.controls[$controlName].patchValue(res.data.translations[0].translatedText);
              this.GlobalinputfromMng = true;
            })
          }
        })
      });
    }
    else if (currentActive && $value && fromActive == undefined) {
      this.debounceInputMang.next($value);
      this.debounceInputMang.pipe(debounceTime(400), distinctUntilChanged()).subscribe(value => {
        this._commonService.detectedLanguage(value).subscribe((res: any) => {
          let sourceLang = res.data.detections[0][0].language;
          let target = "en";
          // if (sourceLang && target && value) {
          //   this.onModelChange(fromActive, currentActive, $controlName, sourceLang, target, value);
          // }
          if (sourceLang && target && value) {
            this._commonService.translatedLanguage(sourceLang, target, value).subscribe((res: any) => {
              this.managementForm.controls[$controlName].patchValue(res.data.translations[0].translatedText);
            })
          }
        })
      });
    }
    // else if(currentActive && !$value){
    //   this.fromActive(fromActive);    
    // }
  }




  onModelTransPhoneChange(fromActive, currentActive, $controlName, $value) {

    if (currentActive && !fromActive) {
      let number = $value.split('');
      for (let i = 0; i < number.length; i++) {
        this.arabicNumbers.forEach((obj, index) => {
          if (number[i] == obj.baseNumber || number[i] == obj.arabicNumber) {
            number.splice(i, 1, obj.baseNumber)
          }
        })

      }
      this.directorForm.controls[$controlName].patchValue(number.join(''));
    }

  }



  selectDocx(selectedFiles: NgFilesSelected): void {


    if (selectedFiles.status !== NgFilesStatus.STATUS_SUCCESS) {
      if (selectedFiles.status == 1) this._toastr.error('Please select two or less file(s) to upload.', '')
      else if (selectedFiles.status == 2) this._toastr.error('File size should not exceed 4 MB. Please upload smaller file.', '')
      else if (selectedFiles.status == 4) this._toastr.error('File format is not supported. Please upload supported format file.', '')
        return;
    }
    else{
      try {
        this.onFileChange(selectedFiles)
      } catch (error) {
        console.log(error);
      }
      
    }

  }

  onFileChange(event) {

    if (event) {
      try {
        for (let index = 0; index < event.files.length; index++) {
          let reader = new FileReader();
          const element = event.files[index];
          let file = element
          reader.readAsDataURL(file);
          reader.onload = () => {
            let selectedFile: DocumentFile = {
              fileName: file.name,
              fileType: file.type,
              fileUrl: reader.result,
              fileBaseString: reader.result.split(',')[1]
            }
          console.log('you file content:', selectedFile);

          if(this.selectedDocx && this.selectedDocx.length && event.files.length > 1 && index == 0){
            this._toastr.error('Please select only two file to upload', '');
            return;
          } else if (this.selectedDocx && this.selectedDocx.length < 2){
            this.selectedDocx.push(selectedFile);
          }
          else{
            this._toastr.error('Please select only two file to upload', '');
          }

        }
      }
        
      }
      catch (err) {
        console.log(err);
      }
    }

  }
  sanitize(url: string) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  submitBusinessInfo(type) {

    const { license, logo } = this.formOneObj;

    // this.uploadDocs.forEach(docObj => {
    //   if (docObj.BusinessLogic === 'COMPANY_LOGO' && logo && logo.fileBaseString) {

    //     docObj.DocumentFileContent = null;
    //     docObj.DocumentName = null;
    //     docObj.DocumentUploadedFileType = null;
    //     docObj.FileContent = [
    //       {
    //       documentFileName: logo.fileName,
    //       documentFile: logo.fileBaseString,
    //       documentUploadedFileType: logo.fileType
    //       }
    //     ]
    //   }

    //   if (docObj.BusinessLogic === 'TRADE_LICENSE') {
    //     docObj.DocumentFileContent = null;
    //     docObj.DocumentName = null;
    //     docObj.DocumentUploadedFileType = null;
    //     docObj.FileContent = [
    //       {
    //         documentFileName: license.fileName,
    //         documentFile: license.fileBaseString,
    //         documentUploadedFileType: license.fileType
    //       }
    //     ]
    //     docObj.MetaInfoKeysDetail.forEach(element => {
    //       if (element.KeyName == "VAT"){
    //         element.KeyValue = this.formOneObj.informationForm.vatNo
    //       }
    //       else if (element.KeyName == "LCNC"){
    //         element.KeyValue = this.formOneObj.informationForm.licenseNo
    //       }
    //       else if (element.KeyName == "EXPD") {
    //         element.KeyValue = this.formOneObj.expiryDate
    //       }
    //       else if (element.KeyName == "ISUE") {
    //         element.KeyValue = this.formOneObj.issueDate
    //       }

    //     });
       
    //   }
    // })
    let objMangInfo = {
      baseLang : [{
        jobTitleID: (this.desgType && this.desgType.ID) ? this.desgType.ID : null,
        firstName: this.managementForm.value.firstName,
        lastName: this.managementForm.value.lastName
      }],
      otherLang: [
          {
            jobTitleID: (this.desgType && this.desgType.ID) ? this.desgType.ID : null,
            firstName: this.managementForm.value.transLangfirstName,
            lastName: this.managementForm.value.transLanglastName
          }
      ]
    }
    let objDirInfo = {
      baseLang: [{
        firstName: this.directorForm.value.firstName,
        lastName: this.directorForm.value.lastName,
        email: this.directorForm.value.email,
        mobileNo: this.phoneCode + this.directorForm.value.phone
      }],
      otherLang: [
        {
          firstName: this.directorForm.value.transLangfirstName,
          lastName: this.directorForm.value.transLanglastName,
          email: this.directorForm.value.transLangEmail,
          mobileNo: this.directorForm.value.transLangPhone,
        }
      ]
    }

    let obj = {
      userID: this.userProfile.userID,
      providerID: this.userProfile.providerID,
      companyID: this.userProfile.companyID,
      businessProfileBL: {
        licenseNo: this.formOneObj.informationForm.licenseNo,
        issueDate: this.formOneObj.issueDate,
        expiryDate: this.formOneObj.expiryDate,
        vatNo: this.formOneObj.informationForm.vatNo,
        organizationTypeID: this.formOneObj.busiType.ID,
        organizationName: this.formOneObj.organizationForm.orgName,
        addressLine1: this.formOneObj.businessLocForm.address,
        addressLine2: this.formOneObj.businessLocForm.addres2,
        city: this.formOneObj.businessLocForm.city,
        poBox: this.formOneObj.businessLocForm.poBoxNo,
        telephone: this.formOneObj.baseLangPhoneCode + this.formOneObj.contactInfoForm.phone,
        faxNo: this.formOneObj.baseLangPhoneCode + this.formOneObj.contactInfoForm.fax,
        managementInfo: (type == 'skip')? null : objMangInfo.baseLang,
        directorInfo: (type == 'skip') ? null : objDirInfo.baseLang,
        
      },
      businessProfileOL: {
        licenseNo: this.formOneObj.informationForm.licenseNoAr,
        issueDate: this.formOneObj.issueDate,
        expiryDate: this.formOneObj.expiryDate,
        vatNo: this.formOneObj.informationForm.vatNoAr,
        organizationTypeID: this.formOneObj.busiType.ID,
        organizationName: this.formOneObj.organizationForm.transLangOrgName,
        addressLine1: this.formOneObj.businessLocForm.transAddress,
        addressLine2: this.formOneObj.businessLocForm.transAddress2,
        city: this.formOneObj.businessLocForm.transCity,
        poBox: this.formOneObj.businessLocForm.poBoxNoAr,
        telephone: this.formOneObj.OtherLangPhoneCode + this.formOneObj.contactInfoForm.transLangPhone,
        faxNo: this.formOneObj.OtherLangPhoneCode + this.formOneObj.contactInfoForm.transLangFax,
        managementInfo: (type == 'skip') ? null : objMangInfo.otherLang,
        directorInfo: (type == 'skip') ? null : objDirInfo.otherLang,
          
      },
      socialAccount:
      [
        {
          providerSocialMediaAccountsID: 0,
          providerID: this.userProfile.providerID,
          socialMediaPortalsID: 100,
          companyID: this.userProfile.companyID,
          userID: this.userProfile.userID,
          linkURL: "texpo.com",
        }
      ],
      providerLogisticServiceList: this.formOneObj.logisticsService,
      // businessLocation: {
      //   latitude: this.formOneObj.location.lat.toString(),
      //   longitude: this.formOneObj.location.lng.toString()
      // },
      // doc: this.uploadDocs

    };
    loading(true);

    this._userbusinessService.submitBusinessInfo(obj).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        localStorage.setItem('userInfo', JSON.stringify(res));
        this._router.navigate(['/profile-completion']);
        loading(false)
      }
      else{
        loading(false)
        
      }
    },(err:HttpErrorResponse)=>{
      loading(false)
    })

  }

  removeSelectedDocx(index) {
    this.selectedDocx.splice(index, 1);
  }

}

export interface DocumentFile {
  fileBaseString: string
  fileName: string
  fileType: string
  fileUrl: string
}