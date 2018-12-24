import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { DiscardDraftComponent } from '../../../../../shared/dialogues/discard-draft/discard-draft.component';
import { Subject } from 'rxjs';
import 'rxjs/add/operator/map';
import { SeaFreightService } from './sea-freight.service';
import * as data from './data.json';
@Component({
  selector: 'app-sea-freight',
  templateUrl: './sea-freight.component.html',
  styleUrls: ['./sea-freight.component.scss']
})
export class SeaFreightComponent implements OnInit, OnDestroy {

  public dtOptions: DataTables.Settings = {};
  public dtTrigger: Subject<any> = new Subject();
  public allRatesList;
  constructor(
    private modalService: NgbModal,
    private _seaFreightService: SeaFreightService
  ) { }

  ngOnInit() {
    var votes = [
      { title: 'Apple', votes: 1 },
      { title: 'Milk', votes: 2 },
      { title: 'Carrot', votes: 3 },
      { title: 'Banana', votes: 2 }
    ];

    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      responsive: true,
      scrollX: true,
      // columns: [
      //   // { "width": "40%" },
      //   // { "width": "200px" }
      // ]  
    };

  
    this._seaFreightService.getAllrates().subscribe(res => {
      this.allRatesList = res;
      console.log(this.allRatesList)
        // Calling the DT trigger to manually render the table
        this.dtTrigger.next();
      });

  }
  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }
  discardDraft() {
    this.modalService.open(DiscardDraftComponent, {
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
