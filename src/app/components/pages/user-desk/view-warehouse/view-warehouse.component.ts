import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WarehouseService } from '../manage-rates/warehouse-list/warehouse.service';
import { isJSON } from '../../../../constants/globalFunctions';
import { HttpErrorResponse } from '@angular/common/http';
import { baseExternalAssets } from '../../../../constants/base.url';
import { Lightbox } from 'ngx-lightbox';

@Component({
  selector: 'app-view-warehouse',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './view-warehouse.component.html',
  styleUrls: ['./view-warehouse.component.scss']
})
export class ViewWarehouseComponent implements OnInit, OnDestroy {

  public baseExternalAssets: string = baseExternalAssets;
  private paramSubscriber: any;
  public userProfile: any;
  public wareHouse: any;
  public loading: boolean = false;

  constructor(
    private _router: ActivatedRoute,
    private _redirect: Router,
    private _warehouseService: WarehouseService,
    private _lightbox: Lightbox,

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
  ngOnDestroy() {
    this.paramSubscriber.unsubscribe();
  }
  getWareHouseDetail(whID){
    this.loading = true;
    this._warehouseService.getWarehouseList(this.userProfile.ProviderID, whID).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        if (res.returnObject && res.returnObject.WHModel && res.returnObject.WHModel.length) {
          this.wareHouse = res.returnObject.WHModel[0];
          if (this.wareHouse && Object.keys(this.wareHouse).length) {
            for (const key in this.wareHouse) {
              if (this.wareHouse.hasOwnProperty(key) && key == 'FacilitiesProviding') {
                if (this.wareHouse[key] && this.wareHouse[key] != "[]" && isJSON(this.wareHouse[key])) {
                  this.wareHouse[key] = JSON.parse(this.wareHouse[key]);
                }
              }
              if (this.wareHouse.hasOwnProperty(key) && key == 'WHGallery') {
                if (this.wareHouse[key] && this.wareHouse[key] != "[]" && isJSON(this.wareHouse[key])) {
                  this.wareHouse[key] = JSON.parse(this.wareHouse[key]);
                    const albumArr = []
                    this.wareHouse[key].forEach((elem) => {
                      const album = {
                        src: baseExternalAssets + elem.DocumentFile,
                        caption: elem.DocumentFileName,
                        thumb: baseExternalAssets + elem.DocumentFile,
                        DocumentUploadedFileType: elem.DocumentUploadedFileType
                      };
                      albumArr.push(album);
                    })
                  this.wareHouse['parsedGallery'] = albumArr;
                }
              }

            }
          }
        }
        this.loading = false;
      }
    }, (err: HttpErrorResponse) => {
      console.log(err);
       this.loading = false
    })
  }

  editWarehouse(id){
    this._redirect.navigate(['provider/add-warehouse', id])

  }

  openGallery(albumArr, index): void {
    this._lightbox.open(albumArr, index, { disableScrolling: true, centerVertically: true, alwaysShowNavOnTouchDevices: true });
  }
  closeLightBox(): void {
    this._lightbox.close();
  }
}
