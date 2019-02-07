import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SeaFreightService } from '../../../components/pages/user-desk/manage-rates/sea-freight/sea-freight.service';

@Component({
  selector: 'app-rate-history',
  templateUrl: './rate-history.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./rate-history.component.scss']
})
export class RateHistoryComponent implements OnInit {
  @Input() getRecord: any;
  public userProfile:any;
  public recordList:any[]=[];
  constructor(
    private _activeModal: NgbActiveModal,
    private _seaFreightService: SeaFreightService
    ) { }

  ngOnInit() {
    let userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo && userInfo.returnText) {
      this.userProfile = JSON.parse(userInfo.returnText);
    }
    this.getHistory();
  }
  getHistory(){
    this._seaFreightService.getRecHistory(this.userProfile.LoginID, this.getRecord.type, this.getRecord.id).subscribe((res:any)=>{
      if(res.returnStatus=="Success"){
        console.log(res, this.recordList, 'noor')
      }
    })
  }
  closeModal() {
    this._activeModal.close(status);
    document.getElementsByTagName('html')[0].style.overflowY = 'auto';
  }
}
