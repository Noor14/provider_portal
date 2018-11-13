import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./side-bar.component.scss']
})
export class SideBarComponent implements OnInit {

  constructor(private _router: Router) { }

  ngOnInit() {
  }
  getClass(path) {
    return (location.pathname === path) ? 'active' : '';
  };
  tonavigate(url) {
    this._router.navigate([url]);
  }
}
