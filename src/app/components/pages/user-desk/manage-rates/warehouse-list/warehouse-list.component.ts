import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { WarehouseService } from './warehouse.service';
import { loading, isJSON, encryptBookingID } from '../../../../../constants/globalFunctions';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Lightbox } from 'ngx-lightbox';
import { baseExternalAssets } from '../../../../../constants/base.url';
import { PlatformLocation } from '@angular/common';
import { PaginationInstance } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import {  NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmDeleteDialogComponent } from '../../../../../shared/dialogues/confirm-delete-dialog/confirm-delete-dialog.component';

@Component({
  selector: 'app-warehouse-list',
  templateUrl: './warehouse-list.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./warehouse-list.component.scss']
})
export class WarehouseListComponent implements OnInit {

  public baseExternalAssets: string = baseExternalAssets;
  public userProfile;
  public allWareHouseList: any[] = [];
  public wareHouseTitle: string;
  public autoHide: boolean = false;
  public responsive: boolean = true;
  public directionLinks: boolean = true;
  public paginationConfig: PaginationInstance = {
    itemsPerPage: 5, currentPage: 1
  }
  public inActiveStatus: boolean = true;
  public activeStatus: boolean = true;

  constructor(
    private _warehouseService: WarehouseService,
    private _modalService: NgbModal,
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
    loading(true)
    const wId = 0;
    this._warehouseService.getWarehouseList(providerId, wId).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        loading(false);
        if (res.returnObject && res.returnObject.WHModel && res.returnObject.WHModel.length){
          this.allWareHouseList = res.returnObject.WHModel;
          if (this.allWareHouseList && this.allWareHouseList.length) {
            this.allWareHouseList.map((obj)=>{
              if (obj.FacilitiesProviding && obj.FacilitiesProviding != "[]" && isJSON(obj.FacilitiesProviding)){
                obj.FacilitiesProviding = JSON.parse(obj.FacilitiesProviding);
              }
              if (obj.WHGallery && obj.WHGallery != "[]" && isJSON(obj.WHGallery)) {
                obj.WHGallery = JSON.parse(obj.WHGallery);
                this.allWareHouseList.forEach((obj) => {
                  const albumArr = []
                  obj.WHGallery.forEach((elem) => {
                    console.log (elem)
                    const album = {
                      src: baseExternalAssets + elem.DocumentFile,
                      caption: elem.DocumentFileName,
                      thumb: baseExternalAssets + elem.DocumentFile,
                      DocumentUploadedFileType: elem.DocumentUploadedFileType
                    };
                    albumArr.push(album);
                    obj.parsedGallery = albumArr;
                  })

                })
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
  addAnotherWarehouse() {
    this._router.navigate(['provider/add-warehouse', 0])
  }

  onPageChange(number) {
    this.paginationConfig.currentPage = number;
  }

  deleteWarehouse(whid){
    const modalRef = this._modalService.open(ConfirmDeleteDialogComponent, {
      size: 'lg',
      centered: true,
      windowClass: 'small-modal',
      backdrop: 'static',
      keyboard: false
    });
    modalRef.result.then((result) => {
      if (result == "Success") {
        this._toast.success('Warehouse delete successfully', '')
        let index = this.allWareHouseList.findIndex(obj => obj.WHID == whid);
        if (index >= 0){
          this.allWareHouseList.splice(index, 1);
        }
      }
    });
    let obj = {
      data: whid,
      type: "DelWarehouse"
    }
    modalRef.componentInstance.deleteIds = obj;
    setTimeout(() => {
      if (document.getElementsByTagName('body')[0].classList.contains('modal-open')) {
        document.getElementsByTagName('html')[0].style.overflowY = 'hidden';
      }
    }, 0);

  }
  activeToggler(wh, whStatus){
    wh.IsBlocked = whStatus;
    let obj={
      whid: wh.WHID,
      status: !whStatus,
      modifiedBy: this.userProfile.LoginID
    }
    this._warehouseService.activeWarehouseToggler(obj).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        this._toast.success('Warehouse update successfully', '')
      }
    })
  }
  goToDetail(whId){
    // let id = encryptBookingID(whId);
    this._router.navigate(['/provider/warehouse-detail', whId]);
  }




}
