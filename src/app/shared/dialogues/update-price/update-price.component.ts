import { Component, OnInit } from '@angular/core';
import { NgbModal, ModalDismissReasons } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "app-update-price",
  templateUrl: "./update-price.component.html",
  styleUrls: ["./update-price.component.scss"]
})
export class UpdatePriceComponent implements OnInit {
  constructor(private _modalService: NgbModal) {}

  ngOnInit() {}

  open(content) {
    this._modalService.open(content, {
      windowClass: "update-price-modal upper-medium-modal-history",
      size: "sm",
      centered: true
    });
  }
}
