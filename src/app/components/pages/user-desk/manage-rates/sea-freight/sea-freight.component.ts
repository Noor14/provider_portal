import { Component, OnInit } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { DiscardDraftComponent } from '../../../../../shared/dialogues/discard-draft/discard-draft.component';

@Component({
  selector: 'app-sea-freight',
  templateUrl: './sea-freight.component.html',
  styleUrls: ['./sea-freight.component.scss']
})
export class SeaFreightComponent implements OnInit {

  
  constructor(
    private modalService: NgbModal
  ) { }

  ngOnInit() {
    var votes = [
      { title: 'Apple', votes: 1 },
      { title: 'Milk', votes: 2 },
      { title: 'Carrot', votes: 3 },
      { title: 'Banana', votes: 2 }
    ];
    votes.sort(this.multi);
   
  }
  
  multi(vote1, vote2) {
    console.log(vote1);
    console.log(vote2);
    return false;
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
