import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WarehouseService } from '../manage-rates/warehouse-list/warehouse.service';
import { loading, isJSON } from '../../../../constants/globalFunctions';
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

  constructor(
    private _router: ActivatedRoute,
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
    loading(true)
    this._warehouseService.getWarehouseList(this.userProfile.ProviderID, whID).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        loading(false);
        if (res.returnObject && res.returnObject.WHModel && res.returnObject.WHModel.length) {
          this.wareHouse = res.returnObject.WHModel[0];
          if (this.wareHouse && this.wareHouse.length) {
            this.wareHouse.map((obj) => {
              if (obj.FacilitiesProviding && obj.FacilitiesProviding != "[]" && isJSON(obj.FacilitiesProviding)) {
                obj.FacilitiesProviding = JSON.parse(obj.FacilitiesProviding);
              }
              if (obj.WHGallery && obj.WHGallery != "[]" && isJSON(obj.WHGallery)) {
                obj.WHGallery = JSON.parse(obj.WHGallery);
              }
            })
          }
        }

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
}
