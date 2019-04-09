import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { WarehouseService } from './warehouse.service';
import { isJSON } from '../../../../../constants/globalFunctions';
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
import { CommonService } from '../../../../../services/common.service';
import { SharedService } from '../../../../../services/shared.service';
import { VideoDialogueComponent } from '../../../../../shared/dialogues/video-dialogue/video-dialogue.component'

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
  public cityList: any[] = [];
  public wareHouseTitle: string;
  public autoHide: boolean = false;
  public responsive: boolean = true;
  public directionLinks: boolean = true;
  public paginationConfig: PaginationInstance = {
    itemsPerPage: 5, currentPage: 1
  }
  //filter 

  public inActiveStatus: boolean = true;
  public activeStatus: boolean = true;
  public warehouseCharges: any[] = [];
  public step: number = 0

  //loading
  public loading: boolean = false

  // wareHouseDetTemplate
  public wareHouseDetTemplate: boolean = false;
  public warehouseID: any;

  constructor(
    private _warehouseService: WarehouseService,
    private _modalService: NgbModal,
    private _lightbox: Lightbox,
    private _location: PlatformLocation,
    private _toast: ToastrService,
    private _sharedService: SharedService

  ) {
    _location.onPopState(() => this.closeLightBox());
  }

  ngOnInit() {
    let userInfo = JSON.parse(localStorage.getItem('userInfo'));
    this._sharedService.cityList.subscribe((state: any) => {
      if (state) {
        this.cityList = state;
        if (userInfo && userInfo.returnText) {
          this.userProfile = JSON.parse(userInfo.returnText);
          this.getWhlist(this.userProfile.ProviderID);
        }
      }
    });
  }

  public videoURL:any
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
              if (obj.CityID && this.cityList && this.cityList.length) {
                obj.Location = this.cityList.find(elem => elem.id == obj.CityID).title
              }
              this.allWareHouseList.forEach(element => {
                const albumArr = []
                const docsArray: Array<any> = JSON.parse(element.WHGallery)
                let idx = this.allWareHouseList.indexOf(element);
                try {
                  docsArray.forEach(doc => {
                    if (doc.DocumentUploadedFileType.toLowerCase() === 'png' || doc.DocumentUploadedFileType.toLowerCase() === 'jpg' || doc.DocumentUploadedFileType.toLowerCase() === 'jpeg') {
                      const album = {
                        src: baseExternalAssets + '/' + doc.DocumentFile,
                        caption: '&nbsp;',
                        thumb: baseExternalAssets + '/' + doc.DocumentFile
                      };
                      albumArr.push(album)
                      this.allWareHouseList[idx].WHParsedMedia = albumArr;
                    } else if (doc.DocumentUploadedFileType.toLowerCase() === 'mp4') {
                      this.videoURL = baseExternalAssets + '/' + doc.DocumentFile
                      this.allWareHouseList[idx].videoURL = this.videoURL;
                    }
                  })
                } catch (error) { }
              });

              // if (obj.WHGallery && obj.WHGallery != "[]" && isJSON(obj.WHGallery)) {
              //   obj.WHGallery = JSON.parse(obj.WHGallery);
              //   const albumArr = []
              //   obj.WHGallery.forEach((elem) => {
              //     const album = {
              //       src: baseExternalAssets + elem.DocumentFile,
              //       caption: elem.DocumentFileName,
              //       thumb: baseExternalAssets + elem.DocumentFile,
              //       DocumentUploadedFileType: elem.DocumentUploadedFileType
              //     };
              //     albumArr.push(album);
              //   })
              //   obj.parsedGallery = albumArr;
              // }
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

  openGallery(index, albumArr): void {
    this._lightbox.open(albumArr, index, { disableScrolling: true, centerVertically: true, alwaysShowNavOnTouchDevices: true });
  }

  closeLightBox(): void {
    this._lightbox.close();
  }
  addAnotherWarehouse() {
    this.wareHouseDetTemplate = true;
    this.warehouseID = '0'
    this.step = 0;
    // this._router.navigate(['provider/add-warehouse', 0])
  }

  onPageChange(number) {
    this.paginationConfig.currentPage = number;
  }

  statusType(type: string, event) {
    if (type == 'activeStatus') {
      if (this.inActiveStatus) {
        this.activeStatus = !this.activeStatus;
      }
      else {
        event.preventDefault();
      }
    }
    else if (type == 'inActiveStatus') {
      if (this.activeStatus) {
        this.inActiveStatus = !this.inActiveStatus;
      }
      else {
        event.preventDefault();
      }
    }
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
  goToDetail(whId, type) {
    // let id = encryptBookingID(whId);
    this.wareHouseDetTemplate = true;
    this.warehouseID = whId;
    this.step = (type === 'edit') ? 0 : ((type === 'rate') ? 1 : 0)
    // this._router.navigate(['/provider/warehouse-detail', whId]);
  }

  warehouseList() {
    this.wareHouseDetTemplate = !this.wareHouseDetTemplate;
    this.getWhlist(this.userProfile.ProviderID);
  }

  openVideo(videoURL) {
    const modalRefVideo = this._modalService.open(VideoDialogueComponent, {
      size: 'lg',
      centered: true,
      windowClass: 'video',
      backdrop: 'static',
      keyboard: false
    });
    modalRefVideo.componentInstance.videoURL = videoURL
  }

}
