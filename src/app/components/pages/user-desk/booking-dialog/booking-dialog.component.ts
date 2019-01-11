import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-booking-dialog',
  templateUrl: './booking-dialog.component.html',
  styleUrls: ['./booking-dialog.component.scss']
})
export class BookingDialogComponent implements OnInit {
  
  closeResult: string;

  constructor(private modalService: NgbModal) { }

  ngOnInit() {
  }

  openLg(content) {

    this.modalService.open(content,{ 
        size: 'sm', 
        windowClass: 'dark-modal' 
      }
    );
  } 

}
