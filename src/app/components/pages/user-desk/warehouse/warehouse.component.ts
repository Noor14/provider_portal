import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { loading } from '../../../../constants/globalFunctions';
import { WarehouseService } from '../manage-rates/warehouse-list/warehouse.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-warehouse',
  templateUrl: './warehouse.component.html',
  styleUrls: ['./warehouse.component.scss']
})
export class WarehouseComponent implements OnInit {

  private userProfile:any
  public warehouseTypeFull: boolean = true;
  private paramSubscriber: any;

  constructor(
    private _router: ActivatedRoute,
    private _warehouseService: WarehouseService
    ) { }

  ngOnInit() {
    let userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo && userInfo.returnText) {
      this.userProfile = JSON.parse(userInfo.returnText);
    }
    this.paramSubscriber = this._router.params.subscribe(params => {
      let id = params['id'];
      // (+) converts string 'id' to a number
      if (id) {
        this.getWareHouseDetail(id);
      }
    });
  }

  getWareHouseDetail(providerId) {
    loading(true)
    const wId = 0;
    this._warehouseService.getWarehouseList(providerId, wId).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        loading(false);
        if (res.returnObject) {
          res.returnObject;
        }

      }
    }, (err: HttpErrorResponse) => {
      console.log(err);
      loading(false);
    })
  }


}
