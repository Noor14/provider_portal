import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Location, PlatformLocation } from '@angular/common';
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, FormGroup, Validators} from '@angular/forms';
import { LoginDialogComponent } from '../login-dialog/login-dialog.component';
import { ToastrService } from 'ngx-toastr';
// import { AuthService } from './../../../services/authservice/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, ActivatedRoute} from '@angular/router';
import { UserService } from '../../../components/pages/user/user.service';

@Component({
  selector: 'app-update-password',
  templateUrl: './update-password.component.html',
  styleUrls: ['./update-password.component.scss'],
  encapsulation: ViewEncapsulation.None,  
})
export class UpdatePasswordComponent implements OnInit {
  
  public colorEye;
  public passwordError;
  closeResult: string;
  currentJustify = 'justified';
  updatePassForm;


  constructor(
    private _userService: UserService,
    private activeModal: NgbActiveModal, 
    private modalService: NgbModal,
    private _toast: ToastrService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private _location:Location,
    private _browseNavigate: PlatformLocation
  ) {
    _browseNavigate.onPopState(() => this.closeModal());
  }

  ngOnInit() {
    this.updatePassForm = new FormGroup({
      updatePassword: new FormControl(null, {validators:[Validators.required, Validators.minLength(6), Validators.maxLength(30)]})
    });
  }

  errorMessages(){
    if(this.updatePassForm.controls.updatePassword.status == "INVALID" && this.updatePassForm.controls.updatePassword.touched){
      this.passwordError = true;
    }
  }
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  confirmPassword(event) {
    let element = event.currentTarget.nextSibling.nextElementSibling;
    if(element.type === "password" && element.value){
       element.type = "text"; 
       this.colorEye= "grey"; 
      } 
       else{
         element.type = "password";
       this.colorEye= "black"; 
         
      };
  }

  closeModal() {
    this._location.replaceState('home');
    this.activeModal.close();
    document.getElementsByTagName('html')[0].style.overflowY = 'auto';
  }

  loginModal() {
    this.activeModal.close();    
    this.modalService.open(LoginDialogComponent, {  
    size: 'lg', 
    centered: true, 
    windowClass: 'small-modal',
    backdrop: 'static',
    keyboard : false });
    setTimeout(() => {
      if(document.getElementsByTagName('body')[0].classList.contains('modal-open')){
        document.getElementsByTagName('html')[0].style.overflowY = 'hidden';
      }
    }, 0);
  }



  updatePassword(obj){
    if (this.updatePassForm.invalid) {
      this.errorMessages();
      return;
    }
    let object={
      Code: this.activatedRoute.snapshot.queryParams.code,
      Password: obj.updatePassword
    };
    this._userService.userupdatepassword(object).subscribe((res: any) => {
      if (res.returnStatus == "Error") {
        this._toast.error(res.returnText);
      }
      else if (res.returnStatus == "Success") {
        this._toast.success("Password updated successfully.");
        this.updatePassForm.reset();
        this.loginModal(); 
        this._location.replaceState('registration');
      }
    }, (err: HttpErrorResponse) => {
      console.log(err)
    })
  }


}
