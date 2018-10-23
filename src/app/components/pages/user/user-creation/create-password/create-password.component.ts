import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from '../../../../../services/shared.service';
import { UserCreationService } from '../user-creation.service';
import { loading } from '../../../../../constants/globalFunctions';
import { HttpErrorResponse } from '@angular/common/http';


@Component({
  selector: 'app-create-password',
  templateUrl: './create-password.component.html',
  styleUrls: ['./create-password.component.scss']
})
export class CreatePasswordComponent implements OnInit {
  
  public requiredFields: string = "This field is required";
  public paramSubscriber: any;
  public userInfo: any;
  public passwordError:boolean
  public passForm;
  public colorEye;


  public showTranslatedLangSide: boolean;
  public headingBaseLanguage: string;
  public headingOtherLanguage: string;
  public descBaseLanguage: string;
  public descOtherLanguage: string;
  public lblPasswordOtherlang: string;
  public lblPasswordBaselang: string;
  public btnBaselang: string;
  public btnOtherlang: string;



  constructor(
    private _userService: UserService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _toast: ToastrService,
    private _sharedService: SharedService,
    private _userCreationService: UserCreationService,

   ) { }

  ngOnInit() {
    this.passForm = new FormGroup({
      password: new FormControl(null, [Validators.required, Validators.minLength(6), Validators.maxLength(15)]),
    });
    this.paramSubscriber = this._route.params.subscribe(params => {
      let keyCode = params.keys; // (+) converts string 'id' to a number
      if (keyCode) {
        this.UserInfofromOtp(keyCode);
      }
    });
  }

  confirmPassword(event) {
    let element = event.currentTarget.nextSibling.nextSibling;
    if (element.type === "password" && element.value) {
      element.type = "text";
      this.colorEye = "grey";
    }
    else {
      element.type = "password";
      this.colorEye = "black";

    };
  }
  passSpaceHandler(event){
    if (event.keyCode == 32) {
      event.preventDefault();
      return false;
    }
  }

  validate(){
    if (this.passForm.controls.password.status == "INVALID" && this.passForm.controls.password.touched) {
      this.passwordError = true;
    }
  }

  getlabelsDescription(obj){
    this._userService.getlabelsDescription('createpassword').subscribe((res:any)=>{
      if(res.returnStatus =='Success'){
        console.log(res.returnObject);
       this.headingBaseLanguage = res.returnObject[0].baseLang.replace('{firstName}', obj.firstName);
       this.headingOtherLanguage = res.returnObject[0].otherLang.replace('{firstName}', obj.firstNameOL);
       this.descBaseLanguage = res.returnObject[1].baseLang;
       this.descOtherLanguage = res.returnObject[1].otherLang;
       this.lblPasswordBaselang = res.returnObject[2].baseLang;
       this.lblPasswordOtherlang = res.returnObject[2].otherLang;
       this.btnBaselang = res.returnObject[3].baseLang;
       this.btnOtherlang = res.returnObject[3].otherLang;
        loading(false);
      }
      else if (res.returnStatus == 'Error'){
        loading(false)
      }
    },(err: HttpErrorResponse) => {
      console.log(err);
    })
  }


  UserInfofromOtp(keyCode){
    loading(true)
    this._userCreationService.getUserOtpVerified(keyCode, "Used").subscribe((res:any)=>{
      if(res.returnStatus == "Success"){
      this.userInfo = res.returnObject;
      this.showTranslatedLangSide = (this.userInfo && this.userInfo.regionCode == "MET")? true : false;
      this.getlabelsDescription(this.userInfo);
      this._sharedService.formProgress.next(30);
      console.log(this.userInfo);
    } 
    },(err: HttpErrorResponse) => {
      loading(false);
      console.log(err);
    })
  }
  passwordSubmit(data){
    loading(true);
    let obj={
      otpKey: this.userInfo.key,
      password: data.password
    }
    this._userCreationService.createPaasword(obj).subscribe((res:any)=>{
      if(res.returnStatus == "Success"){
        loading(false);
        localStorage.setItem('userInfo', JSON.stringify(res));
        this._toast.success('Account successfully created','');
        this._router.navigate(['/business-profile']);
      }
      else if (res.returnStatus == "Error"){
        loading(false);
      }
    },(err: HttpErrorResponse) => {
      loading(false);
      console.log(err);
    })
  }
}
