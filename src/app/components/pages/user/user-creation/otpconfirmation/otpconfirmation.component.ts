import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../user.service';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from '../../../../../services/shared.service';
import { UserCreationService } from '../user-creation.service';
import { loading } from '../../../../../constants/globalFunctions';
import { HttpErrorResponse } from '@angular/common/http';


@Component({
  selector: 'app-otpconfirmation',
  templateUrl: './otpconfirmation.component.html',
  styleUrls: ['./otpconfirmation.component.scss']
})
export class OtpconfirmationComponent implements OnInit, OnDestroy {

  public countTime: any; 
  public remainingTime: string;
  public otpKey: string;
  public paramSubscriber: any;
  public userInfo: any;
  public otpCode:number;
  public otpForm;
  public showTranslatedLangSide: boolean;

  public headingBaseLanguage: string;
  public headingOtherLanguage: string;
  public descBaseLanguage: string;
  public descOtherLanguage: string;
  public lblOTPPasswordOtherlang: string;
  public lblOTPPasswordBaselang: string;
  public otpbtnBaselang: string;
  public otpbtnOtherlang: string;
  public otpResendBaselang: string;
  public otpResendOtherlang: string;


  constructor(
    private _userService: UserService, 
    private _userCreationService: UserCreationService,
    private _route: ActivatedRoute, 
    private _router: Router,
    private _toast: ToastrService,
    private _sharedService: SharedService
   ) { }

  ngOnInit() {

    this.otpForm = new FormGroup({
      otp: new FormControl(null, [Validators.required]),
    });

    this.paramSubscriber = this._route.params.subscribe(params => {
      let keyCode = params.keys; // (+) converts string 'id' to a number
      if (keyCode) {
        this.UserInfofromOtp();
      }
    });
  }
  ngOnDestroy(){
    this.paramSubscriber.unsubscribe();
  }

  getlabelsDescription(obj){
    this._userService.getlabelsDescription('otp').subscribe((res:any)=>{
      if(res.returnStatus =='Success'){
        loading(false);
       this.headingBaseLanguage = res.returnObject[0].baseLang.replace('{firstName}', obj.FirstName);
       this.headingOtherLanguage = res.returnObject[0].otherLang.replace('{firstName}', obj.FirstNameOL);
       this.descBaseLanguage = res.returnObject[1].baseLang.replace('{emailAddress}', obj.PrimaryEmail);
       this.descOtherLanguage = res.returnObject[1].otherLang.replace('{emailAddress}', obj.PrimaryEmail);
       this.lblOTPPasswordBaselang = res.returnObject[2].baseLang;
       this.lblOTPPasswordOtherlang = res.returnObject[2].otherLang;
       this.otpbtnBaselang = res.returnObject[3].baseLang;
       this.otpbtnOtherlang = res.returnObject[3].otherLang;
       this.otpResendBaselang = res.returnObject[4].baseLang;
       this.otpResendOtherlang = res.returnObject[4].otherLang;
      }
      else if(res.returnStatus == "Error"){
        loading(false);
      }
    },(err: HttpErrorResponse) => {
      loading(false);
      console.log(err);
    })
  }

  countDown(time){
  let minutes = parseInt((time/60).toFixed(0));
  let seconds = time - (minutes*60);
   if (time > 0 || seconds > 0) {
     this.countTime = setInterval(() => {
       if (minutes == 0 && seconds == 0) {
         clearInterval(this.countTime);
       }
       else if (seconds < 0) {
         minutes-- ;
         seconds = 59;
       }
      if (minutes > 0 || seconds != 0){
        this.remainingTime = minutes + " Minutes : " + seconds + " Seconds";
        seconds-- ;
      }
       else{
        this.remainingTime = undefined
       }
     }, 1000)
   }
  
 }


  passSpaceHandler(event){
    if (event.keyCode == 32) {
      event.preventDefault();
      return false;
    }
  }
 UserInfofromOtp(){
   loading(true)
    this._sharedService.getUserInfoByOtp.subscribe((res:any)=>{
      if(res.returnStatus == "Success"){
      this.userInfo = JSON.parse(res.returnObject);
      this.showTranslatedLangSide = (this.userInfo && this.userInfo.RegionCode == "MET")? true : false;
      this.getlabelsDescription(this.userInfo);
      if (this.userInfo.Timer > 0) this.countDown(this.userInfo.Timer);  
      this._sharedService.formProgress.next(20)
      console.log(this.userInfo);
    } 
    },(err: HttpErrorResponse) => {
      loading(false);
      console.log(err);
    })
  }
  // timerClass(){
  //   if(!this.remainingTime){
  //       return 'resendLink';
  //     }
  // }

  resendOtp(){ 
    loading(true);
    let obj= {
      LanguageID: this.userInfo.LanguageID,
      key: this.userInfo.Key,
      FirstName: this.userInfo.FirstName,
      FirstNameOL: this.userInfo.FirstNameOL,
      redirectUrl: window.location.protocol + "//" + window.location.host + "/otp"
    };
    
    this._userCreationService.resendOtpCode(obj).subscribe((res:any)=>{
      if(res.returnStatus == "Success"){
        loading(false);
        console.log(res.returnObject.otpCode);
        this.userInfo.OTPCode = res.returnObject.otpCode;
        this.userInfo.Timer = res.returnObject.timer;
        this._toast.success(res.returnText, '');
        if(this.userInfo.Timer > 0) {
          clearInterval(this.countTime);
          this.countDown(this.userInfo.Timer); 
        }
        else{
          clearInterval(this.countTime);
          this.remainingTime = undefined;
        }
      }
      else if (res.returnStatus == "Error") {
        loading(false);
      }
    }, (err: HttpErrorResponse) => {
      loading(false);
      console.log(err);
    })
  }
  submitOtp(){
    loading(true);
    let obj= {
      otpid: this.userInfo.OTPID,
      key: this.userInfo.Key,
      otpCode: this.otpCode,
    };
    this._userCreationService.sendOtpCode(obj).subscribe((res:any)=>{
      if(res.returnStatus == "Success"){
        loading(false);
        this._toast.success(res.returnText,'');
        let otpKey = JSON.parse(res.returnObject);
        if(otpKey)
        this._router.navigate(['/password', otpKey.Key])
        
      }
      else if(res.returnStatus == "Error"){
        loading(false);
        this._toast.error(res.returnText,'');
      }
    },(err: HttpErrorResponse) => {
      loading(false);
      console.log(err);
    })
  }


}
