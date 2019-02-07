import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-rate-history',
  templateUrl: './rate-history.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./rate-history.component.scss']
})
export class RateHistoryComponent implements OnInit {

  constructor(private _activeModal: NgbActiveModal,) { }

  ngOnInit() {
  }
  closeModal() {
    this._activeModal.close(status);
    document.getElementsByTagName('html')[0].style.overflowY = 'auto';
  }
}
