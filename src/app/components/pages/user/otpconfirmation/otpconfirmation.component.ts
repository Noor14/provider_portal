import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';

@Component({
  selector: 'app-otpconfirmation',
  templateUrl: './otpconfirmation.component.html',
  styleUrls: ['./otpconfirmation.component.scss']
})
export class OtpconfirmationComponent implements OnInit {

  public resendTimer: number = 1;

  constructor(private _userService: UserService) { }

  ngOnInit() {
  }
  resendOtp(){
    var obj;
    this._userService.resendOtpCode(obj).subscribe((res:any)=>{
      console.log(res);
    })
  }
  submitOtp(){
    let obj= {
      otpid: 0,
      key: "c22b1d7a-c39f-404c-9080-39a281ea563f",
      otpCode: "100232",
      userID: 1001,  
      createdBy: "1001"
    };
    this._userService.sendOtpCode(obj).subscribe((res:any)=>{
      console.log(res);
    })
  }
}
