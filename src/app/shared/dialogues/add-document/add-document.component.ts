import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-add-document',
  templateUrl: './add-document.component.html',
  styleUrls: ['./add-document.component.scss']
})
export class AddDocumentComponent implements OnInit {

  constructor(private modalService: NgbModal) {}


  ngOnInit() {
  }


  open(content) {
    this.modalService.open(content, { windowClass: 'dark-modal' });
  }

}
