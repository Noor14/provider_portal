import { Component, OnInit } from '@angular/core';
import { PlatformLocation } from '@angular/common';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
@Component({
  selector: 'app-discard-draft',
  templateUrl: './discard-draft.component.html',
  styleUrls: ['./discard-draft.component.scss']
})
export class DiscardDraftComponent implements OnInit {

  constructor(
    private location: PlatformLocation,
    private _activeModal: NgbActiveModal,
  ) {location.onPopState(() => this.closeModal());}

  ngOnInit() {
  }
  closeModal() {
    this._activeModal.close();
    document.getElementsByTagName('html')[0].style.overflowY = 'auto';

  }
}
