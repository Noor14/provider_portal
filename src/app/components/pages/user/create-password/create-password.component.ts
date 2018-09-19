import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from '../../../../services/shared.service';


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

  constructor(
    private _userService: UserService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _toast: ToastrService,
    private _sharedService: SharedService
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

  UserInfofromOtp(keyCode){
    this._userService.getUserOtpVerified(keyCode, "Used").subscribe((res:any)=>{
      if(res.returnStatus == "Success"){
      this.userInfo = res.returnObject;
      this._sharedService.formProgress.next(10)
      
      console.log(this.userInfo);
    } 
    })
  }
  passwordSubmit(data){
    let obj={
      otpKey: this.userInfo.key,
      password: data.password
    }
    this._userService.createPaasword(obj).subscribe((res:any)=>{
      if(res.returnStatus == "Success"){
        this._toast.success('Account successfully created','');
        this._router.navigate(['/business-profile']);
      }
    })
  }
}
