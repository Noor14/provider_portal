import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { WarehouseService } from './warehouse.service';
import { loading } from '../../../../../constants/globalFunctions';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Lightbox } from 'ngx-lightbox';
import { baseExternalAssets } from '../../../../../constants/base.url';
import { PlatformLocation } from '@angular/common';
import { PaginationInstance } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-warehouse-list',
  templateUrl: './warehouse-list.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./warehouse-list.component.scss']
})
export class WarehouseListComponent implements OnInit {

  public userProfile;
  public allWareHouseList: any[] = [];

  public autoHide: boolean = false;
  public responsive: boolean = true;
  public directionLinks: boolean = true;
  public paginationConfig: PaginationInstance = {
    itemsPerPage: 5, currentPage: 1
  }
  public searchBy: string
  constructor(
    private warehouseService: WarehouseService,
    private _router: Router,
    private _lightbox: Lightbox,
    private _location: PlatformLocation,
    private _toast: ToastrService

  ) {
    _location.onPopState(() => this.closeLightBox());
  }

  ngOnInit() {
    let userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo && userInfo.returnText) {
      this.userProfile = JSON.parse(userInfo.returnText);
      this.getWhlist(this.userProfile.ProviderID);
    }
  }

  getWhlist(providerId) {
    // loading(true)
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
        // loading(false);
      }
    }, (err: HttpErrorResponse) => {
      console.log(err);
      // loading(false);

    })
  }

  openGallery(albumArr, index): void {
    this._lightbox.open(albumArr, index);
  }

  closeLightBox(): void {
    this._lightbox.close();
  }
  addAnotherWarehouse() {
    localStorage.removeItem('warehouseId');
    this._router.navigate(['provider/add-warehouse'])
  }

  onPageChange(number) {
    this.paginationConfig.currentPage = number;
  }

  deleteWarehouse(whid){
    this.warehouseService.delWarehouse(whid, this.userProfile.LoginID).subscribe((res:any)=>{
      if(res.returnStatus == "Success"){
        this._toast.success('Warehouse delete successfully', '')
        this.getWhlist(this.userProfile.ProviderID);
      }
    })
  }

}
