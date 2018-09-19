import { Component, OnInit } from '@angular/core';
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
export class OtpconfirmationComponent implements OnInit {

  public timer: any;
  public otpKey: string;
  public paramSubscriber: any;
  public userInfo: any;
  public otpCode:number;
  public otpForm;

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
      this._sharedService.formProgress.next(10)
      console.log(this.userInfo);
    } 
    })
  }
  resendOtp(){                                                                                                 
    let obj= {
      key: this.userInfo.Key
    };
    this._userService.resendOtpCode(obj).subscribe((res:any)=>{
      if(res.returnStatus == "Success"){
        this.userInfo.OTPCode = res.returnObject.otpCode;
        console.log(res);
      }
    })
  }
  submitOtp(){
    if(this.otpCode != this.userInfo.OTPCode){
      this._toast.error("Otp not matched", '');
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
    })
  }


}
