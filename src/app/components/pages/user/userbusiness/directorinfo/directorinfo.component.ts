import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SharedService } from '../../../../../services/shared.service';
import { EMAIL_REGEX, CustomValidator } from '../../../../../constants/globalFunctions';

@Component({
  selector: 'app-directorinfo',
  templateUrl: './directorinfo.component.html',
  styleUrls: ['./directorinfo.component.scss'],
  encapsulation: ViewEncapsulation.None,
  
})
export class DirectorinfoComponent implements OnInit {
  
  public countryFlagImage: string;
  public phoneCode: string;
  public transPhoneCode: string;
  public phoneCountryId: any
  public countryList: any[];
  
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
  public activeLastName:any;
  public activeTransLastName:any;
  public activePhone:any;
  public activeTransPhone:any;

  // model binding

  public transLangEmail: any;


  public userProfile: any;

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
  
  directorForm; 

  constructor(private _sharedService :SharedService) {
    
   }

  ngOnInit() {
    let userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if(userInfo && userInfo.returnObject){
      this.userProfile = userInfo.returnObject;
      console.log(this.userProfile);
      if (this.userProfile.countryID) {
        let selectedCountry = this.countryList.find(obj => obj.id == this.userProfile.countryID);
        this.selectPhoneCode(selectedCountry);
      }
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
      phone: new FormControl(null, [Validators.required, Validators.pattern(/^(?!(\d)\1+(?:\1+){0}$)\d+(\d+){0}$/), Validators.minLength(7), Validators.maxLength(9)]),
      transLangPhone: new FormControl(null, [CustomValidator.bind(this), Validators.minLength(7), Validators.maxLength(9)]),
        });


    this._sharedService.countryList.subscribe((state: any) => {
      this.countryList = state;
    });
  }
  
 previousForm(){
    this._sharedService.formChange.next(true);
  }

  errorValidate() {
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
    this.directorForm.controls[$controlName].patchValue(number.reverse().join(''));
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
  this.directorForm.controls[$controlName].patchValue(number.join(''));
  }

}
}

