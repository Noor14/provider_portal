import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { WarehouseService } from './warehouse.service';
import { loading, isJSON, encryptBookingID, getImagePath, ImageSource, ImageRequiredSize } from '../../../../../constants/globalFunctions';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Lightbox } from 'ngx-lightbox';
import { baseExternalAssets } from '../../../../../constants/base.url';
import { PlatformLocation } from '@angular/common';
import { PaginationInstance } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import {  NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SeaFreightService } from '../sea-freight/sea-freight.service';
import { ConfirmDeleteDialogComponent } from '../../../../../shared/dialogues/confirm-delete-dialog/confirm-delete-dialog.component';
import { SeaRateDialogComponent } from '../../../../../shared/dialogues/sea-rate-dialog/sea-rate-dialog.component';
import { CommonService } from '../../../../../services/common.service';

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
  public warehouseCharges: any[] = [];

  constructor(
    private _warehouseService: WarehouseService,
    private _seaFreightService: SeaFreightService,
    private _modalService: NgbModal,
    private _router: Router,
    private _lightbox: Lightbox,
    private _location: PlatformLocation,
    private _toast: ToastrService,
    private _commonService: CommonService
  ) {
    _location.onPopState(() => this.closeLightBox());
  }

  ngOnInit() {
    let userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo && userInfo.returnText) {
      this.userProfile = JSON.parse(userInfo.returnText);
      this.getWhlist(this.userProfile.ProviderID);
    }
    this.getDropdownsList()
    this.getAllCustomers(this.userProfile.ProviderID)
    this.getAdditionalData()
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


  addWarehouse(rowId) {
    let obj;
    // if (type == 'FCL') {
    //   if (rowId > 0) {
    //     obj = this.draftsfcl.find(elem => elem.ProviderPricingDraftID == rowId);
    //   } else {
    //     obj = null
    //   }
    // }
    // else if (type == 'LCL') {
    //   obj = this.draftslcl.find(elem => elem.ConsolidatorPricingDraftID == rowId);
    // }
    const modalRef = this._modalService.open(SeaRateDialogComponent, {
      size: 'lg',
      centered: true,
      windowClass: 'large-modal',
      backdrop: 'static',
      keyboard: false
    });
    modalRef.result.then((result) => {
      if (result) {
        // if (type == 'FCL') {
        //   // loading(true)
        //   this.setAddDraftData(type, result);
        //   this.getDraftRates(type.toLowerCase())
        // }
        // else if (type == 'LCL') {
        //   this.setAddDraftData(type, result);
        //   this.getDraftRates(type.toLowerCase())
        //   // this.setAddDraftDataLCL(result.data);
        // }
      }
    });
    // modalRef.componentInstance.savedRow.subscribe((emmitedValue) => {
    //   this.setAddDraftData(type, emmitedValue);
    //   this.getDraftRates(type.toLowerCase())
    // });
    let object = {
      forType: 'WAREHOUSE',
      data: null,
      addList: this.warehouseCharges,
      mode: 'draft',
      customers: this.allCustomers,
      drafts: this.warehouseTypes
    }
    modalRef.componentInstance.selectedData = object;
    setTimeout(() => {
      if (document.getElementsByTagName('body')[0].classList.contains('modal-open')) {
        document.getElementsByTagName('html')[0].style.overflowY = 'hidden';
      }
    }, 0);

  }

  public warehouseTypes:any[] = []
  getDropdownsList() {
    loading(true)
    this._commonService.getMstCodeVal('WH_STORAGE_TYPE').subscribe((res: any) => {
      loading(false)
      this.warehouseTypes = res
    }, (err) => {
      loading(false)
    })
  }

  public allCustomers: any[] = []
  /**
   *
   * Getting list of all customers
   * @param {number} ProviderID
   * @memberof SeaFreightComponent
   */
  getAllCustomers(ProviderID) {
    loading(true)
    this._seaFreightService.getAllCustomers(ProviderID).subscribe((res: any) => {
      if (res.returnId > 0) {
        this.allCustomers = res.returnObject
        this.allCustomers.forEach(e => {
          e.CustomerImageParsed = getImagePath(ImageSource.FROM_SERVER, e.CustomerImage, ImageRequiredSize._48x48)
        })
      }
    }, (err) => {
      loading(false)
    })
  }

  /**
   *
   * Get Additional Port Charges
   * @memberof WarehouseFreightComponent
   */
  getAdditionalData() {
    loading(true)
    this._seaFreightService.getAllAdditionalCharges(this.userProfile.ProviderID).subscribe((res: any) => {
      console.log(res);
      this.warehouseCharges = res.filter(e => e.modeOfTrans === 'WAREHOUSE' && e.addChrType === 'FSUR')
      loading(false)
    }, (err) => {
      loading(false)
    })
  }

}
