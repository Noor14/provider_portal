import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../../../services/shared.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {

  public providerInfo;
  constructor(private _sharedService: SharedService) { }

  ngOnInit() {
    this._sharedService.dashboardDetail.subscribe((state: any) => {
      if (state) {
         this.providerInfo = state;
        console.log(this.providerInfo);
      }
    });
  }

}
