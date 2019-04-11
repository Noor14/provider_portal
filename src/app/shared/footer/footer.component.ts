import { Component, OnInit } from '@angular/core';
import { CommonService } from "../../services/common.service";
import { FooterDetails } from "../../interfaces/bookingDetails";
import { json } from 'd3';

@Component({
  selector: "app-footer",
  templateUrl: "./footer.component.html",
  styleUrls: ["./footer.component.scss"]
})
export class FooterComponent implements OnInit {

  public _footerDetail: FooterDetails;
  
  constructor(
    private _commonServices: CommonService
  ) {}

  ngOnInit() {
    this.getFooterDetails();
  }

  getFooterDetails(){
    this._commonServices.getHelpSupport(true).subscribe((res: any) => {
       this._footerDetail = JSON.parse(res.returnText);
    });
  }
}
