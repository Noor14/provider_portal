import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { PlatformLocation } from '@angular/common';
import { UserService } from '../../../components/pages/user/user.service';
import { SharedService } from '../../../services/shared.service';

// import { HashStorage, Tea } from '../../../constants/globalfunctions';
// import { DataService } from '../../../services/commonservice/data.service';
// import { AuthService } from '../../../services/authservice/auth.service';

@Component({
  selector: 'app-confirm-logout-dialog',
  templateUrl: './confirm-logout-dialog.component.html',
  styleUrls: ['./confirm-logout-dialog.component.scss']
})
export class ConfirmLogoutDialogComponent implements OnInit {

  public loading: boolean = false;

  constructor(
    private _router: Router,
    private _activeModal: NgbActiveModal,
    private _sharedService: SharedService,
    private _userService: UserService,
    private location: PlatformLocation
  ) {
    location.onPopState(() => this.closeModal());
  }

  ngOnInit() {
    
  }

  closeModal() {
    this._activeModal.close();
    document.getElementsByTagName('html')[0].style.overflowY = 'auto';

  }

  onConfirmClick() {
    
    this.loading = true
    let userObj = JSON.parse(localStorage.getItem('userInfo'));
    let loginData = JSON.parse(userObj.returnText);
    loginData.IsLogedOut = true;
    userObj.returnText = JSON.stringify(loginData);
    localStorage.setItem('userInfo', JSON.stringify(userObj));
    let data = {
      PrimaryEmail: loginData.PrimaryEmail,
      UserLoginID: loginData.UserID,
      LogoutDate: new Date().toLocaleString(),
      LogoutRemarks: null
    }
    
    this._userService.userLogOut(data).subscribe(res => {
    })

    this._router.navigate(['registration']).then(() => {
      this._sharedService.IsloggedIn.next(loginData.IsLogedOut);
      this.closeModal();
      this.loading = false;
    })
  }


}
