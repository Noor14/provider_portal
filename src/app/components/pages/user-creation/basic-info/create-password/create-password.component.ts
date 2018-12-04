import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UserCreationService } from '../../user-creation.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from '../../../../../services/shared.service';
import { BasicInfoService } from '../basic-info.service';
import { loading } from '../../../../../constants/globalFunctions';
import { HttpErrorResponse } from '@angular/common/http';
import { JsonResponse } from '../../../../../interfaces/JsonResponse';
import * as moment from 'moment';

@Component({
  selector: 'app-create-password',
  templateUrl: './create-password.component.html',
  styleUrls: ['./create-password.component.scss']
})
export class CreatePasswordComponent implements OnInit {


  public requiredFields: string = "This field is required";
  public paramSubscriber: any;
  public userInfo: any;
  public passwordError: boolean
  public passForm;
  public colorEye;


  public showTranslatedLangSide: boolean;
  public headingBaseLanguage: string;
  public headingOtherLanguage: string;
  public descBaseLanguage: string;
  public descOtherLanguage: string;
  public lblPasswordOtherlang: string;
  public lblPasswordBaselang: string;
  public lblEmailBaselang: string;
  public lblEmailOtherlang: string;
  public btnBaselang: string;
  public btnOtherlang: string;



  constructor(
    private _userCreationService: UserCreationService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _toast: ToastrService,
    private _sharedService: SharedService,
    private _basicInfoService: BasicInfoService,

  ) { }

  ngOnInit() {
    this._sharedService.IsloggedInShow.next(false);

    this.passForm = new FormGroup({
      password: new FormControl(null, [Validators.required, Validators.minLength(6), Validators.maxLength(30)]),
      email: new FormControl(null),
    });
    this.paramSubscriber = this._route.params.subscribe(params => {
      let keyCode = params.keys; // (+) converts string 'id' to a number
      if (keyCode) {
        this.UserInfofromOtp();
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
  passSpaceHandler(event) {
    if (event.keyCode == 32 || event.which == 32) {
      event.preventDefault();
      return false;
    }
  }

  validate() {
    if (this.passForm.controls.password.status == "INVALID" && this.passForm.controls.password.touched) {
      this.passwordError = true;
    }
  }

  getlabelsDescription(obj) {
    this._userCreationService.getlabelsDescription('createpassword').subscribe((res: any) => {
      if (res.returnStatus == 'Success') {
        // console.log(res.returnObject);
        this.headingBaseLanguage = res.returnObject[0].baseLang.replace('{firstName}', obj.firstName);
        this.headingOtherLanguage = res.returnObject[0].otherLang.replace('{firstName}', obj.firstNameOL);
        this.descBaseLanguage = res.returnObject[1].baseLang;
        this.descOtherLanguage = res.returnObject[1].otherLang;
        this.lblPasswordBaselang = res.returnObject[2].baseLang;
        this.lblPasswordOtherlang = res.returnObject[2].otherLang;
        this.btnBaselang = res.returnObject[3].baseLang;
        this.btnOtherlang = res.returnObject[3].otherLang;
        this.lblEmailBaselang = res.returnObject[5].baseLang;
        this.lblEmailOtherlang = res.returnObject[5].otherLang;
        loading(false);
      }
      else if (res.returnStatus == 'Error') {
        loading(false)
      }
    }, (err: HttpErrorResponse) => {
      console.log(err);
    })
  }


  UserInfofromOtp() {
    loading(true)
    this._sharedService.getUserOtpVerified.subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        this.userInfo = res.returnObject;
        this.passForm.controls['email'].setValue(this.userInfo.primaryEmail);
        this.showTranslatedLangSide = (this.userInfo && this.userInfo.regionCode == "MET") ? true : false;
        this.getlabelsDescription(this.userInfo);
        this._sharedService.formProgress.next(30);
        // console.log(this.userInfo);
      }
    }, (err: HttpErrorResponse) => {
      loading(false);
      console.log(err);
    })
  }
  passwordSubmit(data) {
    loading(true);
    let obj = {
      otpKey: this.userInfo.key,
      password: data.password
    }
    this._basicInfoService.createPaasword(obj).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        loading(false);
        if (localStorage) {
          if (res.returnObject) {
            this._userCreationService.saveJwtToken(res.returnObject.token)
            this._userCreationService.saveRefreshToken(res.returnObject.refreshToken)
          }
          let loginData = JSON.parse(res.returnText)
          loginData.IsLogedOut = false;
          localStorage.setItem('userInfo', JSON.stringify(res));
          this._sharedService.IsloggedIn.next(loginData.IsLogedOut);
          this._toast.success('Account successfully created', '');
          this._router.navigate(['business-profile']);
        } else {
          this._toast.warning("Please Enable Cookies to use this app", "Cookies Disabled")
          // this._router.navigate(['enable-cookies']);
          return;
        }
      }
      else if (res.returnStatus == "Error") {
        this._toast.success(res.returnText, '');
        loading(false);
      }
    }, (err: HttpErrorResponse) => {
      loading(false);
      console.log(err);
    })
  }

 

}
