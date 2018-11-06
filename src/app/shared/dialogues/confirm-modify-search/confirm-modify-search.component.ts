import { Component, OnInit } from '@angular/core';
import { PlatformLocation } from '@angular/common';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
// import { DataService } from '../../../services/commonservice/data.service';
import { Router } from '@angular/router';



@Component({
  selector: 'app-confirm-modify-search',
  templateUrl: './confirm-modify-search.component.html',
  styleUrls: ['./confirm-modify-search.component.scss']
})
export class ConfirmModifySearchComponent implements OnInit {

  constructor(
    // private _dataService : DataService, 
    private _router : Router,
    private _activeModal: NgbActiveModal,
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
  onConfirmClick(event){
    event.stopPropagation();
    // this._dataService.modifySearch(true);
    this._router.navigate(['home']).then(() => {
      this.closeModal();
    })
  }
}
