import { Component, OnInit, ViewChild, ViewEncapsulation, ElementRef, Renderer2, QueryList, AfterViewInit, OnDestroy, Output } from '@angular/core';
import {
  NgbInputDatepicker,
  NgbDateStruct,
  NgbDateParserFormatter,
  NgbModal
} from '@ng-bootstrap/ng-bootstrap';
import { trigger, animate, transition, style } from '@angular/animations';
import { DiscardDraftComponent } from '../../../../../shared/dialogues/discard-draft/discard-draft.component';
import { Observable, Subscription } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import { SeaFreightService } from './sea-freight.service';
import { SharedService } from '../../../../../services/shared.service';
import { ConfirmDeleteDialogComponent } from '../../../../../shared/dialogues/confirm-delete-dialog/confirm-delete-dialog.component';
import { SeaRateDialogComponent } from '../../../../../shared/dialogues/sea-rate-dialog/sea-rate-dialog.component';
import { NgbDateFRParserFormatter } from '../../../../../constants/ngb-date-parser-formatter';
import { ManageRatesService } from '../manage-rates.service';
import { ToastrService } from 'ngx-toastr';
import { RateValidityComponent } from '../../../../../shared/dialogues/rate-validity/rate-validity.component';
import { RateHistoryComponent } from '../../../../../shared/dialogues/rate-history/rate-history.component';
import { getImagePath, ImageSource, ImageRequiredSize, changeCase, loading } from '../../../../../constants/globalFunctions';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonService } from '../../../../../services/common.service';
import { cloneObject } from '../../reports/reports.component';
declare var $;
const now = new Date();
const equals = (one: NgbDateStruct, two: NgbDateStruct) =>
  one && two && two.year === one.year && two.month === one.month && two.day === one.day;

const before = (one: NgbDateStruct, two: NgbDateStruct) =>
  !one || !two ? false : one.year === two.year ? one.month === two.month ? one.day === two.day
    ? false : one.day < two.day : one.month < two.month : one.year < two.year;

const after = (one: NgbDateStruct, two: NgbDateStruct) =>
  !one || !two ? false : one.year === two.year ? one.month === two.month ? one.day === two.day
    ? false : one.day > two.day : one.month > two.month : one.year > two.year;

@Component({
  selector: 'app-sea-freight',
  templateUrl: './sea-freight.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./sea-freight.component.scss'],
  providers: [{ provide: NgbDateParserFormatter, useClass: NgbDateFRParserFormatter }],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [   // :enter is alias to 'void => *'
        style({ opacity: 0 }),
        animate(500, style({ opacity: 1 }))
      ]),
      transition(':leave', [   // :leave is alias to '* => void'
        animate(500, style({ opacity: 0 }))
      ])
    ])
  ]
})

export class SeaFreightComponent implements OnInit, OnDestroy {
  public draftRates: any;
  @ViewChild("dp") input: NgbInputDatepicker;
  @ViewChild("dpLCL") inputLCL: NgbInputDatepicker;
  @ViewChild('rangeDp') rangeDp: ElementRef;
  @ViewChild('rangeDpLCL') rangeDpLCL: ElementRef;

  public rateValidityTextFCL = "Edit Rate / Validity"
  public rateValidityTextLCL = "Edit Rate / Validity"
  public activeTab = "activeFCL"

  public allRatesList: any;
  public allRatesListLcL: any;
  public publishloading: boolean = false;
  public draftloading: boolean = false;
  public allShippingLines: any[] = [];
  public allCargoType: any[] = []
  public allPorts: any[] = [];
  public allCurrencies: any[] = [];
  public allSeaDraftRatesByFCL: any[] = [];
  public allSeaDraftRatesByLCL: any[] = [];
  public draftDataBYSeaFCL: any[] = [];
  public draftDataBYSeaLCL: any[] = [];
  public draftsfcl: any[] = [];
  public draftslcl: any[] = [];
  public delPublishRates: any[] = [];
  public delPublishRatesLcl: any[] = [];
  public publishRates: any[] = [];
  public publishRatesLCL: any[] = [];
  public filterOrigin: any = {};
  public filterDestination: any = {};
  public startDate: NgbDateStruct;
  public maxDate: NgbDateStruct;
  public minDate: NgbDateStruct;
  public hoveredDate: NgbDateStruct;
  public hoveredDateLCL: NgbDateStruct;
  public fromDate: any;
  public toDate: any;
  public fromDateLCL: any;
  public toDateLCL: any;
  public model: any;
  public modelLCL: any;
  public userProfile: any;

  // filterartion variable;
  public filterbyShippingLine;
  public filterbyCargoType;
  public filterbyCargoTypeLcl;
  public filterbyContainerType;
  public filterbyHandlingType;
  public checkedallpublishRates: boolean = false;
  public checkedallpublishRatesLcl: boolean = false;
  public checkedalldraftRates: boolean = false;
  public checkedalldraftRatesLCL: boolean = false;

  // term and condition
  public editorContentFCL: any;
  public editorContentLCL: any;
  public editorOptionsFCL = {
    placeholder: "insert content..."
  };
  public editorOptionsLCL = {
    placeholder: "insert content..."
  };

  public disableFCL: boolean;
  public disableLCL: boolean;
  public seaCharges: any = []
  public allCustomers: any[] = []
  public filterbyCustomer;
  public fromType: string = ''
  public sortColumn: string = 'EffectiveFrom'
  public sortColumnDirection: string = 'ASC'
  public isCustomer: boolean = false
  public isMarketplace: boolean = false
  public pageNo: number = 1;
  public pageSize: number = 5;
  public totalPublishedRecords: number;
  public combinedContainers = []
  public selectedFCLContainers = []
  public seaPorts: any[] = []
  public allContainers = []
  public fclContainers = []
  public shippingCategories = []
  public publishloadingLcl: boolean = false

  isHovered = date =>
    this.fromDate && !this.toDate && this.hoveredDate && after(date, this.fromDate) && before(date, this.hoveredDate)
  isInside = date => after(date, this.fromDate) && before(date, this.toDate);
  isFrom = date => equals(date, this.fromDate);
  isTo = date => equals(date, this.toDate);


  isHoveredLCL = date =>
    this.fromDateLCL && !this.toDateLCL && this.hoveredDateLCL && after(date, this.fromDateLCL) && before(date, this.hoveredDateLCL)
  isInsideLCL = date => after(date, this.fromDateLCL) && before(date, this.toDateLCL);
  isFromLCL = date => equals(date, this.fromDateLCL);
  isToLCL = date => equals(date, this.toDateLCL);

  constructor(
    private modalService: NgbModal,
    private _seaFreightService: SeaFreightService,
    private _manageRatesService: ManageRatesService,
    private _sharedService: SharedService,
    private element: ElementRef,
    private renderer: Renderer2,
    private _parserFormatter: NgbDateParserFormatter,
    private _toast: ToastrService,
    private _commonService: CommonService
  ) {
  }

  ngOnInit() {
    let userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo && userInfo.returnText) {
      this.userProfile = JSON.parse(userInfo.returnText);
    }
    this.startDate = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
    this.maxDate = { year: now.getFullYear() + 1, month: now.getMonth() + 1, day: now.getDate() };
    this.minDate = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };

    this.getAllPublishRates('fcl');
    this.allservicesBySea();

    // fill dropdow lists
    this.getDropdownsList()
    this.getDraftRates('fcl')
    this.getPortsData()
    this.getContainersMapping()

    this.getAllCustomers(this.userProfile.ProviderID)
    this._sharedService.termNcondFCL.subscribe(state => {
      if (state) {
        this.editorContentFCL = state;
      }
    })
    this._sharedService.termNcondLCL.subscribe(state => {
      if (state) {
        this.editorContentLCL = state;
      }
    })

    this.getAdditionalData()

  }

  ngOnDestroy() {
  }


  onEditorBlured(quill, type) {
  }

  onEditorFocused(quill, type) {
  }

  onEditorCreated(quill, type) {
  }
  onContentChanged({ quill, html, text }, type) {
    if (type = "FCL") {
      this.editorContentFCL = html
    }
    else {
      this.editorContentLCL = html
    }
  }


  clearFilter(event, type) {
    event.preventDefault();
    event.stopPropagation();
    if (type == "FCL") {
      this.filterbyShippingLine = 'undefined';
      this.filterbyCargoType = 'undefined';
      this.filterbyContainerType = 'undefined';
      this.model = null;
      this.fromDate = null;
      this.toDate = null;
      this.filterDestination = {};
      this.filterOrigin = {};
      this.filterbyCustomer = null;
      this.isMarketplace = true
      this.isCustomer = false
      this.getAllPublishRates('fcl')
    }
    else if (type == "LCL") {
      if (
        (this.filterbyCargoType && this.filterbyCargoType != 'undefined') ||
        (this.filterbyHandlingType && this.filterbyHandlingType != 'undefined') ||
        (this.filterDestination && Object.keys(this.filterDestination).length) ||
        (this.filterOrigin && Object.keys(this.filterOrigin).length)
      ) {
        this.model = null;
        this.fromDate = null;
        this.toDate = null;
        this.filterbyCargoType = 'undefined';
        this.filterbyHandlingType = 'undefined';
        this.filterDestination = {};
        this.filterOrigin = {};
        this.getAllPublishRates('lcl')
      }
    }
  }

  addRatesManually() {
    this.updatePopupRates(0, 'FCL');
  }

  addRatesManuallyLCL() {
    this.updatePopupRates(0, 'LCL');
  }

  updatePopupRates(rowId, type) {
    let obj;
    if (type == 'FCL') {
      if (rowId > 0) {
        obj = this.draftsfcl.find(elem => elem.ProviderPricingDraftID == rowId);
      } else {
        obj = null
      }
    }
    else if (type == 'LCL') {
      obj = this.draftslcl.find(elem => elem.ConsolidatorPricingDraftID == rowId);
    }
    const modalRef = this.modalService.open(SeaRateDialogComponent, {
      size: 'lg',
      centered: true,
      windowClass: 'large-modal',
      backdrop: 'static',
      keyboard: false
    });
    modalRef.result.then((result) => {
      if (result) {
        console.log(result);
        
        if (type == 'FCL') {
          // loading(true)
          this.setAddDraftData(type, result);
          this.getDraftRates(type.toLowerCase())
        }
        else if (type == 'LCL') {
          this.setAddDraftData(type, result);
          this.getDraftRates(type.toLowerCase())
          // this.setAddDraftDataLCL(result.data);
        }
      }
    });
    modalRef.componentInstance.savedRow.subscribe((emmitedValue) => {
      console.log(emmitedValue);
      this.setAddDraftData(type, emmitedValue);
      this.getDraftRates(type.toLowerCase())
    });
    let object = {
      forType: type,
      data: obj,
      addList: this.seaCharges,
      mode: 'draft',
      customers: this.allCustomers,
    }
    modalRef.componentInstance.selectedData = object;
    setTimeout(() => {
      if (document.getElementsByTagName('body')[0].classList.contains('modal-open')) {
        document.getElementsByTagName('html')[0].style.overflowY = 'hidden';
      }
    }, 0);

  }

  /**
   *
   *  Setting Draft Data in FCL Drafts Tabls
   * @param {Array} data
   * @memberof SeaFreightComponent
   */
  setAddDraftData(type, data) {
    data.forEach(element => {
      if (element.JsonSurchargeDet) {
        let importCharges = []
        let exportCharges = []
        let parsedJsonSurchargeDet = JSON.parse(element.JsonSurchargeDet)
        importCharges = parsedJsonSurchargeDet.filter(e => e.Imp_Exp === 'IMPORT');
        exportCharges = parsedJsonSurchargeDet.filter(e => e.Imp_Exp === 'EXPORT');
        element.parsedJsonSurchargeDet = importCharges.concat(exportCharges)
      }
      let dataObj = changeCase(element, 'pascal')
      if (type === 'FCL') {
        this.draftsfcl.forEach(e => {
          if (e.ProviderPricingDraftID === element.providerPricingDraftID) {
            let idx = this.draftsfcl.indexOf(e)
            this.draftsfcl.splice(idx, 1)
          }
        })
        this.draftsfcl.unshift(dataObj)
      } else if (type === 'LCL') {
        this.draftslcl.forEach(e => {
          if (e.ConsolidatorPricingDraftID === element.ConsolidatorPricingDraftID) {
            let idx = this.draftslcl.indexOf(e)
            this.draftslcl.splice(idx, 1)
          }
        })
        this.draftslcl.unshift(dataObj)
      }
    });
  }
  addAnotherRates() {
    if (this.activeTab == "activeFCL") {
      this.addRatesManually();
    }
    else if (this.activeTab == "activeLCL") {
      this.addRatesManuallyLCL();
    }
  }
  addRatesByseaManually() {
    if (this.activeTab == "activeFCL") {
      if ((!this.allSeaDraftRatesByFCL || (this.allSeaDraftRatesByFCL && !this.allSeaDraftRatesByFCL.length)) && (!this.draftDataBYSeaFCL || (this.draftDataBYSeaFCL && !this.draftDataBYSeaFCL.length))) {
        this.addRatesManually();
      }
    }
    else if (this.activeTab == "activeLCL") {
      if ((!this.allSeaDraftRatesByLCL || (this.allSeaDraftRatesByLCL && !this.allSeaDraftRatesByLCL.length)) && (!this.draftDataBYSeaLCL || (this.draftDataBYSeaLCL && !this.draftDataBYSeaLCL.length))) {
        this.addRatesManuallyLCL();
      }
    }
  }

  onDateSelection(date: NgbDateStruct) {
    let parsed = '';
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && after(date, this.fromDate)) {
      this.toDate = date;
      // this.model = `${this.fromDate.year} - ${this.toDate.year}`;
      this.input.close();
    } else {
      this.toDate = null;
      this.fromDate = date;
    }
    if (this.fromDate) {
      parsed += this._parserFormatter.format(this.fromDate);
    }
    if (this.toDate) {
      parsed += ' - ' + this._parserFormatter.format(this.toDate);
    }
    this.renderer.setProperty(this.rangeDp.nativeElement, 'value', parsed);
  }

  allservicesBySea() {
    this.draftRates = this._sharedService.dataLogisticServiceBySea.subscribe(state => {
      if (state && state.length) {
        for (let index = 0; index < state.length; index++) {
          if (state[index].LogServName == "SEA") {
            this.allShippingLines = state[index].DropDownValues.ShippingLine;
            if (state[index].TCFCL) {
              this.editorContentFCL = state[index].TCFCL;
              this.disableFCL = true;
            }
            if (state[index].TCLCL) {
              this.editorContentLCL = state[index].TCLCL;
              this.disableLCL = true;
            }
          }
        }
      }
    })
  }

  filterBydate(date, type) {
    if (type == "FCL") {
      if (!date && this.fromDate && this.toDate) {
        this.fromDate = null;
        this.toDate = null;
      }
      else {
        return;
      }
    }
    if (type == "LCL") {
      if (!date && this.fromDate && this.toDate) {
        this.fromDate = null;
        this.toDate = null;
      }
      else {
        return;
      }
    }

  }
  dateFilteronFocusOut(date, type) {
    if (type == "FCL") {
      if (!date) {
        this.fromDate = {};
        this.toDate = {};
      }
    }
  }

  /**
   *
   * GET ALL PUBLISHED RATES FOR FCL OR LCL
   * @param {string} type // fcl or lcl
   * @memberof SeaFreightComponent
   */
  getAllPublishRates(type) {
    this.publishloading = true;
    let obj = {
      providerID: this.userProfile.ProviderID,
      pageNo: this.pageNo,
      pageSize: this.pageSize,
      carrierID: (this.filterbyShippingLine == 'undefined') ? null : this.filterbyShippingLine,
      shippingCatID: (this.filterbyCargoType == 'undefined') ? null : this.filterbyCargoType,
      containerSpecID: (this.filterbyContainerType == 'undefined') ? null : this.filterbyContainerType,
      polID: this.orgfilter(),
      podID: this.destfilter(),
      effectiveFrom: (this.fromDate && this.fromDate.month) ? this.fromDate.month + '/' + this.fromDate.day + '/' + this.fromDate.year : null,
      effectiveTo: (this.toDate && this.toDate.month) ? this.toDate.month + '/' + this.toDate.day + '/' + this.toDate.year : null,
      customerID: (this.filterbyCustomer ? parseInt(this.filterbyCustomer) : null),
      customerType: (this.isCustomer ? 'CUSTOMER' : (this.isMarketplace ? 'MARKETPLACE' : null)),
      sortColumn: this.sortColumn,
      sortColumnDirection: this.sortColumnDirection
    }
    this._seaFreightService.getAllrates(type, obj).subscribe((res: any) => {
      this.publishloading = false;
      if (res.returnId > 0) {
        this.totalPublishedRecords = res.returnObject.recordsTotal
        if (type === 'fcl') {
          this.allRatesList = cloneObject(res.returnObject.data);
          this.checkedallpublishRates = false;
        } else if (type === 'lcl') {
          this.allRatesListLcL = res.returnObject.data;
          this.checkedallpublishRatesLcl = false;
        }
        this.publishloading = false;
      }
    })

  }

  public selectedColumn;
  public selectedDir;
  orgfilter(type?) {
    if (this.filterOrigin && typeof this.filterOrigin == "object" && Object.keys(this.filterOrigin).length) {
      return this.filterOrigin.PortID;
    }
    else if (this.filterOrigin && typeof this.filterOrigin == "string") {
      return -1;
    }
    else if (!this.filterOrigin) {
      return null;
    }
  }

  destfilter(type?) {
    if (this.filterDestination && typeof this.filterDestination == "object" && Object.keys(this.filterDestination).length) {
      return this.filterDestination.PortID;
    }
    else if (this.filterDestination && typeof this.filterDestination == "string") {
      return -1;
    }
    else if (!this.filterDestination) {
      return null;
    }
  }

  /**
   *
   * DELETE ALL DRAFT RATES FOR FCL AND LCL
   * @param {string} type //fcl or lcl
   * @memberof SeaFreightComponent
   */
  discardDraft(type) {
    let discardarr = [];
    if (type === 'fcl') {
      this.draftsfcl.forEach(elem => {
        discardarr.push(elem.ProviderPricingDraftID)
      })
    } else if (type === 'lcl') {
      this.draftslcl.forEach(elem => {
        discardarr.push(elem.ConsolidatorPricingDraftID)
      })
    }
    const modalRef = this.modalService.open(DiscardDraftComponent, {
      size: 'lg',
      centered: true,
      windowClass: 'small-modal',
      backdrop: 'static',
      keyboard: false
    });
    modalRef.result.then((result) => {
      if (result == "Success") {
        this.draftsfcl = [];
        this.draftslcl = [];
        this.allSeaDraftRatesByFCL = [];
        this.draftDataBYSeaFCL = [];
        this.publishRates = [];
        this.getDraftRates(type)
      }
    }, (reason) => {
      // console.log("reason");
    });
    let obj = {
      data: discardarr,
      type: (type === 'fcl' ? 'draftSeaRateFCL' : 'draftSeaRateLCL')
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
   * DELETE ALL DRAFT RATES FOR LCL
   * @memberof SeaFreightComponent
   */
  discardDraftLcl() {
    let discardarr = [];
    this.draftslcl.forEach(elem => {
      discardarr.push(elem.ConsolidatorPricingDraftID)
    })
    const modalRef = this.modalService.open(DiscardDraftComponent, {
      size: 'lg',
      centered: true,
      windowClass: 'small-modal',
      backdrop: 'static',
      keyboard: false
    });
    modalRef.result.then((result) => {
      if (result == "Success") {
        this.draftslcl = [];
        this.allSeaDraftRatesByLCL = [];
        this.draftDataBYSeaLCL = [];
        this.publishRatesLCL = [];
      }
    }, (reason) => {
      // console.log("reason");
    });
    let obj = {
      data: discardarr,
      type: "draftSeaRateLCL"
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
   * DELETE PUBLISHDED RECORD FOR FCL
   * @returns
   * @memberof SeaFreightComponent
   */
  delFclPubRecord() {
    if (!this.delPublishRates.length) return;
    const modalRef = this.modalService.open(ConfirmDeleteDialogComponent, {
      size: 'lg',
      centered: true,
      windowClass: 'small-modal',
      backdrop: 'static',
      keyboard: false
    });
    modalRef.result.then((result) => {
      if (result == "Success") {
        this.checkedallpublishRates = false;
        if (this.allRatesList.length == this.delPublishRates.length) {
          this.allRatesList = [];
          this.delPublishRates = [];
        }
        else {
          for (var i = 0; i < this.delPublishRates.length; i++) {
            for (let y = 0; y < this.allRatesList.length; y++) {
              if (this.delPublishRates[i] == this.allRatesList[y].carrierPricingID) {
                this.allRatesList.splice(y, 1);
              }
            }
          }
          if (i == this.delPublishRates.length) {
            this.delPublishRates = [];
          }
        }
        this.getAllPublishRates('fcl')
      }
    }, (reason) => {
      // console.log("reason");
    });
    let obj = {
      data: this.delPublishRates,
      type: "publishSeaRateFCL"
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
   * DELETE PUBLISHED RECORD FOR LCL
   * @returns
   * @memberof SeaFreightComponent
   */
  delLclPubRecord() {
    if (!this.delPublishRates.length) return;
    const modalRef = this.modalService.open(ConfirmDeleteDialogComponent, {
      size: 'lg',
      centered: true,
      windowClass: 'small-modal',
      backdrop: 'static',
      keyboard: false
    });
    modalRef.result.then((result) => {
      if (result == "Success") {
        this.checkedallpublishRates = false;
        if (this.allRatesListLcL.length == this.delPublishRates.length) {
          this.allRatesListLcL = [];
          this.delPublishRates = [];
        }
        else {
          for (var i = 0; i < this.delPublishRates.length; i++) {
            for (let y = 0; y < this.allRatesListLcL.length; y++) {
              if (this.delPublishRates[i] == this.allRatesListLcL[y].consolidatorPricingID) {
                this.allRatesListLcL.splice(y, 1);
              }
            }
          }
          if (i == this.delPublishRates.length) {
            this.delPublishRates = [];
          }
        }
        this.getAllPublishRates('lcl')
      }
    }, (reason) => {
      // console.log("reason");
    });
    let obj = {
      data: this.delPublishRates,
      type: "publishSeaRateLCL"
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
   * DELETE ROWM FROM PUBLISHED RECORDS TABLE
   * @param {string} type //fcl or lcl
   * @memberof SeaFreightComponent
   */
  deletepublishRecord(type) {
    if (type == "FCL") {
      this.delFclPubRecord()
    }
    if (type == "LCL") {
      this.delLclPubRecord()
    }
  }

  /**
   *
   * PUBLISH DRAFT RATES
   * @param {string} type // fcl or lcl
   * @memberof SeaFreightComponent
   */
  publishRate(type) {
    let param;
    if (type === 'fcl') {
      param = {
        pricingIDList: (this.draftsfcl.length === this.publishRates.length) ? [-1] : this.publishRates,
        providerID: this.userProfile.ProviderID
      }
    } else if (type === 'lcl') {
      param = {
        pricingIDList: (this.draftslcl.length === this.publishRates.length) ? [-1] : this.publishRates,
        providerID: this.userProfile.ProviderID
      }
    }

    this._seaFreightService.publishDraftRate(type, param).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        if (type === 'fcl') {
          for (var i = 0; i < this.publishRates.length; i++) {
            for (let y = 0; y < this.draftsfcl.length; y++) {
              if (this.draftsfcl[y].ProviderPricingDraftID == this.publishRates[i]) {
                this.draftsfcl.splice(y, 1);
              }
            }
          }
        } else if (type === 'lcl') {
          for (var i = 0; i < this.publishRates.length; i++) {
            for (let y = 0; y < this.draftslcl.length; y++) {
              if (this.draftslcl[y].ConsolidatorPricingDraftID == this.publishRates[i]) {
                this.draftslcl.splice(y, 1);
              }
            }
          }
        }
        this._toast.success(res.returnText, 'Success')
        if (this.publishRates.length == i) {
          this.checkedalldraftRates = false;
          this.publishRates = [];
          this.getAllPublishRates(type);
          this.getDraftRates(type) // todo remove is when we get the mechanism for transfer data between components
        }
      }
    })
  }

  ports = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      map(term => (!term || term.length < 3) ? []
        : this.allPorts.filter(v => v.PortName.toLowerCase().indexOf(term.toLowerCase()) > -1))
    )
  formatter = (x: { PortName: string }) => x.PortName;

  /**
   *
   * DELETE ROWM FROM DRAFTS TABLE FOR FCL
   * @param {number} id //row identifier
   * @memberof SeaFreightComponent
   */
  deleteRow(id) {
    const modalRef = this.modalService.open(ConfirmDeleteDialogComponent, {
      size: 'lg',
      centered: true,
      windowClass: 'small-modal',
      backdrop: 'static',
      keyboard: false
    });
    modalRef.result.then((result) => {
      if (result == "Success") {
        for (let index = 0; index < this.draftsfcl.length; index++) {
          if (this.draftsfcl[index].ProviderPricingDraftID == id) {
            this.draftsfcl.splice(index, 1);
            this.getDraftRates('fcl') //@todo remove it when we get the mechanism for parent to child changes emit
            this.publishRates = [];
            break;
          }
        }
      }
    }, (reason) => {
      // console.log("reason");
    });
    let obj = {
      data: [id],
      type: "draftSeaRateFCL"
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
   * DELETE ROW FROM TABLE FOR LCL
   * @param {number} id //row id to be deleted
   * @memberof SeaFreightComponent
   */
  deleteRowLCL(id) {
    const modalRef = this.modalService.open(ConfirmDeleteDialogComponent, {
      size: 'lg',
      centered: true,
      windowClass: 'small-modal',
      backdrop: 'static',
      keyboard: false
    });
    modalRef.result.then((result) => {
      if (result == "Success") {
        for (let index = 0; index < this.draftslcl.length; index++) {
          if (this.draftslcl[index].ConsolidatorPricingDraftID == id) {
            this.draftslcl.splice(index, 1);
            // this.generateDraftTableLCL();
            this.getDraftRates('lcl')
            this.publishRatesLCL = [];
            break;
          }
        }
      }
    }, (reason) => {
      // console.log("reason");
    });
    let obj = {
      data: [id],
      type: "draftSeaRateLCL"
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
    if (!this.delPublishRates.length) return;
    let updateValidity = [];
    if (type === 'fcl') {
      for (let i = 0; i < this.allRatesList.length; i++) {
        for (let y = 0; y < this.delPublishRates.length; y++) {
          if (this.allRatesList[i].carrierPricingID == this.delPublishRates[y]) {
            updateValidity.push(this.allRatesList[i])
          }
        }
      }
    } else if (type === 'lcl') {
      for (let i = 0; i < this.allRatesListLcL.length; i++) {
        for (let y = 0; y < this.delPublishRates.length; y++) {
          if (this.allRatesListLcL[i].consolidatorPricingID == this.delPublishRates[y]) {
            updateValidity.push(this.allRatesListLcL[i])
          }
        }
      }
    }
    if (updateValidity && updateValidity.length > 1) {
      const modalRef = this.modalService.open(RateValidityComponent, {
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
      const modalRef2 = this.modalService.open(SeaRateDialogComponent, {
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
        addList: this.seaCharges,
        customers: this.allCustomers,
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

  rateValidityLCL() {
    if (!this.delPublishRatesLcl.length) return;
    let updateValidity = [];
    for (let i = 0; i < this.allRatesListLcL.length; i++) {
      for (let y = 0; y < this.delPublishRatesLcl.length; y++) {
        if (this.allRatesListLcL[i].consolidatorPricingID == this.delPublishRatesLcl[y]) {
          updateValidity.push(this.allRatesListLcL[i])
        }
      }
    }
    const modalRef = this.modalService.open(RateValidityComponent, {
      size: 'lg',
      centered: true,
      windowClass: 'upper-medium-modal',
      backdrop: 'static',
      keyboard: false
    });
    modalRef.result.then((result) => {
      if (result == 'Success') {
        this.checkedallpublishRatesLcl = false
        this.delPublishRatesLcl = [];
      }
    });
    let obj = {
      data: updateValidity,
      type: "rateValidityLCL"
    }
    modalRef.componentInstance.validityData = obj;
    setTimeout(() => {
      if (document.getElementsByTagName('body')[0].classList.contains('modal-open')) {
        document.getElementsByTagName('html')[0].style.overflowY = 'hidden';
      }
    }, 0);
  }

  /**
   *
   * RATE HISTORY POPUP TRIGGER
   * @param {number} recId //table row id
   * @param {string} fortype // fcl or lcl
   * @memberof SeaFreightComponent
   */
  rateHistory(recId, fortype) {
    const modalRef = this.modalService.open(RateHistoryComponent, {
      size: 'lg',
      centered: true,
      windowClass: 'upper-medium-modal-history',
      backdrop: 'static',
      keyboard: false
    });

    let obj = {
      id: recId,
      type: fortype,
      shippingLines: this.allShippingLines,
      customers: this.allCustomers,
    }
    modalRef.componentInstance.getRecord = obj;
    setTimeout(() => {
      if (document.getElementsByTagName('body')[0].classList.contains('modal-open')) {
        document.getElementsByTagName('html')[0].style.overflowY = 'hidden';
      }
    }, 0);
  }

  /**
   *
   * SAVE TERMS AND CONDITION BUTTON ACTION
   * @param {string} type //FCL OR LCL
   * @memberof SeaFreightComponent
   */
  saveTermNcond(type) {
    let obj = {
      providerID: this.userProfile.ProviderID,
      termsAndConditions: (type == 'FCL') ? this.editorContentFCL : this.editorContentLCL,
      transportType: (this.activeTab == 'activeFCL') ? "FCL" : "LCL",
      modifiedBy: this.userProfile.LoginID
    }
    this._manageRatesService.termNCondition(obj).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        this._toast.success("Term and Condition saved Successfully", "");
        if (this.activeTab == 'activeFCL') {
          this._sharedService.termNcondFCL.next(this.editorContentFCL);
          this.disableFCL = true;
        } else {
          this._sharedService.termNcondLCL.next(this.editorContentLCL);
          this.disableLCL = true;
        }
      }
    })
  }

  /**
   *
   * Get Additional Port Charges
   * @memberof SeaFreightComponent
   */
  getAdditionalData() {
    loading(true)
    this._seaFreightService.getAllAdditionalCharges(this.userProfile.ProviderID).subscribe((res: any) => {
      this.seaCharges = res.filter(e => e.modeOfTrans === 'SEA' && e.addChrType === 'ADCH')
      loading(false)
    }, (err) => {
      loading(false)
    })
  }

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
   * Getting all dropdown values to fill
   *
   * @memberof SeaFreightComponent
   */
  getDropdownsList() {
    this.allPorts = JSON.parse(localStorage.getItem('PortDetails'))
    this.seaPorts = this.allPorts.filter(e => e.PortType === 'SEA')
    this.combinedContainers = JSON.parse(localStorage.getItem('containers'))
    this.fclContainers = this.combinedContainers.filter(e => e.ContainerFor === 'FCL')
    let uniq = {}
    this.allCargoType = this.fclContainers.filter(obj => !uniq[obj.ShippingCatID] && (uniq[obj.ShippingCatID] = true));
    this._sharedService.currenciesList.subscribe(res => {
      if (res) {
        this.allCurrencies = res;
      }
    })
  }

  /**
   *
   * Get All Drafts for FCL/LCL
   * @param {string} type 'fcl or lcl'
   * @memberof SeaFreightComponent
   */
  getDraftRates(type) {
    // loading(true)
    this.draftloading = true
    this._seaFreightService.getAllDrafts(type, this.userProfile.ProviderID, '').subscribe((res: any) => {
      this.draftloading = false
      if (res.returnObject) {
        if (type === 'fcl') {
          this.allSeaDraftRatesByFCL = changeCase(res.returnObject, 'pascal')
          this.draftsfcl = changeCase(res.returnObject, 'pascal')
          this.draftsfcl = this.draftsfcl.reverse()
        } else if (type === 'lcl') {
          this.allSeaDraftRatesByLCL = changeCase(res.returnObject, 'pascal')
          this.draftslcl = changeCase(res.returnObject, 'pascal')
          this.draftslcl = this.draftslcl.reverse()
        }
      }
      loading(false)
    }, (err: any) => {
      loading(false)
    })
  }

  /**
   *
   * Get Ports List
   * @memberof SeaFreightComponent
   */
  getPortsData() {
    loading(true)
    this._manageRatesService.getPortsData().subscribe((res: any) => {
      loading(false)
      this.allPorts = res;
      localStorage.setItem("PortDetails", JSON.stringify(res));
    }, (err: HttpErrorResponse) => {
      loading(false)
    })
  }

  /**
   *
   * Get All Containers
   * @memberof SeaFreightComponent
   */
  getContainersMapping() {
    loading(true)
    this._manageRatesService.getContainersMapping().subscribe((res: any) => {
      loading(false)
      this.allContainers = res.returnObject;
      localStorage.setItem('containers', JSON.stringify(this.allContainers))
    }, (err: any) => {
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
    if (event.type === 'publishFCL') {
      if (typeof event.list[0] === 'object') {
        if (event.list[0].type === 'history') {
          if (event.list[0].load === 'FCL') {
            this.rateHistory(event.list[0].id, 'Rate_FCL')
          } else if (event.list[0].load === 'LCL') {
            this.rateHistory(event.list[0].id, 'Rate_LCL')
          }
        }
      } else {
        this.delPublishRates = event.list
      }
    } else if (event.type === 'draftFCL') {
      if (typeof event.list[0] === 'object') {
        if (event.list[0].type === 'delete') {
          if (event.list[0].load === 'LCL') {
            this.deleteRowLCL(event.list[0].id)
          } else if (event.list[0].load === 'FCL') {
            this.deleteRow(event.list[0].id)
          }
        } else if (event.list[0].type === 'edit') {
          this.updatePopupRates(event.list[0].id, event.list[0].load)
        }
      } else {
        this.publishRates = event.list;
      }
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
    this.getAllPublishRates(type)
  }

  /**
   * PAGING EVENT EMITTER OBSERVABLE FOR UI TABLE
   *
   * @param {string} type //fcl or lcl
   * @param {number} event //page number 0,1,2...
   * @memberof SeaFreightComponent
   */
  paging(type, event) {
    this.pageNo = event;
    this.getAllPublishRates(type)
  }

  /**
   *
   * FILTER BUTTON ACTION
   * @param {string} type //fcl or lcl
   * @memberof SeaFreightComponent
   */
  filterRecords(type) {
    this.getAllPublishRates(type)
  }

  /**
   *
   * TAB CHANGE TRIGGER ACTION
   * @param {string} event //active tab either fcl or lcl
   * @memberof SeaFreightComponent
   */
  onTabChange(event) {
    if (event === 'activeLCL') {
      this.getAllPublishRates('lcl')
      this.getDraftRates('lcl')
    } else if (event === 'activeFCL') {
      this.getAllPublishRates('fcl')
      this.getDraftRates('fcl')
    }
  }

}
