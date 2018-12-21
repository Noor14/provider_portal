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
  getClass(path): string {
     if(location.pathname === path){
       return 'active'
    }
  };
  tonavigate(url) {
    this._router.navigate([url]);
  }
}
