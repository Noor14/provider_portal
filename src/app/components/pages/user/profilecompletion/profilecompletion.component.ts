import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../../../services/shared.service';

@Component({
  selector: 'app-profilecompletion',
  templateUrl: './profilecompletion.component.html',
  styleUrls: ['./profilecompletion.component.scss']
})
export class ProfilecompletionComponent implements OnInit {

  constructor(private _sharedService: SharedService) { }

  ngOnInit() {
    this._sharedService.formProgress.next(50);
    
  }

}
