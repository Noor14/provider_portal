import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UpdatePasswordComponent } from '../../../shared/dialogues/update-password/update-password.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit, AfterViewInit{

  constructor(
    private _activatedRoute: ActivatedRoute,
    private modalService: NgbModal,
    private ChangeDetector: ChangeDetectorRef
  ) { }

  ngOnInit() {
  }
  ngAfterViewInit() {
    if (this._activatedRoute.snapshot.queryParams.code) {
      setTimeout(() => this.updatePasswordModal());
      this.ChangeDetector.detectChanges();
    }
  }
  updatePasswordModal() {
    this.modalService.open(UpdatePasswordComponent, {
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
}
