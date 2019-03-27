// import { Component, OnInit } from '@angular/core';
import { Component, OnInit, Input } from '@angular/core';
import { statusCode } from '../../../../constants/globalFunctions';
import { Router } from '@angular/router';
import { baseExternalAssets } from '../../../../constants/base.url';

@Component({
  selector: 'app-mobile-nav',
  templateUrl: './mobile-nav.component.html',
  styleUrls: ['./mobile-nav.component.scss']
})
// export class MobileNavComponent implements OnInit {


//   public showHide = false;

//   constructor() {

//    }

//   ngOnInit() {
    
//   }



//   clicked(){
//     this.showHide = !this.showHide;  
//   }

// }


export class MobileNavComponent  implements OnInit {
  public baseExternalAssets: string = baseExternalAssets;
  public statusCode:any = statusCode;
  constructor(private _router: Router) { }
  @Input() booking: any
  ngOnInit() {
  }
}