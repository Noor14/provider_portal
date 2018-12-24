import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { DiscardDraftComponent } from '../../../../../shared/dialogues/discard-draft/discard-draft.component';
import { Subject } from 'rxjs';
import 'rxjs/add/operator/map';
import { SeaFreightService } from './sea-freight.service';
@Component({
  selector: 'app-sea-freight',
  templateUrl: './sea-freight.component.html',
  styleUrls: ['./sea-freight.component.scss']
})
export class SeaFreightComponent implements OnInit, OnDestroy {

  public dtOptions: DataTables.Settings = {};
  public dtTrigger: Subject<any> = new Subject();
  public allRatesList: any;
  public loading:boolean;

  constructor(
    private modalService: NgbModal,
    private _seaFreightService: SeaFreightService
  ) { 
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      scrollX: true,
      searching: false,
      lengthChange: false,
      columnDefs: [
        {
          targets: 0,
          width: 'auto'
        }, {
          targets: "_all",
          width: "150"
        }
      ],

    };
  }

  ngOnInit() {
    this.getAllPublishRates();

  }
  getAllPublishRates() {
    this.loading = true;
    this._seaFreightService.getAllrates().subscribe(res => {
      this.allRatesList = res;
      this.dtTrigger.next();
      this.loading = false;

    });
  }
  ngOnDestroy(): void {
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
