import { Component, OnInit } from '@angular/core';
import { PlatformLocation } from '@angular/common';
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { FormGroup, FormControl, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { JsonResponse } from '../../../interfaces/JsonResponse'
// import { EMAIL_REGEX, ValidateEmail, HashStorage, Tea, CurrencyControl, getDefaultCountryCode } from '../../../constants/globalfunctions';
import { EMAIL_REGEX, ValidateEmail, patternValidator, isJSON } from '../../../constants/globalFunctions';

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
// import { DataService } from '../../../services/commonservice/data.service';
import * as moment from 'moment';
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component';
import { UserCreationService } from '../../../components/pages/user-creation/user-creation.service';
import { SharedService } from '../../../services/shared.service';
import { baseExternalAssets } from '../../../constants/base.url';


@Component({
  selector: 'app-login-dialog',
  templateUrl: './login-dialog.component.html',
  styleUrls: ['./login-dialog.component.scss']
})
export class LoginDialogComponent implements OnInit {
  public savedUser: boolean;
  public saveUserData: any
  public userAvatar: string
  public userName: string = undefined;
  public countryCode: string;
  public loading:boolean;
  public colorEye;
  public placeholder: string = "Your unique password";
  public emailError
  public passError
  public loginForm: FormGroup;
  
  constructor(
    private _http: HttpClient,
    private activeModal: NgbActiveModal,
    private modalService: NgbModal,
    private _userCreationService: UserCreationService,
    private toastr: ToastrService,
    private _router: Router,
    // private _dataService: DataService,
    private location: PlatformLocation,
    private _sharedService: SharedService
  ) {
    location.onPopState(() => this.closeModal());
  }

  ngOnInit() {
    if (localStorage) {
      if (localStorage.getItem('userInfo') && Object.keys('userInfo').length) {
        let userObj = JSON.parse(localStorage.getItem('userInfo'));
        this.saveUserData = JSON.parse(userObj.returnText)
        this.savedUser = true;
        if (this.saveUserData.ProviderImage && this.saveUserData.ProviderImage !="[]"  && isJSON(this.saveUserData.ProviderImage)){
          this.userAvatar = baseExternalAssets + JSON.parse(this.saveUserData.ProviderImage)[0].DocumentFile;
        }
        this.placeholder = "Enter your unique password";
        this.userName = this.saveUserData.FirstNameBL + ' ' + this.saveUserData.LastNameBL
      }
    }
    this.createForm()
  }

  private createForm() {
    this.loginForm = new FormGroup({
      loginUserID: new FormControl(null, [Validators.required, Validators.pattern(EMAIL_REGEX), Validators.maxLength(320)]),
      password: new FormControl(null, [Validators.required]),
    });

    if (this.savedUser) {
      this.loginForm.controls['loginUserID'].setValue(this.saveUserData.PrimaryEmail)
    }
  }



  forgetPassword() {
    this.activeModal.close()
    document.getElementsByTagName('html')[0].style.overflowY = 'auto';
    this.modalService.open(ForgotPasswordComponent, {
      size: 'lg',
      centered: true,
      windowClass: 'small-modal',
      backdrop: 'static',
      keyboard: false
    });
    setTimeout(() => {
      if (document.getElementsByTagName('body')[0].classList.contains('modal-open')) {
        document.getElementsByTagName('html')[0].style.overflowY = 'hidden';
      }
    }, 0);
  }
  closeModal() {
    this.activeModal.close();
    document.getElementsByTagName('html')[0].style.overflowY = 'auto';
  }


  loginUser(data) {
    let valid: boolean = ValidateEmail(data.loginUserID)
    if (!valid) {
      this.toastr.error('Invalid email entered.', 'Error');
      return
    }
    const loc: any = this._sharedService.getMapLocation();
    this.loading = true;
    let toSend = {
      password: data.password,
      loginUserID: data.loginUserID,
      CountryCode: (loc)? loc.countryCode : 'DEFAULT AE',
      LoginIpAddress: "0.0.0.0",
      LoginDate: moment(Date.now()).format(),
      LoginRemarks: ""
    }
    this._userCreationService.userLogin(toSend).subscribe((response: JsonResponse) => {
      let resp = response
      if (resp.returnStatus == "Success" && resp.returnId > 0) {
        this.loading = false;
        if (localStorage) {
          localStorage.setItem('userInfo', JSON.stringify(resp));
          if (resp.returnObject) {
            this._userCreationService.saveJwtToken(resp.returnObject.token)
            this._userCreationService.saveRefreshToken(resp.returnObject.refreshToken)
          }
          let loginData = JSON.parse(resp.returnText)
          loginData.IsLogedOut = false;
          if (loginData.WHID){
          localStorage.setItem('warehouseId', loginData.WHID);
         }
          this.toastr.success('Login Successful!', 'Success');
          this.activeModal.close();
          document.getElementsByTagName('html')[0].style.overflowY = 'auto';
          this._sharedService.IsloggedIn.next(loginData.IsLogedOut);
          this._router.navigate(['provider/dashboard']);
        } else {
          this.toastr.warning("Please Enable Cookies to use this app", "Cookies Disabled")
          // this._router.navigate(['enable-cookies']);
          this.activeModal.close();
          document.getElementsByTagName('html')[0].style.overflowY = 'auto';
          return;
        }


      } else {
        this.loading = false;
        this.toastr.error('Invalid email or password.', 'Failed')

      }
    }, (err: HttpErrorResponse) => {
      console.log(err);
      this.loading = false;
      this.toastr.error('Invalid email or password.', 'Failed')
    })

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



  notMyAccount() {
    this.loginForm.reset();
    this.savedUser = !this.savedUser;
    this.placeholder = "Your unique password";

  }


}

