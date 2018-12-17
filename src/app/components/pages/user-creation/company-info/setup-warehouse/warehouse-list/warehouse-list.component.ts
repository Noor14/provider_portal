import { Component, OnInit } from '@angular/core';
import { WarehouseService } from '../warehouse.service';
import { loading } from '../../../../../../constants/globalFunctions';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-warehouse-list',
  templateUrl: './warehouse-list.component.html',
  styleUrls: ['./warehouse-list.component.scss']
})
export class WarehouseListComponent implements OnInit {

  public userProfile; 
  public allWareHouseList: any[]=[];
  constructor(
    private warehouseService: WarehouseService,
    private _router: Router,
    
  ) { }

  ngOnInit() {
    let userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo && userInfo.returnText) {
      this.userProfile = JSON.parse(userInfo.returnText);
      this.getWhlist(this.userProfile.ProviderID);
    }
  }

  getWhlist(providerId){
    loading(true)
    this.warehouseService.getWarehouseList(providerId).subscribe((res:any)=>{
      if (res.returnStatus == "Success") {
        this.allWareHouseList = res.returnObject;
        loading(false);
      }
    }, (err: HttpErrorResponse) => {
      console.log(err);
      loading(false);

    })
  }

  createWarehouse(){
    localStorage.removeItem('warehouseId');
    this._router.navigate(['setup-warehouse'])
  }

}
