import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { SharedService } from '../../../../../services/shared.service';

@Component({
  selector: 'app-directorinfo',
  templateUrl: './directorinfo.component.html',
  styleUrls: ['./directorinfo.component.scss'],
  encapsulation: ViewEncapsulation.None,
  
})
export class DirectorinfoComponent implements OnInit {
  
  constructor(private _sharedService :SharedService) {
    
   }

  ngOnInit() {
  }
  
 previousForm(){
    this._sharedService.formChange.next(true);
  }

}

