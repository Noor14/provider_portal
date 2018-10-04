import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../../../services/shared.service';


@Component({
  selector: 'app-userbusiness',
  templateUrl: './userbusiness.component.html',
  styleUrls: ['./userbusiness.component.scss']
})
export class UserbusinessComponent implements OnInit {

  constructor(private _sharedService: SharedService) { }
  isLeftVisible = true;

  ngOnInit() {
      this._sharedService.formChanger.subscribe((state: boolean) => {
        console.log(this.isLeftVisible, state)
      this.isLeftVisible = state;
    });

  }

}
