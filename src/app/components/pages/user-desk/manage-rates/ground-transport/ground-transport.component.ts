import { Component, OnInit, ViewChild, ViewEncapsulation, ElementRef, Renderer2, OnDestroy, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
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
import { SharedService } from '../../../../../services/shared.service';
import { baseExternalAssets } from '../../../../../constants/base.url';
import { ConfirmDeleteDialogComponent } from '../../../../../shared/dialogues/confirm-delete-dialog/confirm-delete-dialog.component';
import * as moment from 'moment';
import { SeaRateDialogComponent } from '../../../../../shared/dialogues/sea-rate-dialog/sea-rate-dialog.component';
import { GroundTransportService } from './ground-transport.service';
import { NgbDateFRParserFormatter } from '../../../../../constants/ngb-date-parser-formatter';
import { ManageRatesService } from '../manage-rates.service';
import { ToastrService } from 'ngx-toastr';
import { RateValidityComponent } from '../../../../../shared/dialogues/rate-validity/rate-validity.component';
import { RateHistoryComponent } from '../../../../../shared/dialogues/rate-history/rate-history.component';
import { HttpErrorResponse } from '@angular/common/http';
import { loading, getImagePath, ImageRequiredSize, ImageSource, changeCase, removeDuplicates } from '../../../../../constants/globalFunctions';
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
  selector: 'app-ground-transport',
  templateUrl: './ground-transport.component.html',
  styleUrls: ['./ground-transport.component.scss'],
  encapsulation: ViewEncapsulation.None,
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
export class GroundTransportComponent implements OnInit, OnDestroy, AfterViewChecked {

  public rateValidityText = "Edit Rate / Validity";
  public activeTab = "activeFTL";
  private draftRates: any;
  private addnsaveRates: any;
  public dtOptionsByGround: DataTables.Settings | any = {};
  public dtOptionsByGroundDraft: DataTables.Settings | any = {};
  public dtOptionsByGroundDraftFTL: DataTables.Settings | any = {};
  @ViewChild('draftBYGround') tabledraftByGround;
  @ViewChild('draftBYGroundFTL') tabledraftByGroundFTL;
  @ViewChild('publishByground') tablepublishByGround;
  @ViewChild("dp") input: NgbInputDatepicker;
  @ViewChild('rangeDp') rangeDp: ElementRef;

  public dataTablepublishByground: any;
  public dataTabledraftByground: any;
  public dataTabledraftBygroundFTL: any;
  public allRatesList: any;
  public publishloading: boolean;
  public draftloading: boolean = false;
  public draftloadingFTL: boolean = true;
  public allCargoType: any[] = []
  public allContainersType: any[] = [];
  public allHandlingType: any[] = [];
  public allPorts: any[] = [];
  public allCurrencies: any[] = [];
  private draftRatesByGround: any[] = [];
  private draftDataBYGround: any[] = [];
  private draftRatesByGroundFTL: any[] = [];
  private draftDataBYGroundFTL: any[] = [];
  public draftslist: any[] = [];
  public draftslistFTL: any[] = [];
  public delPublishRates: any[] = [];
  public publishRates: any[] = [];
  public publishRatesFTL: any[] = [];
  public filterOrigin: any = {};
  public filterDestination: any = {};
  public startDate: NgbDateStruct;
  public maxDate: NgbDateStruct;
  public minDate: NgbDateStruct;
  public hoveredDate: NgbDateStruct;
  public fromDate: any;
  public toDate: any;
  public model: any;

  private _subscription: Subscription;
  private _selectSubscription: Subscription;

  public userProfile: any;

  // filterartion variable;

  public filterbyShippingLine;
  public filterbyCargoType;
  public filterbyContainerType;
  public filterbyMode;
  public checkedallpublishRates: boolean = false;
  public checkedalldraftRates: boolean = false;
  public checkedalldraftRatesFTL: boolean = false;

  // term and condition
  public disable: boolean;
  public editorContent: any;
  private toolbarOptions = [
    ['bold', 'italic', 'underline'],        // toggled buttons

    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'script': 'sub' }, { 'script': 'super' }],      // superscript/subscript
    [{ 'direction': 'rtl' }],                         // text direction

    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

    [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
    [{ 'align': [] }],

    ['clean']                                         // remove formatting button
  ];
  public editorOptions = {
    placeholder: "insert content...",
    modules: {
      toolbar: this.toolbarOptions
    }
  };


  isHovered = date =>
    this.fromDate && !this.toDate && this.hoveredDate && after(date, this.fromDate) && before(date, this.hoveredDate)
  isInside = date => after(date, this.fromDate) && before(date, this.toDate);
  isFrom = date => equals(date, this.fromDate);
  isTo = date => equals(date, this.toDate);
  constructor(
    private modalService: NgbModal,
    private _seaFreightService: GroundTransportService,
    private _manageRatesService: ManageRatesService,
    private _sharedService: SharedService,
    private element: ElementRef,
    private renderer: Renderer2,
    private _parserFormatter: NgbDateParserFormatter,
    private _toast: ToastrService,
    private _manageRateService: ManageRatesService,
    private cdRef: ChangeDetectorRef
  ) { }


  ngOnInit() {
    let userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo && userInfo.returnText) {
      this.userProfile = JSON.parse(userInfo.returnText);
    }
    this.startDate = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
    this.maxDate = { year: now.getFullYear() + 1, month: now.getMonth() + 1, day: now.getDate() };
    this.minDate = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
    this.getAllPublishRates('FTL');
    this.allservicesByGround();

    this._sharedService.termNcondGround.subscribe(state => {
      if (state) {
        this.editorContent = state;
      }
    })
    this.getDraftRates('ground', 'FTL')
    this.getPortsData()
    this.getAllCustomers(this.userProfile.ProviderID)
    this.getAdditionalData()
    this.getDropdownsList()
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ngOnDestroy() {
  }

  clearFilter(event) {
    event.preventDefault();
    event.stopPropagation();
    this.model = {};
    this.fromDate = {};
    this.toDate = {};
    this.isCustomer = false
    this.isMarketplace = false;
    this.filterbyContainerType = 'undefined';
    this.filterbyMode = 'undefined';
    this.filterDestination = {};
    this.filterOrigin = {};
    this.filter()
  }
  filter() {
    this.getAllPublishRates('fcl')
  }

  addRatesManually(activeTab) {
    let type = (activeTab === 'activeFCL' ? 'FCL-Ground' : 'FTL')
    this.updatePopupRates(0, type);
  }
  onEditorBlured(quill) {
  }

  onEditorFocused(quill) {
  }

  onEditorCreated(quill) {
  }
  onContentChanged({ quill, html, text }) {
    this.editorContent = html
  }


  updatePopupRates(rowId, type) {
    console.log(this.draftslistFTL);
    let obj;
    if (this.activeTab == 'activeFCL') {
      if (rowId > 0) {
        obj = this.draftslist.find(elem => elem.Id == rowId);
      } else {
        obj = null
      }
    }
    else if (this.activeTab == 'activeFTL') {
      if (rowId > 0) {
        obj = this.draftslistFTL.find(elem => elem.Id == rowId);
      } else {
        obj = null
      }
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
        this.setAddDraftData(result[0].containerLoadType, result);
        this.getDraftRates('ground', type)
        this.getAllPublishRates('ftl')
      }
    });

    let object = {
      ID: rowId,
      forType: (type === 'FCL' ? 'FCL-Ground' : type),
      data: obj,
      addList: this.groundCharges,
      drafts: (Object.entries(this.draftslistFTL).length === 0 && this.draftslistFTL.constructor === Object ? null : this.draftslistFTL),
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
   * Setting Data in Drafts Tabls
   * @param {*} type
   * @param {*} data
   * @memberof GroundTransportComponent
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
        this.draftslist.forEach(e => {
          if (e.ProviderPricingDraftID === element.providerPricingDraftID) {
            let idx = this.draftslist.indexOf(e)
            this.draftslist.splice(idx, 1)
          }
        })
        this.draftslist.unshift(dataObj)
      } else if (type === 'LCL') {
        this.draftslistFTL.forEach(e => {
          if (e.ConsolidatorPricingDraftID === element.ConsolidatorPricingDraftID) {
            let idx = this.draftslistFTL.indexOf(e)
            this.draftslistFTL.splice(idx, 1)
          }
        })
        this.draftslistFTL.unshift(dataObj)
      }
    });
  }


  addAnotherRates() {
    this.addRatesManually(this.activeTab);
  }
  addRatesBygroundManually() {
    if (this.activeTab == 'activeFCL') {
      if ((!this.draftRatesByGround || (this.draftRatesByGround && !this.draftRatesByGround.length)) && (!this.draftDataBYGround || (this.draftDataBYGround && !this.draftDataBYGround.length))) {
        this.addRatesManually(this.activeTab);
      }
    }
    else if (this.activeTab == 'activeFTL') {
      if ((!this.draftRatesByGroundFTL || (this.draftRatesByGroundFTL && !this.draftRatesByGroundFTL.length)) && (!this.draftDataBYGroundFTL || (this.draftDataBYGroundFTL && !this.draftDataBYGroundFTL.length))) {
        this.addRatesManually(this.activeTab);
      }
    }
  }


  filterBydate(date) {
    if (!date && this.fromDate && this.toDate) {
      this.fromDate = null;
      this.toDate = null;
    }
    else {
      return;
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
    // if (this.fromDate && this.fromDate.month && this.toDate && this.toDate.month) {
    //   this.getAllPublishRates('fcl');
    // }
  }

  allservicesByGround() {
    this.draftRates = this._sharedService.dataLogisticServiceBySea.subscribe(state => {
      if (state && state.length) {
        for (let index = 0; index < state.length; index++) {
          if (state[index].LogServName == "SEA") {
            if (state[index].TCGround) {
              this.editorContent = state[index].TCGround;
              this.disable = true;
            }
            if (state[index].DraftDataGround && state[index].DraftDataGround.length) {
            }
          }
        }
      }
    })
  }

  filterByroute(obj) {
    if (typeof obj == 'object') {
      // this.getAllPublishRates();
    }
    else if (!obj) {
      // this.getAllPublishRates();
    }
    else {
      return;
    }

  }
  filtertionPort(obj) {
    // if ((typeof obj == "object" && Object.keys(obj).length) || (typeof obj == "string" && obj)) this.getAllPublishRates('fcl');

  }

  public sortColumn: string = 'EffectiveFrom'
  public sortColumnDirection: string = 'ASC'
  public isCustomer: boolean = false
  public isMarketplace: boolean = false
  public pageNo: number = 1;
  public pageSize: number = 5;
  public totalPublishedRecords: number;
  public filteredRecords: number;
  getAllPublishRates(type?, number?) {
    if (this.filteredRecords === 1) {
      this.pageNo = this.pageNo - 1
    }

    this.publishloading = true;
    let obj = {
      providerID: this.userProfile.ProviderID,
      pageNo: number ? number : ((this.pageNo < 1) ? 1 : this.pageNo),
      pageSize: this.pageSize,
      mode: this.filterbyMode,
      containerSpecID: (this.filterbyContainerType == 'undefined') ? null : parseInt(this.filterbyContainerType),
      polID: (this.filterOrigin && this.filterOrigin.id) ? this.filterOrigin.id : null,
      podID: (this.filterDestination && this.filterDestination.id) ? this.filterDestination.id : null,
      polType: (this.filterOrigin && this.filterOrigin.id) ? this.filterOrigin.type : null,
      podType: (this.filterDestination && this.filterDestination.id) ? this.filterDestination.type : null,
      effectiveFrom: (this.fromDate && this.fromDate.month) ? this.fromDate.month + '/' + this.fromDate.day + '/' + this.fromDate.year : null,
      effectiveTo: (this.toDate && this.toDate.month) ? this.toDate.month + '/' + this.toDate.day + '/' + this.toDate.year : null,
      customerID: (this.filterbyCustomer ? parseInt(this.filterbyCustomer) : null),
      customerType: (this.isCustomer ? 'CUSTOMER' : (this.isMarketplace ? 'MARKETPLACE' : null)),
      containerLoadType: this.filteredType,
      sortColumn: this.sortColumn,
      sortColumnDirection: this.sortColumnDirection
    }
    this._seaFreightService.getAllrates(obj).subscribe((res: any) => {
      this.publishloading = false;
      if (res.returnId > 0) {
        this.totalPublishedRecords = res.returnObject.recordsTotal
        this.allRatesList = res.returnObject.data;
        this.checkedallpublishRates = false;
        this.publishloading = false;
        this.filteredRecords = res.returnObject.recordsFiltered
      }
    })

  }

  filterTable() {
    this.dtOptionsByGround = {
      data: this.allRatesList,
      columns: [
        {
          title: '<div class="fancyOptionBoxes"> <input id = "selectallpublishRates" type = "checkbox"> <label for= "selectallpublishRates"> <span> </span></label></div>',
          data: function (data) {
            return '<div class="fancyOptionBoxes"> <input id = "' + data.id + '-' + data.transportType + '" type = "checkbox"> <label for= "' + data.id + '-' + data.transportType + '"> <span> </span></label></div>';
          }
        },
        {
          title: 'ORIGIN / DEPARTURE',
          data: function (data) {
            let polUrl = '../../../../../../assets/images/flags/4x3/' + data.polCode.split(' ').shift().toLowerCase() + '.svg';
            let podUrl = '../../../../../../assets/images/flags/4x3/' + data.podCode.split(' ').shift().toLowerCase() + '.svg';
            const arrow = '../../../../../../assets/images/icons/grid-arrow.svg';
            return "<div class='row'> <div class='col-5 text-truncate' ><img src='" + polUrl + "' class='icon-size-22-14 mr-2' />" + data.polName + "</div> <div class='col-2'><img src='" + arrow + "' /></div> <div class='col-5 text-truncate'><img src='" + podUrl + "' class='icon-size-22-14 mr-2' />" + data.podName + "</div> </div>";
          },
          className: "routeCell"
        },
        {
          title: 'CARGO TYPE',
          data: 'shippingCatName',
        },
        {
          title: 'MODE',
          data: function (data) {
            let string = data.transportType.toLowerCase();
            return string.charAt(0).toUpperCase() + string.slice(1);
          }
        },
        {
          title: 'SIZE',
          data: 'size',
        },
        {
          title: 'RATE',
          data: function (data) {
            return (Number(data.priceWithCode.split(' ').pop())).toLocaleString('en-US', {
              style: 'currency',
              currency: data.priceWithCode.split(' ').shift(),
            });
          },
        },
        {
          title: 'RATE VALIDITY',
          data: function (data) {
            return moment(data.effectiveFrom).format('D MMM, Y') + ' to ' + moment(data.effectiveTo).format('D MMM, Y')
          }
        },
        {
          title: '',
          data: function (data) {
            let url = '../../../../../../assets/images/icons/menu.svg';
            return "<img id = '" + data.id + '-' + data.transportType + "'  src='" + url + "' class='icon-size-16 pointer' />";
          },
          className: 'moreOption'
        }
      ],
      drawCallback: function () {
        let $api = this.api();
        let pages = $api.page.info().pages;
        if (pages === 1 || !pages) {
          $('.publishRateGround .dataTables_paginate').hide();
        } else {
          // SHow everything
          $('.publishRateGround .dataTables_paginate').show();
        }
      },
      // retrieve: true,
      destroy: true,
      // pagingType: 'full_numbers',
      pageLength: 5,
      scrollX: true,
      scrollY: '60vh',
      scrollCollapse: true,
      searching: false,
      lengthChange: false,
      responsive: true,
      order: [[1, "asc"]],
      language: {
        paginate: {
          next: '<img src="../../../../../../assets/images/icons/icon_arrow_right.svg" class="icon-size-16">',
          previous: '<img src="../../../../../../assets/images/icons/icon_arrow_left.svg" class="icon-size-16">'
        },
        infoEmpty: '',
        // emptyTable: "No data available in table"
      },
      fixedColumns: {
        leftColumns: 0,
        rightColumns: 1
      },
      columnDefs: [
        {
          targets: 0,
          width: 'auto',
          orderable: false,
        },
        {
          targets: 1,
          width: '235'
        },
        {
          targets: -1,
          width: '12',
          orderable: false,
        },
        {
          targets: -2,
          width: '200',
        },
        {
          targets: "_all",
          width: "150"
        }
      ]
    };
  }

  orgfilter() {
    if (this.filterOrigin && typeof this.filterOrigin == "object" && Object.keys(this.filterOrigin).length) {
      return this.filterOrigin;
    }
    else if (this.filterOrigin && typeof this.filterOrigin == "string") {
      return -1;
    }
    else if (!this.filterOrigin) {
      return null;
    }

  }
  destfilter() {
    if (this.filterDestination && typeof this.filterDestination == "object" && Object.keys(this.filterDestination).length) {
      return this.filterDestination;
    }
    else if (this.filterDestination && typeof this.filterDestination == "string") {
      return -1;
    }
    else if (!this.filterDestination) {
      return null;
    }

  }

  discardDraft() {
    let discardarr = [];
    if (this.activeTab == "activeFCL") {
      this.draftslist.forEach(elem => {
        let obj = {
          draftID: elem.Id,
          transportType: 'TRUCK',
        }
        discardarr.push(obj)
      })
    }
    else if (this.activeTab == "activeFTL") {
      this.draftslistFTL.forEach(elem => {
        let obj = {
          draftID: elem.Id,
          transportType: 'TRUCK',
        }
        discardarr.push(obj)
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
        if (this.activeTab == "activeFCL") {
          this.draftslist = [];
          this.draftRatesByGround = [];
          this.draftDataBYGround = [];
          this.publishRates = [];
          this.getDraftRates('ground', 'FCL')
        }
        else if (this.activeTab == "activeFTL") {
          this.draftslistFTL = [];
          this.draftRatesByGroundFTL = [];
          this.draftDataBYGroundFTL = [];
          this.publishRatesFTL = [];
          this.getDraftRates('ground', 'FTL')
        }
      }
    }, (reason) => {
      // console.log("reason");
    });
    let obj = {
      data: discardarr,
      type: "draftGround"
    }
    modalRef.componentInstance.deleteIds = obj;
    setTimeout(() => {
      if (document.getElementsByTagName('body')[0].classList.contains('modal-open')) {
        document.getElementsByTagName('html')[0].style.overflowY = 'hidden';
      }
    }, 0);
  }



  delPubRecord() {
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
          // this.filterTable();
        }
        else {
          for (var i = 0; i < this.delPublishRates.length; i++) {
            for (let y = 0; y < this.allRatesList.length; y++) {
              if (this.delPublishRates[i] == this.allRatesList[y].id) {
                this.allRatesList.splice(y, 1);
              }
            }
          }
          if (i == this.delPublishRates.length) {
            // this.filterTable();
            this.delPublishRates = [];
          }
        }
        this.getAllPublishRates('FTL')
      }
    }, (reason) => {
      // console.log("reason");
    });
    let obj = {
      data: this.delPublishRates,
      type: "publishRateGround"
    }
    modalRef.componentInstance.deleteIds = obj;
    setTimeout(() => {
      if (document.getElementsByTagName('body')[0].classList.contains('modal-open')) {
        document.getElementsByTagName('html')[0].style.overflowY = 'hidden';
      }
    }, 0);
  }

  deletepublishRecord() {
    this.delPubRecord()
  }

  publishRate(type) {
    let param;
    loading(true)
    try {
      if (type === 'fcl') {
        param = {
          pricingIDList: (this.draftslist.length === this.publishRates.length) ? [-1] : this.publishRates,
          providerID: this.userProfile.ProviderID,
          containerLoadType: type.toUpperCase()
        }
      } else if (type === 'ftl') {
        param = {
          pricingIDList: (this.draftslistFTL.length === this.publishRates.length) ? [-1] : this.publishRates,
          providerID: this.userProfile.ProviderID,
          containerLoadType: type.toUpperCase()
        }
      }
    } catch (error) {
      loading(false)
    }
    this._seaFreightService.publishDraftRate(param).subscribe((res: any) => {
      loading(false)
      if (res.returnStatus == "Success") {
        for (var i = 0; i < this.publishRates.length; i++) {
          for (let y = 0; y < this.draftslist.length; y++) {
            if (this.draftslist[y].ID == this.publishRates[i].draftID) {
              this.draftslist.splice(y, 1);
            }
          }
        }
        this._toast.success(res.returnText, 'Success')
        if (this.publishRates.length == i) {
          this.checkedalldraftRates = false;
          this.publishRates = [];
          this.getDraftRates('ground', type.toUpperCase())
          this.getAllPublishRates(type.toUpperCase());
        }
      } else {
        this._toast.error(res.returnText, 'Publish Failed')
      }
    }, (error: HttpErrorResponse) => {
      loading(false)
      this._toast.error('Failed to publish records', 'Publish Failed')
      console.warn(error.message)
    })
  }

  ports = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      map(term => (!term || term.length < 3) ? []
        : this.allPorts.filter(v => v.PortName.toLowerCase().indexOf(term.toLowerCase()) > -1))
    )
  formatter = (x: { PortName: string }) => x.PortName;

  portsFilter = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      map(term => (!term || term.length < 3) ? []
        : this.citiesPorts.filter(v => v.title.toLowerCase().indexOf(term.toLowerCase()) > -1 || v.shortName.toLowerCase().indexOf(term.toLowerCase()) > -1 || v.code.toLowerCase().indexOf(term.toLowerCase()) > -1))
    )
  filterPortsFormatter = (x: { title: string }) => x.title;

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
        if (this.activeTab == "activeFCL") {
          this.draftDataBYGround = this.draftslist;
          this.getDraftRates('ground', 'FCL')
          this.publishRates = [];
        }
        else if (this.activeTab == "activeFTL") {
          this.getDraftRates('ground', 'FTL')
          this.publishRates = [];
        }
      }
    }, (reason) => {
    });
    let obj = {
      data: [{
        draftID: id,
        transportType: (this.activeTab == 'activeFCL') ? "GROUND" : "TRUCK",
      }],
      type: "draftGroundRate"
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
   * RATE VALIDITY POPUP
   * @returns
   * @memberof GroundTransportComponent
   */
  rateValidity() {
    if (!this.delPublishRates.length) return;
    let updateValidity = [];
    for (let i = 0; i < this.allRatesList.length; i++) {
      for (let y = 0; y < this.delPublishRates.length; y++) {
        if (this.allRatesList[i].id == this.delPublishRates[y]) {
          updateValidity.push(this.allRatesList[i])
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
        if (result) {
          this.getAllPublishRates('FCL');
          this.checkedallpublishRates = false
          this.delPublishRates = [];
        }
      });
      let obj = {
        data: updateValidity,
        type: "rateValidityGROUND"
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
        if (result) {
          this.getAllPublishRates('FTL');
          this.checkedallpublishRates = false
          this.delPublishRates = [];
        }
      });
      let object = {
        ID: updateValidity[0].id,
        forType: (this.activeTab === 'activeFCL' ? 'FCL' : 'FTL'),
        data: updateValidity,
        addList: this.groundCharges,
        customers: this.allCustomers,
        drafts: this.draftslistFTL,
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


  /**
   *
   * RATE HISTORY POPUP
   * @param {*} recId
   * @param {*} fortype
   * @param {*} mode
   * @memberof GroundTransportComponent
   */
  rateHistory(recId, fortype, mode) {
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
      transportType: mode
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
   * SAVE TERMS & CONDITIONS
   * @memberof GroundTransportComponent
   */
  saveTermNcond() {
    let obj = {
      providerID: this.userProfile.ProviderID,
      termsAndConditions: this.editorContent,
      transportType: "GROUND",
      modifiedBy: this.userProfile.LoginID
    }
    this._manageRatesService.termNCondition(obj).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        this._sharedService.termNcondGround.next(this.editorContent);
        this._toast.success("Term and Condition saved Successfully", "");
        this.disable = true;
      }
    })
  }

  // NEW GROUND WORKING
  getPortsData() {
    this._manageRatesService.getPortsData('GROUND').subscribe((res: any) => {
      let ports = JSON.parse(localStorage.getItem("PortDetails"));
      localStorage.setItem("PortDetails", JSON.stringify(ports.concat(res)));
    }, (err: HttpErrorResponse) => {
      loading(false)
    })
  }

  public allCustomers: any[] = []
  public groundCharges: any[] = []
  /**
   *
   * Getting list of all customers
   * @param {number} ProviderID
   * @memberof SeaFreightComponent
   */
  getAllCustomers(ProviderID) {
    this._manageRatesService.getAllCustomers(ProviderID).subscribe((res: any) => {
      if (res.returnId > 0) {
        this.allCustomers = res.returnObject
        this.allCustomers.forEach(e => {
          e.CustomerImageParsed = getImagePath(ImageSource.FROM_SERVER, e.CustomerImage, ImageRequiredSize._48x48)
        })
      }
    }, (err) => {
    })
  }

  /**
   *
   * Getting all additional charges list
   * @memberof GroundTransportComponent
   */
  getAdditionalData() {
    loading(true)
    this._manageRatesService.getAllAdditionalCharges(this.userProfile.ProviderID).subscribe((res: any) => {
      this.groundCharges = res.filter(e => e.modeOfTrans === 'TRUCK' && e.addChrType === 'ADCH')
      loading(false)
    }, (err) => {
      console.log(err);
    })
  }


  /**
   *
   * Emitter for checkboxes in table
   * @param {*} event
   * @memberof GroundTransportComponent
   */
  tableCheckedRows(event) {
    if (event.type === 'publishFCL') {
      if (typeof event.list[0] === 'object') {
        if (event.list[0].type === 'history') {
          if (event.list[0].load === 'FCL') {
            this.rateHistory(event.list[0].id, 'Rate_FCL', 'FCL')
          } else if (event.list[0].load === 'FTL') {
            this.rateHistory(event.list[0].id, 'Rate_FTL', 'FTL')
          }
        }
      } else {
        this.delPublishRates = event.list
      }
    } else if (event.type === 'draftFCL') {
      if (typeof event.list[0] === 'object') {
        if (event.list[0].type === 'delete') {
          this.deleteRow(event.list[0].id)
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
   * Emitter for sorting columns
   * @param {*} type
   * @param {*} event
   * @memberof GroundTransportComponent
   */
  sortedFilters(type, event) {
    this.sortColumn = event.column
    this.sortColumnDirection = event.direction
    this.getAllPublishRates(type)
  }

  /**
   *
   * Emitter for Paging
   * @param {*} type
   * @param {*} event
   * @memberof GroundTransportComponent
   */
  paging(type, event) {
    this.pageNo = event;
    this.getAllPublishRates(type)
  }

  public filterbyCustomer;
  public fromType: string = ''
  filterRecords(type) {
    this.getAllPublishRates('FTL', 1)
  }

  public filteredType = null
  filterContainerChange(obj) {
    if (obj === 'all') {
      this.filteredType = null
    } else {
      let container = this.allContainersType.find(container => container.ContainerSpecID === parseInt(obj))
      this.filteredType = container.ContainerSpecGroupName === 'Container' ? 'FCL' : 'FTL'
    }
  }

  onTabChange(event) {
    if (event === 'activeFTL') {
      this.getAllPublishRates('FTL')
      this.getDraftRates('ground', 'FTL')
      this.publishRates = []
    } else if (event === 'activeFCL') {
      this.getAllPublishRates('FCL')
      this.getDraftRates('ground', 'FCL')
      this.publishRates = []
    }
  }


  /**
   *
   * Get All Draft Rates for FCL/FTL
   * @param {*} type
   * @memberof GroundTransportComponent
   */
  getDraftRates(type, containerLoad) {
    containerLoad = 'FTL'
    this.draftloading = true
    this._manageRatesService.getAllDrafts(type, this.userProfile.ProviderID, containerLoad).subscribe((res: any) => {
      console.log(res);

      this.draftloading = false
      if (res.returnId > 0) {
        if (containerLoad === 'FCL') {
          this.draftslist = (res.returnObject ? changeCase(res.returnObject, 'pascal') : [])
        } else if (containerLoad === 'FTL') {
          this.draftslistFTL = changeCase(res.returnObject, 'pascal')
        }
      }
      loading(false)
    }, (err: any) => {
      loading(false)
    })
  }



  public combinedContainers = []
  public allContainers = []
  public selectedFCLContainers = []
  public shippingCategories = []
  public cities: any[] = []
  public combinedPorts: any[] = []
  public groundPorts: any = []
  public citiesPorts: any = []
  public serviceCities: any[] = []

  /**
   * FILLIN DROPDOWN DETAILS
   *
   * @memberof GroundTransportComponent
   */
  getDropdownsList() {
    this._sharedService.cityList.subscribe((state: any) => {
      if (state) {
        this.serviceCities = state;
      }
    });
    this.allPorts = JSON.parse(localStorage.getItem('PortDetails'))
    loading(true)
    this._manageRateService.getPortsData('ground').subscribe((res: any) => {
      loading(false)
      this.groundPorts = res;
      this.combinedPorts = this.allPorts.concat(this.groundPorts)
      this.combinedPorts = removeDuplicates(this.combinedPorts, 'PortID')
      localStorage.setItem('PortDetails', JSON.stringify(this.combinedPorts))
      this.combinedPorts.forEach(e => {
        e.title = e.PortName
        e.id = e.PortID
        e.imageName = e.CountryCode
        e.type = e.PortType
        e.code = e.PortCode
        e.shortName = e.PortShortName
      })
      this.citiesPorts = this.combinedPorts.concat(this.cities)
    })
    this.combinedContainers = JSON.parse(localStorage.getItem('containers'))
    this.allContainersType = this.combinedContainers.filter(e => e.ContainerFor === 'FTL' && e.ShippingCatName === 'Goods')
  }

}
