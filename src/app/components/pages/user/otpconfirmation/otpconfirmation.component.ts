import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../user.service';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from '../../../../services/shared.service';

@Component({
  selector: 'app-otpconfirmation',
  templateUrl: './otpconfirmation.component.html',
  styleUrls: ['./otpconfirmation.component.scss']
})
export class OtpconfirmationComponent implements OnInit, OnDestroy {

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
        this.UserInfofromOtp(keyCode);
      }
    });
  }
  ngOnDestroy(){
    this.paramSubscriber.unsubscribe();
  }

  getlabelsDescription(obj){
    this._userService.getlabelsDescription('otp').subscribe((res:any)=>{
      if(res.returnStatus =='Success'){
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
    })
  }

  countDown(time){
  let minutes = time/60;
  let seconds = parseInt(Math.fround(time/60%1).toFixed(1).split('.').pop());
   if (time > 0 || seconds > 0) {
     let countTime = setInterval(() => {
       if (minutes == 0 && seconds == 0) {
         clearInterval(countTime);
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
 UserInfofromOtp(keyCode){
    this._userService.getUserInfoByOtp(keyCode).subscribe((res:any)=>{
      if(res.returnStatus == "Success"){
      this.userInfo = JSON.parse(res.returnObject);
      this.showTranslatedLangSide = (this.userInfo && this.userInfo.RegionCode == "MET")? true : false;
      this.getlabelsDescription(this.userInfo);
      if (this.userInfo.Timer > 0) this.countDown(this.userInfo.Timer);  
      this._sharedService.formProgress.next(10)
      console.log(this.userInfo);
    } 
    })
  }
  timerClass(){
    if(!this.remainingTime){
        return 'resendLink';
      }
  }

  resendOtp(){ 
    if(this.remainingTime) return;
    let obj= {
      key: this.userInfo.Key
    };
    this._userService.resendOtpCode(obj).subscribe((res:any)=>{
      if(res.returnStatus == "Success"){
        this.userInfo.OTPCode = res.returnObject.otpCode;
        this.userInfo.Timer = res.returnObject.timer;
        this._toast.success("Resend OTP Successfully", '');
        if(this.userInfo.Timer > 0) this.countDown(this.userInfo.Timer); 
      }
    })
  }
  submitOtp(){
    if(this.otpCode != this.userInfo.OTPCode){
      this._toast.error("OTP not matched", '');
      return;
    }
    let obj= {
      otpid: this.userInfo.OTPID,
      key: this.userInfo.Key,
      otpCode: this.otpCode,
    };
    this._userService.sendOtpCode(obj).subscribe((res:any)=>{
      if(res.returnStatus == "Success"){
        console.log(res);
        this._toast.success(res.returnText,'');
        let otpKey = JSON.parse(res.returnObject);
        if(otpKey)
        this._router.navigate(['/password', otpKey.Key])
        
      }
      else if(res.returnStatus == "Error"){
        console.log(res);
        this._toast.error(res.returnText,'');
      }
    })
  }


}
