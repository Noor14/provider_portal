import { Component, OnInit } from '@angular/core';
import { WarehouseService } from '../warehouse.service';
import { loading } from '../../../../../../constants/globalFunctions';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Lightbox } from 'ngx-lightbox';
@Component({
  selector: 'app-warehouse-list',
  templateUrl: './warehouse-list.component.html',
  styleUrls: ['./warehouse-list.component.scss']
})
export class WarehouseListComponent implements OnInit {

  public userProfile; 
  public allWareHouseList: any[]=[];
  private _albums: any = [];
  constructor(
    private warehouseService: WarehouseService,
    private _router: Router,
    private _lightbox: Lightbox
  ) {
    // for (let i = 1; i <= 4; i++) {
    //   const src = 'http://10.20.1.13:9091/documents/booking/nov2018/png/DOC_839_201811201049258205.png';
    //   const caption = 'Image ' + i + ' caption here';
    //   const thumb = 'demo/img/image' + i + '-thumb.jpg';
    //   const album = {
    //     src: src,
    //     caption: caption,
    //     thumb: thumb
    //   };

    //   this._albums.push(album);
    // }
   }

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
  openLightBox(index: number): void {
    // open lightbox
    this._lightbox.open(this._albums, index);
  }

  closeLightBox(): void {
    // close lightbox programmatically
    this._lightbox.close();
  }
  createWarehouse(){
    localStorage.removeItem('warehouseId');
    let userInfo = JSON.parse(localStorage.getItem('userInfo'));
    let userData = JSON.parse(userInfo.returnText);
    userData.UserProfileStatus = "Warehouse Category Pending";
    userInfo.returnText = JSON.stringify(userData);
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
    this._router.navigate(['setup-warehouse'])
  }

  goToDashboard(){
    let userInfo = JSON.parse(localStorage.getItem('userInfo'));
    let userData = JSON.parse(userInfo.returnText);
    userData.UserProfileStatus = "Dashboard";
    userInfo.returnText = JSON.stringify(userData);
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
    this._router.navigate(['provider/dashboard'])
  }

}
