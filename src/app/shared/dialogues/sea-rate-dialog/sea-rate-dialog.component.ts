import { Component, OnInit } from '@angular/core';
import { PlatformLocation } from '@angular/common';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { SharedService } from '../../../services/shared.service';
@Component({
  selector: 'app-sea-rate-dialog',
  templateUrl: './sea-rate-dialog.component.html',
  styleUrls: ['./sea-rate-dialog.component.scss']
})
export class SeaRateDialogComponent implements OnInit {
  public allShippingLines: any[] = [];
  public allCargoType: any[] = []
  public allContainersType: any[] = [];
  public allPorts: any[] = [];
  public allCurrencies: any[] = [];
  constructor(
    private location: PlatformLocation,
    private _activeModal: NgbActiveModal,
    private _sharedService: SharedService
  ) { location.onPopState(() => this.closeModal(null)); }

  ngOnInit() {
    this.allservicesBySea();
  }


  allservicesBySea() {
    this._sharedService.dataLogisticServiceBySea.subscribe(state => {
      if (state && state.length) {
        for (let index = 0; index < state.length; index++) {
          if (state[index].LogServName == "SEA") {
            this.allShippingLines = state[index].DropDownValues.ShippingLine;
            this.allCargoType = state[index].DropDownValues.Category;
            this.allContainersType = state[index].DropDownValues.ContainerFCL;
            this.allPorts = state[index].DropDownValues.Port;
            this.allCurrencies = state[index].DropDownValues.UserCurrency;
            // this.draftloading = true;
            console.log(this.allCargoType);
            
          }
        }
      }
    })
  }



  closeModal(status) {
    this._activeModal.close(status);
    document.getElementsByTagName('html')[0].style.overflowY = 'auto';

  }
}
