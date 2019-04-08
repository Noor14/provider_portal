import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { PlatformLocation } from "@angular/common";
import { UserCreationService } from "../../../components/pages/user-creation/user-creation.service";
import { SharedService } from "../../../services/shared.service";
import { HttpErrorResponse } from "@angular/common/http";
import * as moment from "moment";
import { GuestService } from "../../../services/jwt.injectable";

// import { HashStorage, Tea } from '../../../constants/globalfunctions';
// import { DataService } from '../../../services/commonservice/data.service';
// import { AuthService } from '../../../services/authservice/auth.service';
@Component({
  selector: "app-confirm-logout-dialog",
  templateUrl: "./confirm-logout-dialog.component.html",
  styleUrls: ["./confirm-logout-dialog.component.scss"]
})
export class ConfirmLogoutDialogComponent implements OnInit {
  public loading: boolean = false;

  constructor(
    private _router: Router,
    private _activeModal: NgbActiveModal,
    private _sharedService: SharedService,
    private _userCreationService: UserCreationService,
    private location: PlatformLocation,
    public _jwtService: GuestService
  ) {
    location.onPopState(() => this.closeModal());
  }

  ngOnInit() {}

  closeModal() {
    this._activeModal.close();
    document.getElementsByTagName("html")[0].style.overflowY = "auto";
  }
  onConfirmClick() {
    this.loading = true;
    let userObj = JSON.parse(localStorage.getItem("userInfo"));
    let loginData = JSON.parse(userObj.returnText);
    loginData.IsLogedOut = true;
    userObj.returnText = JSON.stringify(loginData);
    localStorage.setItem("userInfo", JSON.stringify(userObj));
    let data = {
      PrimaryEmail: loginData.PrimaryEmail,
      UserLoginID: loginData.UserID,
      LogoutDate: moment(Date.now()).format(),
      LogoutRemarks: null
    };

    this._userCreationService.userLogOut(data).subscribe(
      (res: any) => {
        // if (res.returnStatus === "Success"){
        this.loading = false;
        this._sharedService.dashboardDetail.next(null);
        this.closeModal();
        this._sharedService.IsloggedIn.next(loginData.IsLogedOut);
        this._router.navigate(["registration"]);
        this._jwtService.sessionRefresh();
        // }
      },
      (err: HttpErrorResponse) => {
        console.log(err);
      }
    );
  }
}
