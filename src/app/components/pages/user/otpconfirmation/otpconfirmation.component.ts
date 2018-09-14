import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../user.service';

@Component({
  selector: 'app-otpconfirmation',
  templateUrl: './otpconfirmation.component.html',
  styleUrls: ['./otpconfirmation.component.scss']
})
export class OtpconfirmationComponent implements OnInit {

  public resendTimer: number = 1;
  public otpKey: string;
  public paramSubscriber: any;
  public userInfo: any;
  public otpCode:number;
  public passwordForm:boolean;
  public userPassword:any;

  constructor(private _userService: UserService, private _route: ActivatedRoute, private _router: Router) { }

  ngOnInit() {
    this.paramSubscriber = this._route.params.subscribe(params => {
      let keyCode = params.keys; // (+) converts string 'id' to a number
      if (keyCode) {
        this.UserInfofromOtp(keyCode);
      }
    });
  }


 UserInfofromOtp(keyCode){
    this._userService.getUserInfoByOtp(keyCode).subscribe((res:any)=>{
      if(res.returnStatus == "Success")
      this.userInfo = JSON.parse(res.returnObject);
      console.log(this.userInfo)
    })
  }
  resendOtp(){                                                                                                 
    let obj= {
      key: this.userInfo.Key
    };
    this._userService.resendOtpCode(obj).subscribe((res:any)=>{
      console.log(res);
    })
  }
  submitOtp(){
    if(this.otpCode != this.userInfo.OTPCode){
      return alert("Otp not matched");
    }
    let obj= {
      otpid: this.userInfo.OTPID,
      key: this.userInfo.Key,
      otpCode: this.otpCode,
    };
    this._userService.sendOtpCode(obj).subscribe((res:any)=>{
      if(res.returnStatus == "Success"){
        this.passwordForm = true;
      }
    })
  }

  passwordSubmit(){
    let obj={
      otpKey: this.userInfo.Key,
      password: this.userPassword
    }
    if(!this.userPassword){
      return alert('insertPassword please')
    }
    this._userService.createPaasword(obj).subscribe((res:any)=>{
      if(res.returnStatus == "Success"){
        this.passwordForm = true;
        alert('Registered successfully')
        this._router.navigate(['/registration']);
      }
    })
  }
}
