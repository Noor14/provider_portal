import { Component, OnInit } from '@angular/core';
import { PlatformLocation } from '@angular/common';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
@Component({
  selector: 'app-sea-rate-dialog',
  templateUrl: './sea-rate-dialog.component.html',
  styleUrls: ['./sea-rate-dialog.component.scss']
})
export class SeaRateDialogComponent implements OnInit {

  constructor(
    private location: PlatformLocation,
    private _activeModal: NgbActiveModal
  ) { location.onPopState(() => this.closeModal(null)); }

  ngOnInit() {
  }
  closeModal(status) {
    this._activeModal.close(status);
    document.getElementsByTagName('html')[0].style.overflowY = 'auto';

  }
}
