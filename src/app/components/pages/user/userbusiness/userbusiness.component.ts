import { Component, OnInit, Input } from '@angular/core';
import { SharedService } from '../../../../services/shared.service';

@Component({
  selector: 'app-userbusiness',
  templateUrl: './userbusiness.component.html',
  styleUrls: ['./userbusiness.component.scss']
})
export class UserbusinessComponent implements OnInit {

  @Input() formChange;
  isLeftVisible = true;
  constructor(private _sharedService: SharedService) { }

  ngOnInit() {
    this._sharedService.formChange.subscribe((state:any)=>{
      this.isLeftVisible = state;
    })
    // this.isLeftVisible = this.formChange;
  }

}
