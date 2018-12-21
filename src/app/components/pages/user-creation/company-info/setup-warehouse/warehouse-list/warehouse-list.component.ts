import { Component, OnInit } from '@angular/core';
import { WarehouseService } from '../warehouse.service';
import { loading } from '../../../../../../constants/globalFunctions';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Lightbox } from 'ngx-lightbox';
import { baseExternalAssets } from '../../../../../../constants/base.url';
import { PlatformLocation } from '@angular/common';
@Component({
  selector: 'app-warehouse-list',
  templateUrl: './warehouse-list.component.html',
  styleUrls: ['./warehouse-list.component.scss']
})
export class WarehouseListComponent implements OnInit {

  public userProfile;
  public allWareHouseList: any[] = [];
  private _albums: any = [];
  constructor(
    private warehouseService: WarehouseService,
    private _router: Router,
    private _lightbox: Lightbox,
    private location: PlatformLocation,
  ) {
    location.onPopState(() => this.closeLightBox());
  }

  ngOnInit() {
    let userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo && userInfo.returnText) {
      this.userProfile = JSON.parse(userInfo.returnText);
      this.getWhlist(this.userProfile.ProviderID);
    }
  }

  getWhlist(providerId) {
    loading(true)
    this.warehouseService.getWarehouseList(providerId).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        this.allWareHouseList = res.returnObject;
        this.allWareHouseList.forEach((obj, index) => {
          const albumArr = []
          obj.UploadedGalleries.forEach((elem, ind) => {
            const album = {
              src: baseExternalAssets + '/' + elem.DocumentFile,
              caption: elem.DocumentFileName,
              thumb: baseExternalAssets + '/' + elem.DocumentFile,
              DocumentUploadedFileType: elem.DocumentUploadedFileType
            };
            albumArr.push(album);
            obj.parsedGallery = albumArr;
          })

        })
        loading(false);
      }
    }, (err: HttpErrorResponse) => {
      console.log(err);
      loading(false);

    })
  }

  openGallery(albumArr, index): void {
    this._lightbox.open(albumArr, index);
  }

  closeLightBox(): void {
    this._lightbox.close();
  }
  createWarehouse() {
    localStorage.removeItem('warehouseId');
    let userInfo = JSON.parse(localStorage.getItem('userInfo'));
    let userData = JSON.parse(userInfo.returnText);
    userData.UserProfileStatus = "Warehouse Category Pending";
    userInfo.returnText = JSON.stringify(userData);
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
    this._router.navigate(['setup-warehouse'])
  }

  goToDashboard() {
    let userInfo = JSON.parse(localStorage.getItem('userInfo'));
    let userData = JSON.parse(userInfo.returnText);
    userData.UserProfileStatus = "Dashboard";
    userInfo.returnText = JSON.stringify(userData);
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
    this._router.navigate(['provider/dashboard'])
  }

}
