import { Component, OnInit } from '@angular/core';
import { loading } from '../../constants/globalFunctions';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonService } from '../../services/common.service';
import { SharedService } from '../../services/shared.service';

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.scss']
})
export class PagesComponent implements OnInit {
  public ports: any = [];
  constructor(
    private _commonService: CommonService,
    private _sharedService: SharedService
  ) { }

  ngOnInit() {
    // this.getPortsData()
    this.getCurrenciesList()
  }

  // getPortsData() {
  //   this._commonService.getPortsData().subscribe((res: any) => {
  //     localStorage.setItem("PortDetails", JSON.stringify(res));
  //   }, (err: HttpErrorResponse) => {
  //     loading(false)
  //   })
  // }

  getCurrenciesList() {
    this._commonService.getCurrency().subscribe((res: any) => {
      this._sharedService.setCurrency(res);
    }, (err: HttpErrorResponse) => {
      loading(false)
    })
  }
  ngAfterViewInit() {
    loading(false);
  }
}
