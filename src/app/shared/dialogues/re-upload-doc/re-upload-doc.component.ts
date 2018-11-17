import { Component, OnInit } from '@angular/core';
import { PlatformLocation } from '@angular/common';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
@Component({
  selector: 'app-re-upload-doc',
  templateUrl: './re-upload-doc.component.html',
  styleUrls: ['./re-upload-doc.component.scss']
})
export class ReUploadDocComponent implements OnInit {

  constructor(
    private location: PlatformLocation,
    private _activeModal: NgbActiveModal
  ) { location.onPopState(() => this.closeModal()); }

  ngOnInit() {
  }
  closeModal() {
    this._activeModal.close();
    document.getElementsByTagName('html')[0].style.overflowY = 'auto';

  }
}
