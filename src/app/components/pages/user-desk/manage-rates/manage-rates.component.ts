import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-manage-rates',
  templateUrl: './manage-rates.component.html',
  styleUrls: ['./manage-rates.component.scss']
})
export class ManageRatesComponent implements OnInit {

  constructor(private _router: Router) { }

  ngOnInit() {
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
