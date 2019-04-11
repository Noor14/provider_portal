import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../../../services/common.service';

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss']
})
export class SupportComponent implements OnInit {
  public helpSupport: any;
  public HelpDataLoaded: boolean;
  constructor(private _commonService: CommonService) { }

  ngOnInit() {
    this._commonService.getHelpSupport(true).subscribe((res: any) => {
      if (res.returnId > 0) {
        this.helpSupport = JSON.parse(res.returnText);
        this.HelpDataLoaded = true;
      }
    })
  }

}
