import { Component, OnInit } from '@angular/core';
import { LoginDialogComponent } from '../dialogues/login-dialog/login-dialog.component';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmLogoutDialogComponent } from '../dialogues/confirm-logout-dialog/confirm-logout-dialog.component';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  
  constructor(
    private modalService: NgbModal,
  ) { }

  ngOnInit() {
  }
  login() {
    this.modalService.open(LoginDialogComponent, {
      size: 'lg',
      centered: true,
      windowClass: 'small-modal',
      backdrop: 'static',
      keyboard: false
    });

    setTimeout(() => {
      if (document.getElementsByTagName('body')[0].classList.contains('modal-open')) {
        document.getElementsByTagName('html')[0].style.overflowY = 'hidden';
      }
    }, 0);
  }
  logOut() {
    this.modalService.open(ConfirmLogoutDialogComponent, {
      size: 'sm',
      centered: true,
      windowClass: 'small-modal',
      backdrop: 'static',
      keyboard: false
    })
    setTimeout(() => {
      if (document.getElementsByTagName('body')[0].classList.contains('modal-open')) {
        document.getElementsByTagName('html')[0].style.overflowY = 'hidden';
      }
    }, 0);
  }
}
