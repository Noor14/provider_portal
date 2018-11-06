import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
// import { HashStorage, Tea } from '../../../constants/globalfunctions';
// import { DataService } from '../../../services/commonservice/data.service';
// import { AuthService } from '../../../services/authservice/auth.service';
import { PlatformLocation } from '@angular/common';

@Component({
  selector: 'app-confirm-logout-dialog',
  templateUrl: './confirm-logout-dialog.component.html',
  styleUrls: ['./confirm-logout-dialog.component.scss']
})
export class ConfirmLogoutDialogComponent implements OnInit {

  isRouting: boolean = false

  constructor(
    private _router: Router,
    private _activeModal: NgbActiveModal,
    // private _dataService: DataService,
    // private _authService: AuthService,
    private location: PlatformLocation
  ) {
    location.onPopState(() => this.closeModal());
  }

  ngOnInit() {
    this.isRouting = false
  }

  closeModal() {
    this._activeModal.close();
    document.getElementsByTagName('html')[0].style.overflowY = 'auto';

  }

  onConfirmClick() {
    // let loginData = JSON.parse(Tea.getItem('loginUser'))
    // loginData.IsLogedOut = true
    // HashStorage.removeItem('loginUser')
    // Tea.setItem('loginUser', JSON.stringify(loginData))
    
    // let data = {
    //   PrimaryEmail: loginData.PrimaryEmail,
    //   UserLoginID: loginData.UserLoginID,
    //   LogoutDate: new Date().toLocaleString(),
    //   LogoutRemarks: ""
    // }
    // this._dataService.reloadCurrencyConfig.next(true)
    
    // console.log(data);
    // this._authService.userLogOut(data).subscribe(res => {
    //   console.log('logout response : ', res);
    // })

    // this.isRouting = true
    // this._router.navigate(['home']).then(() => {
    //   this._dataService.reloadHeader.next(true)
    //   this.closeModal()
    //   document.getElementById('preloader2').classList.add('logout');
    //   this.isRouting = false
    // })
  }


}
