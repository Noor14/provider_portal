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

  getlabelsDescription(obj){
    this._userService.getlabelsDescription('createpassword').subscribe((res:any)=>{
      if(res.returnStatus =='Success'){
        console.log(res.returnObject);
       this.headingBaseLanguage = res.returnObject[0].baseLang.replace('{firstName}', obj.firstName);
       this.headingOtherLanguage = res.returnObject[0].otherLang.replace('{firstName}', obj.firstName);
       this.descBaseLanguage = res.returnObject[1].baseLang;
       this.descOtherLanguage = res.returnObject[1].otherLang;
       this.lblPasswordBaselang = res.returnObject[2].baseLang;
       this.lblPasswordOtherlang = res.returnObject[2].otherLang;
       this.btnBaselang = res.returnObject[3].baseLang;
       this.btnOtherlang = res.returnObject[3].otherLang;
      
      }
    })
  }


  UserInfofromOtp(keyCode){
    this._userService.getUserOtpVerified(keyCode, "Used").subscribe((res:any)=>{
      if(res.returnStatus == "Success"){
      this.userInfo = res.returnObject;
      this.getlabelsDescription(this.userInfo);
      this._sharedService.formProgress.next(20);
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
