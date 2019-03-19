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
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SeaFreightService } from '../sea-freight/sea-freight.service';
import { ConfirmDeleteDialogComponent } from '../../../../../shared/dialogues/confirm-delete-dialog/confirm-delete-dialog.component';
import { SeaRateDialogComponent } from '../../../../../shared/dialogues/sea-rate-dialog/sea-rate-dialog.component';
import { CommonService } from '../../../../../services/common.service';
import { cloneObject } from '../../reports/reports.component';
import { RateValidityComponent } from '../../../../../shared/dialogues/rate-validity/rate-validity.component';

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

  public loading: boolean = false
  public pageNo: number = 1;
  public pageSize: number = 5;
  filteredRecords: number;
  publishloading: boolean;
  fromDate: any;
  toDate: any;
  filterbyCustomer: any;
  isMarketplace: any;
  isCustomer: any;
  totalPublishedRecords: any;
  checkedallpublishRates: boolean;

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
    this.loading = true
    const wId = 0;
    this._warehouseService.getWarehouseList(providerId, wId).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        if (res.returnObject && res.returnObject.WHModel && res.returnObject.WHModel.length) {
          this.allWareHouseList = res.returnObject.WHModel;
          if (this.allWareHouseList && this.allWareHouseList.length) {
            this.allWareHouseList.map((obj) => {
              if (obj.FacilitiesProviding && obj.FacilitiesProviding != "[]" && isJSON(obj.FacilitiesProviding)) {
                obj.FacilitiesProviding = JSON.parse(obj.FacilitiesProviding);
              }
              if (obj.WHGallery && obj.WHGallery != "[]" && isJSON(obj.WHGallery)) {
                obj.WHGallery = JSON.parse(obj.WHGallery);
                this.allWareHouseList.forEach((object) => {
                  const albumArr = []
                  obj.WHGallery.forEach((elem) => {
                    const album = {
                      src: baseExternalAssets + elem.DocumentFile,
                      caption: elem.DocumentFileName,
                      thumb: baseExternalAssets + elem.DocumentFile,
                      DocumentUploadedFileType: elem.DocumentUploadedFileType
                    };
                    albumArr.push(album);
                    object.parsedGallery = albumArr;
                  })

                })
              }
            })
          }
        }

      }
      this.loading = false;

    }, (err: HttpErrorResponse) => {
      console.log(err);
      this.loading = false;
    })
  }

  openGallery(albumArr, index): void {
    this._lightbox.open(albumArr, index, { disableScrolling: true, centerVertically: true, alwaysShowNavOnTouchDevices: true });
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

  deleteWarehouse(whid) {
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
        if (index >= 0) {
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
  activeToggler(wh, whStatus) {
    wh.IsBlocked = whStatus;
    let obj = {
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
  goToDetail(whId) {
    // let id = encryptBookingID(whId);
    this._router.navigate(['/provider/warehouse-detail', whId]);
  }


  /**
   * [ADD WAREHOUSE RATES MODAL]
   * @param  rowId [description]
   * @return       [description]
   */
  public warehousePublishedRates: any[] = []
  addWarehouse(rowId) {
    let obj;
    if (rowId > 0) {
      obj = this.allWareHouseList.find(elem => elem.WHID == rowId);
    } else {
      obj = null
    }
    const modalRef = this._modalService.open(SeaRateDialogComponent, {
      size: 'lg',
      centered: true,
      windowClass: 'large-modal',
      backdrop: 'static',
      keyboard: false
    });
    modalRef.result.then((result) => {
      if (result) {
        console.log(result);
        this.warehousePublishedRates = result
        // this.setAddDraftData(type, result);
        // this.getDraftRates(type.toLowerCase())
      }
    });
    // modalRef.componentInstance.savedRow.subscribe((emmitedValue) => {
    //   this.setAddDraftData(type, emmitedValue);
    //   this.getDraftRates(type.toLowerCase())
    // });
    let object = {
      forType: 'WAREHOUSE',
      data: obj,
      addList: this.warehouseCharges,
      mode: 'draft',
      customers: this.allCustomers,
      drafts: this.warehouseTypes,
    }
    modalRef.componentInstance.selectedData = object;
    setTimeout(() => {
      if (document.getElementsByTagName('body')[0].classList.contains('modal-open')) {
        document.getElementsByTagName('html')[0].style.overflowY = 'hidden';
      }
    }, 0);

  }

  public warehouseTypes: any[] = []
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
      this.warehouseCharges = res.filter(e => e.modeOfTrans === 'WAREHOUSE' && e.addChrType === 'ADCH')
      loading(false)
    }, (err) => {
      loading(false)
    })
  }

  /**
   *
   * EVENT EMITTER OBSERVABLE FOR UI TABLE COMPONENT
   * @param {object} event
   * @memberof SeaFreightComponent
   */
  tableCheckedRows(event) {
    console.log(event);

    if (typeof event.list[0] === 'object') {
      if (event.list[0].type === 'history') {
        // this.rateHistory(event.list[0].id, 'Rate_FCL')
      }
    } else {
      this.delPublishRates = event.list
    }
  }

  /**
   *
   * EVENT EMITTER OBSERVABLE FOR SORTING IN UI TABLE
   * @param {string} type //fcl or lcl
   * @param {object} event // sorting object {columnName, columnDirection}
   * @memberof SeaFreightComponent
   */
  sortedFilters(type, event) {
    this.sortColumn = event.column
    this.sortColumnDirection = event.direction
    // this.getAllPublishRates()
  }

  /**
   * PAGING EVENT EMITTER OBSERVABLE FOR UI TABLE
   *
   * @param {string} type //fcl or lcl
   * @param {number} event //page number 0,1,2...
   * @memberof SeaFreightComponent
   */
  paging(event) {
    console.log(event);
    this.pageNo = event.page;
    this.getAllPublishRates(event.whid)
  }

  /**
   *
   * FILTER BUTTON ACTION
   * @param {string} type //fcl or lcl
   * @memberof SeaFreightComponent
   */
  filterRecords(type) {
    // this.getAllPublishRates()
  }

  /**
   *
   * GET ALL PUBLISHED RATES FOR FCL OR LCL
   * @param {string} type // fcl or lcl
   * @memberof SeaFreightComponent
   */
  public sortColumn: string = 'EffectiveFrom'
  public sortColumnDirection: string = 'ASC'
  getAllPublishRates(warehouseID) {
    // if (this.filteredRecords === 1) {
    //   this.pageNo = this.pageNo - 1
    // }
    this.publishloading = true;
    let obj = {
      pageNo: this.pageNo,
      pageSize: this.pageSize,
      providerID: this.userProfile.ProviderID,
      whid: warehouseID,
      effectiveFrom: (this.fromDate && this.fromDate.month) ? this.fromDate.month + '/' + this.fromDate.day + '/' + this.fromDate.year : null,
      effectiveTo: (this.toDate && this.toDate.month) ? this.toDate.month + '/' + this.toDate.day + '/' + this.toDate.year : null,
      sortColumn: this.sortColumn,
      sortColumnDirection: this.sortColumnDirection,
      customerID: (this.filterbyCustomer ? parseInt(this.filterbyCustomer) : null),
      customerType: (this.isCustomer ? 'CUSTOMER' : (this.isMarketplace ? 'MARKETPLACE' : null)),
      jsonCustomerDetail: null
    }
    this._warehouseService.getAllPublishedrates(obj).subscribe((res: any) => {
      console.log(res);
      this.publishloading = false;
      if (res.returnId > 0) {
        this.totalPublishedRecords = res.returnObject.recordsTotal
        this.filteredRecords = res.returnObject.recordsFiltered
        this.warehousePublishedRates = cloneObject(res.returnObject.data);
        this.checkedallpublishRates = false;
      }
    })
  }


  /**
   *
   * DELETE PUBLISHDED RECORD FOR FCL
   * @returns
   * @memberof SeaFreightComponent
   */
  public delPublishRates: any[] = []
  delPublishedRecord() {
    if (!this.delPublishRates.length) return;
    const modalRef = this._modalService.open(ConfirmDeleteDialogComponent, {
      size: 'lg',
      centered: true,
      windowClass: 'small-modal',
      backdrop: 'static',
      keyboard: false
    });
    modalRef.result.then((result) => {
      console.log(result);
      if (result == "Success") {
        this.getAllPublishRates(this.warehousePublishedRates[0].whid)
      }
    }, (reason) => {
      // console.log("reason");
    });
    let obj = {
      data: this.delPublishRates,
      type: "warehouse"
    }
    modalRef.componentInstance.deleteIds = obj;
    setTimeout(() => {
      if (document.getElementsByTagName('body')[0].classList.contains('modal-open')) {
        document.getElementsByTagName('html')[0].style.overflowY = 'hidden';
      }
    }, 0);
  }

  /**
   *
   * EDIT PUBLISH RATE POPUP MODAL ACTION
   * @param {string} type //fcl or lcl
   * @returns
   * @memberof SeaFreightComponent
   */
  rateValidity(type) {
    console.log(this.delPublishRates);
    
    if (!this.delPublishRates.length) return;
    let updateValidity = [];
    for (let i = 0; i < this.warehousePublishedRates.length; i++) {
      for (let y = 0; y < this.delPublishRates.length; y++) {
        if (this.warehousePublishedRates[i].whPricingID == this.delPublishRates[y]) {
          updateValidity.push(this.warehousePublishedRates[i])
        }
      }
    }
    if (updateValidity && updateValidity.length > 1) {
      const modalRef = this._modalService.open(RateValidityComponent, {
        size: 'lg',
        centered: true,
        windowClass: 'upper-medium-modal',
        backdrop: 'static',
        keyboard: false
      });
      modalRef.result.then((result) => {
        if (result == 'Success') {
          this.getAllPublishRates(type);
          this.checkedallpublishRates = false
          this.delPublishRates = [];
        }
      });
      let obj = {
        data: updateValidity,
        type: type
      }
      modalRef.componentInstance.validityData = obj;
    } else if (updateValidity && updateValidity.length === 1) {
      const modalRef2 = this._modalService.open(SeaRateDialogComponent, {
        size: 'lg',
        centered: true,
        windowClass: 'large-modal',
        backdrop: 'static',
        keyboard: false
      });
      modalRef2.result.then((result) => {
        if (result == 'Success') {
          this.getAllPublishRates(type);
          this.checkedallpublishRates = false
          this.delPublishRates = [];
        }
      });
      let object = {
        forType: type.toUpperCase(),
        data: updateValidity,
        addList: this.warehouseCharges,
        customers: this.allCustomers,
        drafts: this.warehouseTypes,
        mode: 'publish'
      }
      modalRef2.componentInstance.selectedData = object;
    }
    setTimeout(() => {
      if (document.getElementsByTagName('body')[0].classList.contains('modal-open')) {
        document.getElementsByTagName('html')[0].style.overflowY = 'hidden';
      }
    }, 0);
  }

}
