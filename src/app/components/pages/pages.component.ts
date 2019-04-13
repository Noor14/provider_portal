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

  public isCookeStored =  true;

  constructor(
    private _commonService: CommonService,
    private _sharedService: SharedService
  ) { }

  ngOnInit() {
    this.getCookie();
    // this.getPortsData()
    // this.getCurrenciesList()
  }

  getCookie() {
    setTimeout(function () {
      const cookieInner = document.querySelector(".cookie-law-info-bar");
      const cookieMain = document.querySelector("app-cookie-bar");
      if (localStorage.getItem('cookiesPopup')) {
        this.isCookeStored = false;
        cookieMain.classList.add("hidePopup");
        cookieInner.classList.add("hidePopup");
      } else {
        console.log('cookies not generat')
      }
    }, 0.5)
  }

  getCurrenciesList() {
    this._commonService.getCurrencyNew().subscribe((res: any) => {
      this._sharedService.setCurrency(res);
    }, (err: HttpErrorResponse) => {
      loading(false)
    })
  }
  
  ngAfterViewInit() {
    loading(false);
  }
}
