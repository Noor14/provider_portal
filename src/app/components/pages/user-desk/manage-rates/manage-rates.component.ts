import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SeaFreightService } from './sea-freight/sea-freight.service';
import { SharedService } from '../../../../services/shared.service';

@Component({
  selector: 'app-manage-rates',
  templateUrl: './manage-rates.component.html',
  styleUrls: ['./manage-rates.component.scss']
})
export class ManageRatesComponent implements OnInit {

  constructor(
    private _router: Router,
    private _seaFreightService: SeaFreightService,
    private _sharedService: SharedService
  ) { }

  ngOnInit() {
    this._seaFreightService.getAllrates().subscribe(res => {
      this._sharedService.publishRatesList.next(res);
    });
  }


  tonavigate(url) {
    this._router.navigate([url]);
  }
  getClass(path): string {
    if (location.pathname === path) {
      return 'active'
    }
  };
}
