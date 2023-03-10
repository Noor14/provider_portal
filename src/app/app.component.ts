import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonService } from './services/common.service';
import { SharedService } from './services/shared.service';
import { ScrollbarComponent } from 'ngx-scrollbar';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { filter } from 'rxjs/operators';
import '../assets/scss/_loader.css';
import { HttpErrorResponse } from '@angular/common/http';
import { VERSION } from '../environments/version'
import { removeDuplicateCurrencies, compareValues } from './components/pages/user-desk/billing/billing.component';




@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  @ViewChild(ScrollbarComponent) scrollRef: ScrollbarComponent;
  public static version = VERSION;

  constructor(
    private _commonService: CommonService,
    private _sharedService: SharedService,
    private _router: Router,
  ) { }

  ngOnInit() {
    this._router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.scrollTop();
    });

    this._commonService.getCountry().subscribe((res: any) => {
      if (res && res.length) {
        res.map((obj) => {
          if (typeof (obj.desc) == "string") {
            obj.desc = JSON.parse(obj.desc);
          }
        })
        this._sharedService.countryList.next(res);
      }
    });

    this._commonService.getCities().subscribe((res: any) => {
      if (res && res.length) {
        res.map((obj) => {
          if (typeof (obj.desc) == "string") {
            obj.desc = JSON.parse(obj.desc);
          }
        })
        this._sharedService.cityList.next(res);
      }
    });
    this._commonService.getRegions().subscribe((res: any) => {
      if (res && res.length) {
        this._sharedService.regionList.next(res);
      }
    });
    this._commonService.getAllCurrency(100).subscribe((res: any) => {
      if (res && res.length) {
        let currencyList = res;
        currencyList = removeDuplicateCurrencies(currencyList)
        currencyList.sort(compareValues('title', "asc"));
        this._sharedService.currencyList.next(currencyList);
      }
    });

    this._commonService.getBrowserlocation().subscribe((state: any) => {
      if (state.status == "success") {
        this._sharedService.setMapLocation(state);
      }
    })



  }

  scrollTop() {
    if (this.scrollRef) {
      setTimeout(() => {
        this.scrollRef.scrollYTo(0, 20);
      }, 0)
    }
  }

  static clearStorage() {
    let currVersion = AppComponent.version.version;
    let oldVersion = localStorage.getItem('version');
    if (!oldVersion || oldVersion !== currVersion) {
      localStorage.clear();
      localStorage.setItem('version', AppComponent.version.version);
    }
  }
}

