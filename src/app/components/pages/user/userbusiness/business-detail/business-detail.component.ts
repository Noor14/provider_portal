import { Component, OnInit, NgZone, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SharedService } from '../../../../../services/shared.service';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { UserService } from '../../user.service';
import { MapsAPILoader } from '@agm/core';
import { } from '@types/googlemaps';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from '../../../../../services/common.service';
import { NgFilesService, NgFilesConfig, NgFilesStatus, NgFilesSelected } from '../../../../../directives/ng-files';

@Component({
  selector: 'app-business-detail',
  templateUrl: './business-detail.component.html',
  styleUrls: ['./business-detail.component.scss']
})
export class BusinessDetailComponent implements OnInit {

  @ViewChild('search') public searchElement: ElementRef;
  public debounceInput: Subject<string> = new Subject();
  public requiredFields: string = "This field is required";
  public requiredFieldsOthrLng: string = "هذه الخانة مطلوبه";
  public selectedLicense;
  public selectedLogo;

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



  public zoomlevel: number = 6;
  public draggable: boolean = true;
  public location: any = {lat:undefined, lng:undefined};
  public countAccount = 1 
  public socialAccounts: any[]=[this.countAccount] ;
  public firstNameBL;
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
  public pastYears:any[] = [];
  public futureYears:any[] = [];
  public dates:any[] = [];
  public months:any[]= [
    {
      name:'Jan',
      arabicName:'يناير'
    },
    {
      name:'Feb',
      arabicName:'فبراير'
    },
    {
      name:'Mar',
      arabicName:'مارس'
    },
    {
      name:'Apr',
      arabicName:'أبريل'
    },
    {
      name:'May',
      arabicName:'مايو'
    },
    {
      name:'Jun',
      arabicName:'يونيو'
    },
    {
      name:'Jul',
      arabicName:'يوليو'
    },
    {
      name:'Aug',
      arabicName:'أغسطس'
    },
    {
      name:'Sep',
      arabicName:'سبتمبر'
    },
    {
      name:'Oct',
      arabicName:'أكتوبر'
    },
    {
      name:'Nov',
      arabicName:'نوفمبر'
    },
    {
      name:'Dec',
      arabicName:'ديسمبر'
    }
  ]
  public arabicNumbers :any = [
    {baseNumber:'0',arabicNumber:'۰'},
    {baseNumber:'1',arabicNumber:'۱'},
    {baseNumber:'2',arabicNumber:'۲'},
    {baseNumber:'3',arabicNumber:'۳'},
    {baseNumber:'4',arabicNumber:'۴'},
    {baseNumber:'5',arabicNumber:'۵'},
    {baseNumber:'6',arabicNumber:'۶'},
    {baseNumber:'7',arabicNumber:'۷'},
    {baseNumber:'8',arabicNumber:'۸'},
    {baseNumber:'9',arabicNumber:'۹'}
  ]
  public countryList:any;
  public countryFlagImage:string;
  public phoneCode:string;
  public transPhoneCode:string;
  public phoneCountryId:any;
  public licenseNoAr: any; 
  public vatNoAr:any;
  public poBoxAr:any;
  public addressAr:any;
  
    // global Input
  public Globalinputfrom: any;
  public Globalinputto: any;

  public informationForm;
  public businessLocForm;
  public organizationForm;
  public contactInfoForm;


  public activePhone:any;
  public activeTransPhone:any;
  public activeFax:any;
  public activeTransFax:any;
  public activeOrgName: any;
  public activeTransOrgName: any;

  public orgNameError:boolean;
  public transorgNameError:boolean;
  public addressArError:boolean;
  public addressError:boolean;
  public vatError:boolean;
  public vatNoArError:boolean;
  public poBoxError:boolean;
  public poBoxArError:boolean;
  public translicenseError:boolean
  public licenseError:boolean
  public phoneError: boolean;
  public translangPhoneError: boolean;
  public faxError: boolean;
  public translangFaxError: boolean;

  public userProfile;

  constructor(
    private mapsAPILoader: MapsAPILoader,  
    private ngZone: NgZone,  
    private _sharedService: SharedService,
    private _userService: UserService,
    private _toastr: ToastrService,
    private _commonService: CommonService,
    private ngFilesService: NgFilesService
    
  ) { }

  ngOnInit() {
    this.ngFilesService.addConfig(this.config, 'docConfig');
    // this.ngFilesService.addConfig(this.namedConfig);
    this._sharedService.formProgress.next(40);

    let userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if(userInfo && userInfo.returnObject){
      this.userProfile = userInfo.returnObject;
      this.firstNameBL = userInfo.returnObject.firstNameBL;
  }
    this.getsocialList();
    this.getOrganizationList();
    this.getTenYears();
    this.getDates();

    this._userService.getServiceOffered().subscribe((res: any) => {
      if (res.returnStatus == 'Success') {
        this.serviceOffered = JSON.parse(res.returnObject);
      }
    })
    this._sharedService.countryList.subscribe((state: any) => {
      if(state){
      this.countryList = state;
      let selectedCountry = this.countryList.find(obj => obj.id == this.userProfile.countryID);
      this.selectPhoneCode(selectedCountry);
      this.getplacemapLoc(selectedCountry.code.toLowerCase());
      this.getMapLatlng(selectedCountry.title);
    }
      
    });

    this.informationForm = new FormGroup({
      licenseNo: new FormControl(null, [Validators.required, Validators.minLength(4), Validators.maxLength(10)]),
      licenseNoAr: new FormControl(null, [Validators.required, Validators.minLength(4), Validators.maxLength(10)]),
      vatNo: new FormControl(null, [Validators.required, Validators.pattern(/^(?!(\d)\1+(?:\1+){0}$)\d+(\d+){0}$/), Validators.minLength(5), Validators.maxLength(12)]),
      vatNoAr: new FormControl(null, [Validators.minLength(5), Validators.maxLength(12)]),
      
      issueDate: new FormControl(null, [Validators.required]),
      issueMonth: new FormControl(null, [Validators.required]),
      issueYear: new FormControl(null, [Validators.required]),
      issueDateArabic: new FormControl(null, [Validators.required]),
      issueMonthArabic: new FormControl(null, [Validators.required]),
      issueYearArabic: new FormControl(null, [Validators.required]),
      expireDate: new FormControl(null, [Validators.required]),
      expireMonth: new FormControl(null, [Validators.required]),
      expiryYear: new FormControl(null, [Validators.required]),
      expireDateArabic: new FormControl(null, [Validators.required]),
      expireMonthArabic: new FormControl(null, [Validators.required]),
      expiryYearArabic: new FormControl(null, [Validators.required]),
    });
    this.businessLocForm = new FormGroup({
      address: new FormControl(null, [Validators.required, Validators.maxLength(200), Validators.minLength(20)]),
      transAddress: new FormControl(null, [Validators.required, Validators.maxLength(200), Validators.minLength(20)]),
      poBoxNo: new FormControl(null, [Validators.required, Validators.maxLength(16), Validators.minLength(4)]),
      poBoxNoAr: new FormControl(null, [Validators.maxLength(16), Validators.minLength(4)]),
    });

    this.organizationForm = new FormGroup({
      organizationType: new FormControl(null, [Validators.required]),
      organizationTypeAr: new FormControl(null, [Validators.required]),
      orgName: new FormControl(null, [Validators.required, Validators.maxLength(100), Validators.minLength(4)]),
      transLangOrgName: new FormControl(null, [Validators.maxLength(100), Validators.minLength(4)]),
    });
    this.contactInfoForm = new FormGroup({
      phone: new FormControl(null, [Validators.required, Validators.pattern(/^(?!(\d)\1+(?:\1+){0}$)\d+(\d+){0}$/), Validators.minLength(7), Validators.maxLength(10)]),
      transLangPhone: new FormControl(null, [Validators.minLength(7), Validators.maxLength(10)]),
      fax: new FormControl(null, [Validators.required, Validators.pattern(/^(?!(\d)\1+(?:\1+){0}$)\d+(\d+){0}$/), Validators.minLength(7), Validators.maxLength(10)]),
      transLangFax: new FormControl(null, [Validators.minLength(7), Validators.maxLength(10)]),
     
    });
  }

getDates(){
  for(let i=1; i<=31; i++){
    let persianDigits = "۰۱۲۳۴۵۶۷۸۹";
    let persianMap = persianDigits.split("");
   let convertedNumber = i.toString().replace(/\d/g, (m : string) => {
      return persianMap[parseInt(m)]
   
    });
    this.dates.push({ dateNormal : i, dateArabic : convertedNumber });
  }
}

getMapLatlng(region) {
  this._userService.getLatlng(region).subscribe((res: any) => {
    if (res.status == "OK") {
      this.location = res.results[0].geometry.location;
    }
  })
}

getplacemapLoc(countryBound){
  this.mapsAPILoader.load().then(() => {
    this.geoCoder = new google.maps.Geocoder;
    let autocomplete = new google.maps.places.Autocomplete(this.searchElement.nativeElement);
    autocomplete.setComponentRestrictions(
      {'country': [countryBound]});
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
        this.zoomlevel = 12;
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

  getOrganizationList(){
    this._userService.getOrganizationType().subscribe((res:any)=>{
      if(res.returnStatus=="Success"){
        this.organizationList = JSON.parse(res.returnObject);
      }
    })
  }
  getsocialList(){
    this._userService.socialList().subscribe((res:any)=>{
      if(res.returnStatus=="Success"){
        this.socialLink = res.returnObject;
      }
    })
  }

  markerDragEnd($event){
    console.log($event);
    this.geoCoder.geocode({'location': {lat: $event.coords.lat, lng: $event.coords.lng}}, (results, status) => {
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

  selectMonth(name, type){
    if(type == "issue"){
    if(name && name != 'undefined'){
    let selectedMonth = this.months.find(obj => (obj.name == name  || obj.arabicName == name));
    this.IssueMonth = selectedMonth;
    this.selectedIssueMonth = selectedMonth.name;
    this.selectedIssueMonthAr = selectedMonth.arabicName;
   }
   else{
    this.IssueMonth = {};
    this.selectedIssueMonth = name;
    this.selectedIssueMonthAr = name;
   }
   }
   else if(type == "expire"){
    if(name && name != 'undefined'){
    let selectedMonth = this.months.find(obj => (obj.name == name  || obj.arabicName == name));
    this.ExpireMonth = selectedMonth;
    this.selectedExpireMonth = selectedMonth.name;
    this.selectedExpireMonthAr = selectedMonth.arabicName;
   }
   else{
    this.ExpireMonth = {};
    this.selectedExpireMonth = name;
    this.selectedExpireMonthAr = name;
   }
   }
  }
  onModelFaxChange(fromActive, currentActive, $controlName, $value){
    if(currentActive && !fromActive){
       let number = $value.split('');
    for (let i=0; i< number.length; i++){
      this.arabicNumbers.forEach((obj, index)=>{
        if(number[i] == obj.baseNumber){
          number.splice(i,1, obj.arabicNumber)
        }
      })
    }
    this.contactInfoForm.controls[$controlName].patchValue(number.reverse().join(''));
    }
  }

  onModelTransFaxChange(fromActive, currentActive, $controlName, $value){
  
    if(currentActive && !fromActive){
       let number = $value.split('');
    for (let i=0; i< number.length; i++){
      this.arabicNumbers.forEach((obj, index)=>{
        if(number[i] == obj.baseNumber || number[i] == obj.arabicNumber){
          number.splice(i,1, obj.baseNumber)
        }
      })
      
    }
    this.contactInfoForm.controls[$controlName].patchValue(number.join(''));
    }
  
  }

  onModelPhoneChange(fromActive, currentActive, $controlName, $value){
    if(currentActive && !fromActive){
       let number = $value.split('');
    for (let i=0; i< number.length; i++){
      this.arabicNumbers.forEach((obj, index)=>{
        if(number[i] == obj.baseNumber){
          number.splice(i,1, obj.arabicNumber)
        }
      })
    }
    this.contactInfoForm.controls[$controlName].patchValue(number.reverse().join(''));
    }
}

onModelTransPhoneChange(fromActive, currentActive, $controlName, $value){
  
  if(currentActive && !fromActive){
     let number = $value.split('');
  for (let i=0; i< number.length; i++){
    this.arabicNumbers.forEach((obj, index)=>{
      if(number[i] == obj.baseNumber || number[i] == obj.arabicNumber){
        number.splice(i,1, obj.baseNumber)
      }
    })
    
  }
  this.contactInfoForm.controls[$controlName].patchValue(number.join(''));
  }

}

onModelChange(fromActive, currentActive, $controlName, source, target, $value) {
  setTimeout(() => {
    if(currentActive && !fromActive && $value){
      this.Globalinputfrom = false;
    }
    if(fromActive == false && currentActive && this.organizationForm.controls[$controlName].errors || this.Globalinputto){
      this._commonService.translatedLanguage(source, target, $value).subscribe((res: any) => {
        this.organizationForm.controls[$controlName].patchValue(res.data.translations[0].translatedText);
        this.Globalinputto = true;
      })
    }
   else if ($value && currentActive && source && target && fromActive==undefined) {
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
  if(currentActive && !fromActive && $value){
    this.Globalinputto = false;
  }
  if(currentActive && fromActive == false && this.organizationForm.controls[$controlName].errors || this.Globalinputfrom){
    this.debounceInput.next($value);
    this.debounceInput.pipe(debounceTime(400),distinctUntilChanged()).subscribe(value => {
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





  addmoreSocialLink(){
    this.countAccount ++
   this.socialAccounts.push(this.countAccount);
  }

    selectDate(date, type){
    if(type == "issue"){
    if(date && date != 'undefined'){
    let selectedDate = this.dates.find(obj => (obj.dateNormal == date  || obj.dateArabic == date));
    this.IssueDate = selectedDate;
    this.selectedIssueDate = selectedDate.dateNormal;
    this.selectedIssueDateAr = selectedDate.dateArabic;
   }
   else{
    this.IssueDate = {};
    this.selectedIssueDate = date;
    this.selectedIssueDateAr = date;
   }
   }
   else if(type == "expire"){
    if(date && date != 'undefined'){
    let selectedDate = this.dates.find(obj => (obj.dateNormal == date  || obj.dateArabic == date));
    this.ExpireDate = selectedDate;
    this.selectedExpireDate = selectedDate.dateNormal;
    this.selectedExpireDateAr = selectedDate.dateArabic;
   }
   else{
    this.ExpireDate = {};
    this.selectedExpireDate = date;
    this.selectedExpireDateAr = date;
   }
   }
  }
  
  organizationType(type){
    if(type && type != 'undefined'){
      let selectedOrganization = this.organizationList.find(obj => (obj.BaseLang == type  || obj.OtherLang == type));
      this.orgType = selectedOrganization;
      this.selectedOrgType = selectedOrganization.BaseLang;
      this.selectedOrgTypeAr = selectedOrganization.OtherLang;
     }
     else{
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

  selectPhoneCode(list) {
    this.countryFlagImage = list.code;
    let description = list.desc;
    this.phoneCode = description[0].CountryPhoneCode;
    this.transPhoneCode = description[0].CountryPhoneCode_OtherLang;
    this.phoneCountryId = list.id
  }
   selectYear(year, type){
    if(type == "issue"){
    if(year && year != 'undefined'){
    let selectedYear = this.pastYears.find(obj => (obj.yearNormal == year  || obj.yearArabic == year));
    this.IssueYear = selectedYear;
    this.selectedIssueYear = selectedYear.yearNormal;
    this.selectedIssueYearAr = selectedYear.yearArabic;
   }
   else{
    this.IssueYear = {};
    this.selectedIssueYear= year;
    this.selectedIssueYearAr = year;
   }
   }
   else if(type == "expire"){
    if(year && year != 'undefined'){
    let selectedYear = this.futureYears.find(obj => (obj.yearNormal == year  || obj.yearArabic == year));
    this.ExpiryYear = selectedYear;
    this.selectedExpiryYear = selectedYear.yearNormal;
    this.selectedExpiryYearAr = selectedYear.yearArabic;
   }
   else{
    this.ExpiryYear = {};
    this.selectedIssueYear= year;
    this.selectedIssueYearAr = year
   }
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

  getTenYears(){
    let date = new Date();
    for (let i=0; i < 2; i++){
        let pastyear = date.getFullYear()-i;
        let futureyear= date.getFullYear()+i
        let persianDigits = "۰۱۲۳۴۵۶۷۸۹";
        let persianMap = persianDigits.split("");
        let convertedPastYear = pastyear.toString().replace(/\d/g, (m : string) => {
            return persianMap[parseInt(m)]
        
          });
       let convertedFutureYear = futureyear.toString().replace(/\d/g, (m : string) => {
            return persianMap[parseInt(m)]
        
       });
          
      this.pastYears.push({ yearNormal : pastyear, yearArabic : convertedPastYear });
      this.futureYears.push({ yearNormal: futureyear, yearArabic: convertedFutureYear });
    }
  }



  nextForm(){
    this._sharedService.formChange.next(false);
  }

  removeSelectedDocx(type){
    if(type == "license"){
      this.selectedLicense = {}
    }
    else if(type == "logo"){
      this.selectedLogo = {}
    }
  }



 SelectDocx(selectedFiles: NgFilesSelected, type): void {
   if(type =='license'){
    if (selectedFiles.status !== NgFilesStatus.STATUS_SUCCESS) {
      if (selectedFiles.files.length > 1) this._toastr.error('Please select a one file', '')
      // this.selectedFiles = selectedFiles.status;
      return;
    }
    this.selectedLicense = selectedFiles.files[0];
  }
  else if(type =='logo'){
    if (selectedFiles.status !== NgFilesStatus.STATUS_SUCCESS) {
      if (selectedFiles.files.length > 1) this._toastr.error('Please select a one file', '')
      // this.selectedFiles = selectedFiles.status;
      return;
    }
    this.selectedLogo = selectedFiles.files[0];
  }
  }

}
