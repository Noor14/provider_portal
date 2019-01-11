import { Component, OnInit } from '@angular/core';
import { SupportService } from './support.service';

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss']
})
export class SupportComponent implements OnInit {
  public helpSupport: any;
  public HelpDataLoaded: boolean;
  constructor(private _supportService: SupportService) { }

  ngOnInit() {
    this._supportService.getHelpSupport().subscribe((res: any) => {
      if (res.returnId > 0) {
        this.helpSupport = JSON.parse(res.returnText);
        this.HelpDataLoaded = true;
      }
    })
  }

}
