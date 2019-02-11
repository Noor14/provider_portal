import { Component, OnInit, ViewChild, ViewEncapsulation, ElementRef, Renderer2, QueryList, AfterViewInit, OnDestroy } from '@angular/core';
import {
  NgbDatepicker,
  NgbInputDatepicker,
  NgbDateStruct,
  NgbCalendar,
  NgbDateAdapter,
  NgbDateParserFormatter,
  NgbModal
} from '@ng-bootstrap/ng-bootstrap';
import { trigger, state, animate, transition, style } from '@angular/animations';
import { DiscardDraftComponent } from '../../../../../shared/dialogues/discard-draft/discard-draft.component';
import { Observable, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { SeaFreightService } from './sea-freight.service';
import { SharedService } from '../../../../../services/shared.service';
import { baseExternalAssets } from '../../../../../constants/base.url';
import { ConfirmDeleteDialogComponent } from '../../../../../shared/dialogues/confirm-delete-dialog/confirm-delete-dialog.component';
// import { NgModel } from '@angular/forms';
import * as moment from 'moment';
// import { DataTableDirective } from 'angular-datatables';
import { SeaRateDialogComponent } from '../../../../../shared/dialogues/sea-rate-dialog/sea-rate-dialog.component';
import { NgbDateFRParserFormatter } from '../../../../../constants/ngb-date-parser-formatter';
import { ManageRatesService } from '../manage-rates.service';
import { FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { RateValidityComponent } from '../../../../../shared/dialogues/rate-validity/rate-validity.component';
import { RateHistoryComponent } from '../../../../../shared/dialogues/rate-history/rate-history.component';
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

  private draftRates: any;
  private addnsaveRates: any;
  private addnsaveRatesLCL: any;
  public dtOptionsBySeaFCL: DataTables.Settings | any = {};
  public dtOptionsBySeaLCL: DataTables.Settings | any = {};
  public dtOptionsBySeaFCLDraft: DataTables.Settings | any = {};
  public dtOptionsBySeaLCLDraft: DataTables.Settings | any = {};
  @ViewChild('draftBYsea') tabledraftBySea;
  @ViewChild('draftBYseaLCL') tabledraftBySeaLCL;
  @ViewChild('publishBysea') tablepublishBySea;
  @ViewChild('publishByseaLcl') tablepublishBySeaLcl;
  @ViewChild("dp") input: NgbInputDatepicker;
  @ViewChild("dpLCL") inputLCL: NgbInputDatepicker;
  // @ViewChild(NgModel) datePick: NgModel;
  @ViewChild('rangeDp') rangeDp: ElementRef;
  @ViewChild('rangeDpLCL') rangeDpLCL: ElementRef;
  // @ViewChild(DataTableDirective) dtElement: DataTableDirective;

  public rateValidityTextFCL = "Edit Rate / Validity"
  public rateValidityTextLCL = "Edit Rate / Validity"
  public activeTab = "activeFCL"
  public dataTablepublishBysea: any;
  public dataTablepublishByseaLcl: any;
  public dataTabledraftBysea: any;
  public dataTabledraftByseaLCL: any;
  public allRatesList: any;
  public allRatesListLcL: any;
  public publishloading: boolean;
  public publishloadingLcl: boolean;
  public draftloading: boolean = true;
  public draftloadingLCL: boolean = true;
  public allShippingLines: any[] = [];
  public allCargoType: any[] = []
  public allContainersType: any[] = [];
  public allHandlingType: any[] = [];
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
  public filterOriginLcl: any = {};
  public filterDestinationLcl: any = {};
  public startDate: NgbDateStruct;
  public maxDate: NgbDateStruct;
  public minDate: NgbDateStruct;
  public maxDateLCL: NgbDateStruct;
  public minDateLCL: NgbDateStruct;
  public hoveredDate: NgbDateStruct;
  public hoveredDateLCL: NgbDateStruct;
  public fromDate: any;
  public toDate: any;
  public fromDateLCL: any;
  public toDateLCL: any;
  public model: any;
  public modelLCL: any;

  private _subscription: Subscription;
  private _selectSubscription: Subscription;

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
    private _toast: ToastrService
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
    this.getAllPublishRatesLcl();
    this.getAllPublishRates();
    this.allservicesBySea();
    this.addnsaveRates = this._sharedService.draftRowFCLAdd.subscribe(state => {
      if (state && Object.keys(state).length) {
        this.setRowinDRaftTable(state, 'popup not open');
      }
    })
    this.addnsaveRatesLCL = this._sharedService.draftRowLCLAdd.subscribe(state => {
      if (state && Object.keys(state).length) {
        this.setRowinDRaftTableLCL(state, 'popup not open');
      }
    })
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
    this.draftRates.unsubscribe();
    this.addnsaveRates.unsubscribe();
    this.addnsaveRatesLCL.unsubscribe();
  }


  onEditorBlured(quill, type) {
  }

  onEditorFocused(quill, type) {
  }

  onEditorCreated(quill, type) {
  }
  onContentChanged({ quill, html, text }, type) {
    if (type="FCL"){
      this.editorContentFCL = html

    }
    else{
      this.editorContentLCL = html

    }
  }


  clearFilter(event, type) {
    event.preventDefault();
    event.stopPropagation();
    if (type == "FCL") {
      if ((this.filterbyShippingLine && this.filterbyShippingLine != 'undefined') ||
        (this.filterbyCargoType && this.filterbyCargoType != 'undefined') ||
        (this.filterbyContainerType && this.filterbyContainerType != 'undefined') ||
        (this.filterDestination && Object.keys(this.filterDestination).length) ||
        (this.filterOrigin && Object.keys(this.filterOrigin).length) ||
        (this.fromDate && Object.keys(this.fromDate).length) ||
        (this.toDate && Object.keys(this.toDate).length)
      ) {
        this.filterbyShippingLine = 'undefined';
        this.filterbyCargoType = 'undefined';
        this.filterbyContainerType = 'undefined';
        this.model = null;
        this.fromDate = null;
        this.toDate = null;
        this.filterDestination = {};
        this.filterOrigin = {};
        this.filter();
      }
    }
    else if (type == "LCL") {
      if (
        (this.filterbyCargoTypeLcl && this.filterbyCargoTypeLcl != 'undefined') ||
        (this.filterbyHandlingType && this.filterbyHandlingType != 'undefined') ||
        (this.filterDestinationLcl && Object.keys(this.filterDestinationLcl).length) ||
        (this.filterOriginLcl && Object.keys(this.filterOriginLcl).length) ||
        (this.fromDateLCL && Object.keys(this.fromDateLCL).length) ||
        (this.toDateLCL && Object.keys(this.toDateLCL).length)
      ) {
        this.modelLCL = null;
        this.fromDateLCL = null;
        this.toDateLCL = null;
        this.filterbyCargoTypeLcl = 'undefined';
        this.filterbyHandlingType = 'undefined';
        this.filterDestinationLcl = {};
        this.filterOriginLcl = {};
        this.filterLcl();
      }
    }
  }
  filter() {
    this.getAllPublishRates()
  }
  filterLcl() {
    this.getAllPublishRatesLcl()
  }
  addRatesManually() {
    this._seaFreightService.addDraftRates({ createdBy: this.userProfile.LoginID, providerID: this.userProfile.ProviderID }).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        this.setRowinDRaftTable(res.returnObject, 'openPopup')
      }
    })
  }
  setRowinDRaftTable(obj, type) {
    this.draftDataBYSeaFCL.push(obj);
    if (this.allSeaDraftRatesByFCL && this.allSeaDraftRatesByFCL.length) {
      this.draftsfcl = this.allSeaDraftRatesByFCL.concat(this.draftDataBYSeaFCL);
    } else {
      this.draftsfcl = this.draftDataBYSeaFCL;
    }
    if (type == 'openPopup') {
      this.updatePopupRates(obj.ProviderPricingDraftID, 'FCL');
    }
    this.generateDraftTable();
  }
  addRatesManuallyLCL() {
    this._seaFreightService.addDraftRatesLCL({ createdBy: this.userProfile.LoginID, providerID: this.userProfile.ProviderID }).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        this.setRowinDRaftTableLCL(res.returnObject, 'openPopup');
      }
    })
  }
  setRowinDRaftTableLCL(obj, type) {
    this.draftDataBYSeaLCL.push(obj);
    if (this.allSeaDraftRatesByLCL && this.allSeaDraftRatesByLCL.length) {
      this.draftslcl = this.allSeaDraftRatesByLCL.concat(this.draftDataBYSeaLCL);
    } else {
      this.draftslcl = this.draftDataBYSeaLCL;
    }
    this.generateDraftTableLCL();
    if (type == 'openPopup') {
      this.updatePopupRates(obj.ConsolidatorPricingDraftID, 'LCL');
    }
  }


  generateDraftTable() {
    this.dtOptionsBySeaFCLDraft = {
      data: this.draftsfcl,
      columns: [
        {
          title: '<div class="fancyOptionBoxes"> <input id = "selectallDraftRates" type = "checkbox"> <label for= "selectallDraftRates"> <span> </span></label></div>',
          data: function (data) {
            return '<div class="fancyOptionBoxes"> <input id = "' + data.ProviderPricingDraftID + '" type = "checkbox"> <label for= "' + data.ProviderPricingDraftID + '"> <span> </span></label></div>';
          }
        },
        {
          title: 'SHIPPING LINE',
          data: function (data) {
            if (!data.CarrierID) {
              return "<span>-- Select --</span>"
            }
            else {
              let url = baseExternalAssets + "/" + data.CarrierImage;
              return "<img src='" + url + "' class='icon-size-24 mr-2' />" + data.CarrierName;
            }
          },
          className: 'carrierName'

        },
        {
          title: 'ORIGIN / DEPARTURE',
          data: function (data) {
            const arrow = '../../../../../../assets/images/icons/grid-arrow.svg';
            if (!data.PolID || !data.PodID) {
              return "<div class='row'> <div class='col-5 text-truncate'><span> -- From -- </span></div> <div class='col-2'><img src='" + arrow + "' /></div> <div class='col-5 text-truncate'><span> -- To -- </span></div> </div>";
            }
            else {
              let polUrl = '../../../../../../assets/images/flags/4x3/' + data.PolCode.split(' ').shift().toLowerCase() + '.svg';
              let podCode = '../../../../../../assets/images/flags/4x3/' + data.PodCode.split(' ').shift().toLowerCase() + '.svg';
              const arrow = '../../../../../../assets/images/icons/grid-arrow.svg';
              return "<div class='row'> <div class='col-5 text-truncate'><img src='" + polUrl + "' class='icon-size-22-14 mr-2' />" + data.PolName + "</div> <div class='col-2'><img src='" + arrow + "' /></div> <div class='col-5 text-truncate'><img src='" + podCode + "' class='icon-size-22-14 mr-2' />" + data.PodName + "</div> </div>";

              // return "<img src='" + polUrl + "' class='icon-size-22-14 mr-2' />" + data.PolName + " <img src='" + arrow + "' class='ml-2 mr-2' />" + "<img src='" + podCode + "' class='icon-size-22-14 ml-1 mr-2' />" + data.PodName;
            }
          },

          className: 'routeCell'
        },
        {
          title: 'CARGO TYPE',
          data: function (data) {
            if (!data.ShippingCatID) {
              return "<span>-- Select --</span>"
            }
            else {
              return data.ShippingCatName;
            }
          }
        },
        {
          title: 'CONTAINER',
          data: function (data) {
            if (!data.ContainerSpecID) {
              return "<span>-- Select --</span>"
            }
            else {
              return data.ContainerSpecName;
            }
          }
        },
        {
          title: 'RATE',
          data: function (data) {
            if (!data.Price) {
              return "<span>-- Select --</span>"
            }
            else {
              return (Number(data.Price)).toLocaleString('en-US', {
                style: 'currency',
                currency: data.CurrencyCode,
              });
            }
          }
        },
        {
          title: 'RATE VALIDITY',
          data: function (data) {
            if (!data.EffectiveFrom || !data.EffectiveTo) {
              return "<span>-- Select --</span>"
            }
            else {
              return moment(data.EffectiveFrom).format('D MMM, Y') + ' to ' + moment(data.EffectiveTo).format('D MMM, Y')
            }
          }
        },
        {
          title: 'Import Charges',
          data: function (data) {
            let subTotalIMP: any = 0;
            let totalImp = []
            if (!data.CurrencyCode) {
              data.CurrencyCode = ''
            }
            if (data.JsonSurchargeDet) {
              let parsedJsonSurchargeDet = JSON.parse(data.JsonSurchargeDet)
              const impCharges = parsedJsonSurchargeDet.filter((e) => e.Imp_Exp === 'IMPORT')
              if (impCharges.length) {
                impCharges.forEach(element => {
                  totalImp.push(parseInt(element.Price));
                });
                subTotalIMP = totalImp.reduce((all, item) => {
                  return all + item;
                });
              }
            }
            if (subTotalIMP === 0) {
              return "<span>-- Select --</span>"
            }
            return data.CurrencyCode + ' ' + subTotalIMP;
          }
        },
        {
          title: 'Export Charges',
          data: function (data) {
            let subTotalExp: any = 0;
            let totalExp = []
            if (!data.CurrencyCode) {
              data.CurrencyCode = ''
            }
            if (data.JsonSurchargeDet) {
              let parsedJsonSurchargeDet = JSON.parse(data.JsonSurchargeDet)
              const expCharges = parsedJsonSurchargeDet.filter((e) => e.Imp_Exp === 'EXPORT')
              if (expCharges.length) {
                expCharges.forEach(element => {
                  totalExp.push(parseInt(element.Price));
                });
                subTotalExp = totalExp.reduce((all, item) => {
                  return all + item;
                });
              }
            }
            if (subTotalExp === 0) {
              return "<span>-- Select --</span>"
            }
            return data.CurrencyCode + ' ' + subTotalExp;
          }
        },
        {
          title: '',
          data: function (data) {
            let url = '../../../../../../assets/images/icons/icon_del_round.svg';
            return "<img id='" + data.ProviderPricingDraftID + "' src='" + url + "' class='icon-size-16 pointer' />";
          }
        }
      ],
      drawCallback: function () {
        let $api = this.api();
        let pages = $api.page.info().pages;
        if (pages === 1 || !pages) {
          $('.draft-Fcl .dataTables_paginate').hide();
        } else {
          // SHow everything
          $('.draft-Fcl .dataTables_paginate').show();
        }
      },
      info: true,
      destroy: true,
      // pagingType: 'full_numbers',
      pageLength: 5,
      scrollX: true,
      // scrollY: '60vh',
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
          targets: 2,
          width: '235'
        },
        {
          targets: -1,
          width: 'auto',
          orderable: false,
        },
        {
          targets: -4,
          width: '200',
        },
        {
          targets: "_all",
          width: "150"
        }
      ],

    }

    this.setdataDraftInTable();
  }

  generateDraftTableLCL() {
    this.dtOptionsBySeaLCLDraft = {
      data: this.draftslcl,
      columns: [
        {
          title: '<div class="fancyOptionBoxes"> <input id = "selectallDraftRatesLCL" type = "checkbox"> <label for= "selectallDraftRatesLCL"> <span> </span></label></div>',
          data: function (data) {
            return '<div class="fancyOptionBoxes"> <input id = "' + data.ConsolidatorPricingDraftID + '" type = "checkbox"> <label for= "' + data.ConsolidatorPricingDraftID + '"> <span> </span></label></div>';
          }
        },
        {
          title: 'ORIGIN / DEPARTURE',
          data: function (data) {
            const arrow = '../../../../../../assets/images/icons/grid-arrow.svg';
            if (!data.PolID || !data.PodID) {
              return "<div class='row'> <div class='col-5 text-truncate'><span> -- From -- </span></div> <div class='col-2'><img src='" + arrow + "' /></div> <div class='col-5 text-truncate'><span> -- To -- </span></div> </div>";
            }
            else {
              let polUrl = '../../../../../../assets/images/flags/4x3/' + data.PolCode.split(' ').shift().toLowerCase() + '.svg';
              let podCode = '../../../../../../assets/images/flags/4x3/' + data.PodCode.split(' ').shift().toLowerCase() + '.svg';
              const arrow = '../../../../../../assets/images/icons/grid-arrow.svg';
              return "<div class='row'> <div class='col-5 text-truncate'><img src='" + polUrl + "' class='icon-size-22-14 mr-2' />" + data.PolName + "</div> <div class='col-2'><img src='" + arrow + "' /></div> <div class='col-5 text-truncate'><img src='" + podCode + "' class='icon-size-22-14 mr-2' />" + data.PodName + "</div> </div>";

              // return "<img src='" + polUrl + "' class='icon-size-22-14 mr-2' />" + data.PolName + " <img src='" + arrow + "' class='ml-2 mr-2' />" + "<img src='" + podCode + "' class='icon-size-22-14 ml-1 mr-2' />" + data.PodName;
            }
          },

          className: 'routeCell'
        },
        {
          title: 'CARGO TYPE',
          data: function (data) {
            if (!data.ShippingCatName) {
              return "<span>-- Select --</span>"
            }
            else {
              return data.ShippingCatName;
            }
          }
        },
        // {
        //   title: 'HANDLING UNIT',
        //   data: function (data) {
        //     if (!data.ContainerSpecShortName) {
        //       return "<span>-- Select --</span>"
        //     }
        //     else {
        //       return data.ContainerSpecShortName;
        //     }
        //   }
        // },
        {
          title: 'RATE / CBM',
          data: function (data) {
            if (!data.Price) {
              return "<span>-- Select --</span>"
            }
            else {
              return (Number(data.Price)).toLocaleString('en-US', {
                style: 'currency',
                currency: data.CurrencyCode,
              });
            }
          }
        },
        {
          title: 'RATE VALIDITY',
          data: function (data) {
            if (!data.EffectiveFrom || !data.EffectiveTo) {
              return "<span>-- Select --</span>"
            }
            else {
              return moment(data.EffectiveFrom).format('D MMM, Y') + ' to ' + moment(data.EffectiveTo).format('D MMM, Y')
            }
          }
        },
        {
          title: '',
          data: function (data) {
            let url = '../../../../../../assets/images/icons/icon_del_round.svg';
            return "<img id='" + data.ConsolidatorPricingDraftID + "' src='" + url + "' class='icon-size-16 pointer' />";
          }
        }
      ],
      drawCallback: function () {
        let $api = this.api();
        let pages = $api.page.info().pages;
        if (pages === 1 || !pages) {
          $('.draft-Lcl .dataTables_paginate').hide();
        } else {
          // SHow everything
          $('.draft-Lcl .dataTables_paginate').show();
        }
      },
      info: true,
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
      ],

    }

    this.setdataDraftInTableLCL();
  }

  setdataDraftInTableLCL() {
    setTimeout(() => {

      if (this.tabledraftBySeaLCL && this.tabledraftBySeaLCL.nativeElement) {
        this.dataTabledraftByseaLCL = $(this.tabledraftBySeaLCL.nativeElement);
        let alltableOption = this.dataTabledraftByseaLCL.DataTable(this.dtOptionsBySeaLCLDraft);
        alltableOption.rows().every(function (rowIdx, tableLoop, rowLoop) {
          let node = this.node();
          let data = this.data();
          if (!data.PolID || !data.PodID || !data.ShippingCatID || !data.Price || !data.EffectiveFrom || !data.EffectiveTo) {
            node.children[0].children[0].children[0].setAttribute("disabled", true)
          }
        });
        this.draftloadingLCL = false;
        $(alltableOption.table().container()).on('click', 'img.pointer', (event) => {
          event.stopPropagation();
          let delId = (<HTMLElement>event.target).id;
          if (delId) {
            this.deleteRowLCL(delId);
          }
        });
        $(alltableOption.table().container()).on('click', 'tbody tr', (event) => {
          event.stopPropagation();
          if (event.target.nodeName != "SPAN" || event.target.innerText) {
            if (event.currentTarget && event.currentTarget.cells.length && event.currentTarget.cells[0].children.length) {
              let rowId = event.currentTarget.cells[0].children[0].children[0].id;
              this.updatePopupRates(rowId, 'LCL');
            }

          }
        });

        $("#selectallDraftRatesLCL").click((event) => {
          this.publishRatesLCL = [];
          var cols = alltableOption.column(0).nodes();
          this.checkedalldraftRatesLCL = !this.checkedalldraftRatesLCL;
          for (var i = 0; i < cols.length; i += 1) {
            cols[i].querySelector("input[type='checkbox']").checked = this.checkedalldraftRatesLCL;
            if (this.checkedalldraftRatesLCL) {
              let data = alltableOption.row(i).data();
              let node = alltableOption.row(i).node();
              if (data.PolID && data.PodID && data.ShippingCatID && data.Price && data.EffectiveFrom && data.EffectiveTo) {
                let draftId = node.children[0].children[0].children[0].id;
                this.publishRatesLCL.push(draftId);
                node.children[0].children[0].children[0].checked = true;
                node.classList.add('selected');
              }
              else {
                node.children[0].children[0].children[0].checked = false;
              }
            }
          }
          if (i == cols.length && !this.checkedalldraftRatesLCL) {
            this.publishRatesLCL = [];
            this.selectedItem('remove', alltableOption)
          }
        });

        $('#draftRateTableLCL').off('click').on('click', 'tbody tr td input[type="checkbox"]', (event) => {
          event.stopPropagation();
          let index = this.publishRatesLCL.indexOf((<HTMLInputElement>event.target).id);
          let selection = event.currentTarget.parentElement.parentElement.parentElement;
          if (index >= 0) {
            this.publishRatesLCL.splice(index, 1);
            selection.classList.remove('selected');

          } else {
            this.publishRatesLCL.push((<HTMLInputElement>event.target).id);
            selection.classList.add('selected');
          }

        });

      }

    }, 0);
  }
  setdataDraftInTable() {
    setTimeout(() => {
      if (this.tabledraftBySea && this.tabledraftBySea.nativeElement) {
        this.dataTabledraftBysea = $(this.tabledraftBySea.nativeElement);
        // let alltableOption = this.dataTabledraftBysea.DataTable();
        //   alltableOption.destroy();
        let alltableOption = this.dataTabledraftBysea.DataTable(this.dtOptionsBySeaFCLDraft);
        alltableOption.rows().every(function (rowIdx, tableLoop, rowLoop) {
          let node = this.node();
          let data = this.data();
          if (!data.PolID || !data.PodID || !data.ShippingCatID || !data.CarrierID || !data.EffectiveFrom || !data.EffectiveTo || !data.Price || !data.ContainerSpecID) {
            node.children[0].children[0].children[0].setAttribute("disabled", true)
          }
        });
        this.draftloading = false;
        $(alltableOption.table().container()).on('click', 'img.pointer', (event) => {
          event.stopPropagation();
          let delId = (<HTMLElement>event.target).id;
          if (delId) {
            this.deleteRow(delId);
          }
        });
        $(alltableOption.table().container()).on('click', 'tbody tr', (event) => {
          event.stopPropagation();
          if (event.target.nodeName != "SPAN" || event.target.innerText) {
            if (event.currentTarget && event.currentTarget.cells.length && event.currentTarget.cells[0].children.length) {
              let rowId = event.currentTarget.cells[0].children[0].children[0].id;
              this.updatePopupRates(rowId, 'FCL');
            }
          }
        });
        // $(alltableOption.table().container()).on('click', 'tfoot tr td a', (event) => {
        //     event.stopPropagation();
        //     this.addAnotherRates();

        // });

        $("#selectallDraftRates").click((event) => {
          this.publishRates = [];
          var cols = alltableOption.column(0).nodes();
          this.checkedalldraftRates = !this.checkedalldraftRates;
          for (var i = 0; i < cols.length; i += 1) {
            if (this.checkedalldraftRates) {
              let data = alltableOption.row(i).data();
              let node = alltableOption.row(i).node();
              if (data.PolID && data.PodID && data.ShippingCatID && data.CarrierID && data.EffectiveFrom && data.EffectiveTo && data.Price && data.ContainerSpecID) {
                let draftId = node.children[0].children[0].children[0].id;
                this.publishRates.push(draftId);
                node.children[0].children[0].children[0].checked = true;
                node.classList.add('selected');
              }
              else {
                node.children[0].children[0].children[0].checked = false;
                // node.children[0].children[0].children[0].setAttribute("disabled", true)
              }
            }
          }
          if (i == cols.length && !this.checkedalldraftRates) {
            this.publishRates = [];
            this.selectedItem('remove', alltableOption);
          }
        });

        $('#draftRateTable').off('click').on('click', 'tbody tr td input[type="checkbox"]', (event) => {
          event.stopPropagation();
          let index = this.publishRates.indexOf((<HTMLInputElement>event.target).id)
          let selection = event.currentTarget.parentElement.parentElement.parentElement;
          if (index >= 0) {
            this.publishRates.splice(index, 1);
            selection.classList.remove('selected');
          } else {
            this.publishRates.push((<HTMLInputElement>event.target).id);
            selection.classList.add('selected');
          }

        });
      }

    }, 0);
  }


  updatePopupRates(rowId, type) {
    let obj;
    if (type == 'FCL') {
      obj = this.draftsfcl.find(elem => elem.ProviderPricingDraftID == rowId);
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
      if (result && result.data && result.data.length) {
        if (type == 'FCL') {
          this.setAddDraftData(result.data);
        }
        else if (type == 'LCL') {
          this.setAddDraftDataLCL(result.data);
        }
      }
    });
    let object = {
      forType: type,
      data: obj,
      addList: this.seaCharges
    }
    modalRef.componentInstance.selectedData = object;
    setTimeout(() => {
      if (document.getElementsByTagName('body')[0].classList.contains('modal-open')) {
        document.getElementsByTagName('html')[0].style.overflowY = 'hidden';
      }
    }, 0);

  }

  setAddDraftDataLCL(data) {
    for (var index = 0; index < this.draftslcl.length; index++) {
      for (let i = 0; i < data.length; i++) {
        if (this.draftslcl[index].ConsolidatorPricingDraftID == data[i].consolidatorPricingDraftID) {
          this.draftslcl[index].ContainerLoadType = data[i].containerLoadType;
          this.draftslcl[index].ContainerSpecID = data[i].containerSpecID;
          this.draftslcl[index].ContainerSpecShortName = data[i].containerSpecShortName;
          this.draftslcl[index].ShippingCatID = data[i].shippingCatID;
          this.draftslcl[index].ShippingCatName = data[i].shippingCatName;
          this.draftslcl[index].CurrencyID = data[i].currencyID;
          this.draftslcl[index].CurrencyCode = data[i].currencyCode;
          this.draftslcl[index].Price = data[i].price;
          this.draftslcl[index].EffectiveFrom = data[i].effectiveFrom;
          this.draftslcl[index].EffectiveTo = data[i].effectiveTo;
          this.draftslcl[index].PodCode = data[i].podCode;
          this.draftslcl[index].PolCode = data[i].polCode;
          this.draftslcl[index].PodName = data[i].podName;
          this.draftslcl[index].PolName = data[i].polName;
          this.draftslcl[index].PodID = data[i].podID;
          this.draftslcl[index].PolID = data[i].polID;
        }
      }
    }
    if (index == this.draftslcl.length) {
      this.generateDraftTableLCL();
    }
  }
  setAddDraftData(data) {
    data.forEach(element => {
      if (element.JsonSurchargeDet) {
        let importCharges = []
        let exportCharges = []
        let parsedJsonSurchargeDet = JSON.parse(element.JsonSurchargeDet)
        importCharges = parsedJsonSurchargeDet.filter(e => e.Imp_Exp === 'IMPORT');
        exportCharges = parsedJsonSurchargeDet.filter(e => e.Imp_Exp === 'EXPORT');
        element.parsedJsonSurchargeDet = importCharges.concat(exportCharges)
      }
    });

    for (var index = 0; index < this.draftsfcl.length; index++) {
      for (let i = 0; i < data.length; i++) {
        if (this.draftsfcl[index].ProviderPricingDraftID == data[i].providerPricingDraftID) {
          this.draftsfcl[index].CarrierID = data[i].carrierID;
          this.draftsfcl[index].CarrierImage = data[i].carrierImage;
          this.draftsfcl[index].CarrierName = data[i].carrierName;
          this.draftsfcl[index].ContainerLoadType = data[i].containerLoadType;
          this.draftsfcl[index].ContainerSpecID = data[i].containerSpecID;
          this.draftsfcl[index].ContainerSpecName = data[i].containerSpecName;
          this.draftsfcl[index].ShippingCatID = data[i].shippingCatID;
          this.draftsfcl[index].ShippingCatName = data[i].shippingCatName;
          this.draftsfcl[index].CurrencyID = data[i].currencyID;
          this.draftsfcl[index].CurrencyCode = data[i].currencyCode;
          this.draftsfcl[index].Price = data[i].price;
          this.draftsfcl[index].EffectiveFrom = data[i].effectiveFrom;
          this.draftsfcl[index].EffectiveTo = data[i].effectiveTo;
          this.draftsfcl[index].PodCode = data[i].podCode;
          this.draftsfcl[index].PolCode = data[i].polCode;
          this.draftsfcl[index].PodName = data[i].podName;
          this.draftsfcl[index].PolName = data[i].polName;
          this.draftsfcl[index].PodID = data[i].podID;
          this.draftsfcl[index].PolID = data[i].polID;
          this.draftsfcl[index].JsonSurchargeDet = JSON.stringify(data[i].parsedJsonSurchargeDet)
        }
      }
    }
    if (index == this.draftsfcl.length) {
      this.generateDraftTable();
    }
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
    if (this.fromDate && this.fromDate.month && this.toDate && this.toDate.month) {
      this.getAllPublishRates();
    }

  }

  onDateSelectionLCL(date: NgbDateStruct) {
    let parsed = '';
    if (!this.fromDateLCL && !this.toDateLCL) {
      this.fromDateLCL = date;
    } else if (this.fromDateLCL && !this.toDateLCL && after(date, this.fromDateLCL)) {
      this.toDateLCL = date;
      // this.model = `${this.fromDateLCL.year} - ${this.toDateLCL.year}`;
      this.inputLCL.close();
    } else {
      this.toDateLCL = null;
      this.fromDateLCL = date;
    }
    if (this.fromDateLCL) {
      parsed += this._parserFormatter.format(this.fromDateLCL);
    }
    if (this.toDateLCL) {
      parsed += ' - ' + this._parserFormatter.format(this.toDateLCL);
    }

    this.renderer.setProperty(this.rangeDpLCL.nativeElement, 'value', parsed);
    if (this.fromDateLCL && this.fromDateLCL.month && this.toDateLCL && this.toDateLCL.month) {
      this.getAllPublishRatesLcl();
    }

  }

  allservicesBySea() {
    this.draftRates = this._sharedService.dataLogisticServiceBySea.subscribe(state => {
      if (state && state.length) {
        for (let index = 0; index < state.length; index++) {
          if (state[index].LogServName == "SEA") {
            this.allShippingLines = state[index].DropDownValues.ShippingLine;
            this.allCargoType = state[index].DropDownValues.Category;
            this.allContainersType = state[index].DropDownValues.ContainerFCL;
            this.allHandlingType = state[index].DropDownValues.ContainerLCL;
            this.allPorts = state[index].DropDownValues.Port;
            this.allCurrencies = state[index].DropDownValues.UserCurrency;
            if (state[index].TCFCL) {
              this.editorContentFCL = state[index].TCFCL;
              this.disableFCL = true;
            }
            if (state[index].TCLCL) {
              this.editorContentLCL = state[index].TCLCL;
              this.disableLCL = true;
            }
            if (state[index].DraftDataFCL) {
              this.allSeaDraftRatesByFCL = state[index].DraftDataFCL;
              this.draftsfcl = this.allSeaDraftRatesByFCL;
            }
            if (state[index].DraftDataLCL) {
              this.allSeaDraftRatesByLCL = state[index].DraftDataLCL;
              this.draftslcl = this.allSeaDraftRatesByLCL;
            }
            this.generateDraftTable();
            this.generateDraftTableLCL();
            this.draftloading = true;
            this.draftloadingLCL = true;
          }
        }
      }
    })
  }



  filterByroute(obj, type) {
    if (type == "FCL") {

      if (typeof obj == 'object') {
        this.getAllPublishRates();
      }
      else if (!obj) {
        this.getAllPublishRates();
      }
      else {
        return;
      }
    }
    else if (type == "LCL") {
      if (typeof obj == 'object') {
        this.getAllPublishRatesLcl();
      }
      else if (!obj) {
        this.getAllPublishRatesLcl();
      }
      else {
        return;
      }
    }

  }


  filterBydate(date, type) {
    if (type == "FCL") {
      if (!date && this.fromDate && this.toDate) {
        this.fromDate = null;
        this.toDate = null;
        this.getAllPublishRates();
      }
      else {
        return;
      }
    }
    if (type == "LCL") {
      if (!date && this.fromDateLCL && this.toDateLCL) {
        this.fromDateLCL = null;
        this.toDateLCL = null;
        this.getAllPublishRatesLcl();
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
        this.getAllPublishRates();
      }
    }
  }



  filtertionPort(obj, type) {
    if (type == "FCL") {
      if ((typeof obj == "object" && Object.keys(obj).length) || (typeof obj == "string" && obj)) this.getAllPublishRates();
    }
    else if (type == "LCL") {
      if ((typeof obj == "object" && Object.keys(obj).length) || (typeof obj == "string" && obj)) this.getAllPublishRates();
    }
  }

  getAllPublishRates() {
    this.publishloading = true;
    let obj = {
      // providerID: 1047,     
      providerID: this.userProfile.ProviderID,
      pageNo: 1,
      pageSize: 50,
      carrierID: (this.filterbyShippingLine == 'undefined') ? null : this.filterbyShippingLine,
      shippingCatID: (this.filterbyCargoType == 'undefined') ? null : this.filterbyCargoType,
      containerSpecID: (this.filterbyContainerType == 'undefined') ? null : this.filterbyContainerType,
      polID: this.orgfilter("FCL"),
      podID: this.destfilter("FCL"),
      effectiveFrom: (this.fromDate && this.fromDate.month) ? this.fromDate.month + '/' + this.fromDate.day + '/' + this.fromDate.year : null,
      effectiveTo: (this.toDate && this.toDate.month) ? this.toDate.month + '/' + this.toDate.day + '/' + this.toDate.year : null,
      sortColumn: null,
      sortColumnDirection: null
    }
    this._seaFreightService.getAllrates(obj).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        this.allRatesList = res.returnObject.data;
        this.checkedallpublishRates = false;
        this.filterTable();
      }
    })

  }

  getAllPublishRatesLcl() {
    this.publishloadingLcl = true;
    let obj = {
      providerID: this.userProfile.ProviderID,
      pageNo: 1,
      pageSize: 50,
      shippingCatID: (this.filterbyCargoTypeLcl == 'undefined') ? null : this.filterbyCargoTypeLcl,
      containerSpecID: (this.filterbyHandlingType == 'undefined') ? null : this.filterbyHandlingType,
      polID: this.orgfilter("LCL"),
      podID: this.destfilter("LCL"),
      effectiveFrom: (this.fromDateLCL && this.fromDateLCL.month) ? this.fromDateLCL.month + '/' + this.fromDateLCL.day + '/' + this.fromDateLCL.year : null,
      effectiveTo: (this.toDateLCL && this.toDateLCL.month) ? this.toDateLCL.month + '/' + this.toDateLCL.day + '/' + this.toDateLCL.year : null,

      sortColumn: null,
      sortColumnDirection: null
    }
    this._seaFreightService.getAllratesLCL(obj).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        this.allRatesListLcL = res.returnObject.data;
        this.checkedallpublishRatesLcl = false;
        this.filterTableLcl();
      }
    })
  }


  filterTable() {
    this.dtOptionsBySeaFCL = {
      data: this.allRatesList,
      columns: [
        {
          title: '<div class="fancyOptionBoxes"> <input id = "selectallpublishRates" type = "checkbox"> <label for= "selectallpublishRates"> <span> </span></label></div>',
          data: function (data) {
            return '<div class="fancyOptionBoxes"> <input id = "' + data.carrierPricingID + '" type = "checkbox"> <label for= "' + data.carrierPricingID + '"> <span> </span></label></div>';
          }
        },
        {
          title: 'SHIPPING LINE',
          data: function (data) {
            let url = baseExternalAssets + "/" + data.carrierImage;
            return "<img src='" + url + "' class='icon-size-24 mr-2' />" + data.carrierName;
          },
          className: "carrierName"
        },
        {
          title: 'ORIGIN / DEPARTURE',
          data: function (data) {
            let polUrl = '../../../../../../assets/images/flags/4x3/' + data.polCode.split(' ').shift().toLowerCase() + '.svg';
            let podCode = '../../../../../../assets/images/flags/4x3/' + data.podCode.split(' ').shift().toLowerCase() + '.svg';
            const arrow = '../../../../../../assets/images/icons/grid-arrow.svg';
            return "<div class='row'> <div class='col-5 text-truncate' ><img src='" + polUrl + "' class='icon-size-22-14 mr-2' />" + data.polName + "</div> <div class='col-2'><img src='" + arrow + "' /></div> <div class='col-5 text-truncate'><img src='" + podCode + "' class='icon-size-22-14 mr-2' />" + data.podName + "</div> </div>";
          },
          className: "routeCell"
        },
        {
          title: 'CARGO TYPE',
          data: 'shippingCatName',
        },
        {
          title: 'CONTAINER',
          data: 'containerSpecDesc',
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
          title: 'Import Charges',
          data: function (data) {
            let subTotalIMP: any = 0;
            let totalImp = []
            if (!data.currencyCode) {
              data.currencyCode = ''
            }
            if (data.jsonSurchargeDet) {
              let parsedJsonSurchargeDet = JSON.parse(data.jsonSurchargeDet)
              const impCharges = parsedJsonSurchargeDet.filter((e) => e.Imp_Exp === 'IMPORT')
              if (impCharges.length) {
                impCharges.forEach(element => {
                  totalImp.push(parseInt(element.Price));
                });
                subTotalIMP = totalImp.reduce((all, item) => {
                  return all + item;
                });
              }
            }
            if (subTotalIMP === 0) {
              return "<span>-- Select --</span>"
            }
            return data.currencyCode + ' ' + subTotalIMP ;
          }
        },
        {
          title: 'Export Charges',
          data: function (data) {
            let subTotalExp: any = 0;
            let totalExp = []
            if (!data.currencyCode) {
              data.currencyCode = ''
            }
            if (data.jsonSurchargeDet) {
              let parsedJsonSurchargeDet = JSON.parse(data.jsonSurchargeDet)
              const expCharges = parsedJsonSurchargeDet.filter((e) => e.Imp_Exp === 'EXPORT')
              if (expCharges.length) {
                expCharges.forEach(element => {
                  totalExp.push(parseInt(element.Price));
                });
                subTotalExp = totalExp.reduce((all, item) => {
                  return all + item;
                });
              }
            }
            if (subTotalExp === 0) {
              return "<span>-- Select --</span>"
            }
            return data.currencyCode + ' ' + subTotalExp;
          }
        },
        {
          title: '',
          data: function (data) {
            let url = '../../../../../../assets/images/icons/menu.svg';
            return "<img id='" + data.carrierPricingID + "' src='" + url + "' class='icon-size-16 pointer' />";
          },
          className: 'moreOption'
        }
      ],
      drawCallback: function () {
        let $api = this.api();
        let pages = $api.page.info().pages;
        if (pages === 1 || !pages) {
          $('.publishRatesFCL .dataTables_paginate').hide();
        } else {
          // SHow everything
          $('.publishRatesFCL .dataTables_paginate').show();
        }
      },
      // processing: true,
      // serverSide: true,
      // retrieve: true,
      destroy: true,
      // pagingType: 'full_numbers',
      pageLength: 5,
      scrollX: true,
      // scrollY: '60vh',
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
          targets: 2,
          width: '235'
        },
        {
          targets: -1,
          width: 'auto',
          orderable: false,
        },
        {
          targets: -4,
          width: '200',
        },
        {
          targets: "_all",
          width: "150"
        }
      ]
    };
    this.setdataInTable();
  }



  filterTableLcl() {
    this.dtOptionsBySeaLCL = {
      data: this.allRatesListLcL,
      columns: [
        {
          title: '<div class="fancyOptionBoxes"> <input id = "selectallpublishRatesLcl" type = "checkbox"> <label for= "selectallpublishRatesLcl"> <span> </span></label></div>',
          data: function (data) {
            return '<div class="fancyOptionBoxes"> <input id = "' + data.consolidatorPricingID + '" type = "checkbox"> <label for= "' + data.consolidatorPricingID + '"> <span> </span></label></div>';
          }
        },

        {
          title: 'ORIGIN / DEPARTURE',
          data: function (data) {
            let polUrl = '../../../../../../assets/images/flags/4x3/' + data.polCode.split(' ').shift().toLowerCase() + '.svg';
            let podCode = '../../../../../../assets/images/flags/4x3/' + data.podCode.split(' ').shift().toLowerCase() + '.svg';
            const arrow = '../../../../../../assets/images/icons/grid-arrow.svg';
            return "<div class='row'> <div class='col-5 text-truncate' ><img src='" + polUrl + "' class='icon-size-22-14 mr-2' />" + data.polName + "</div> <div class='col-2'><img src='" + arrow + "' /></div> <div class='col-5 text-truncate'><img src='" + podCode + "' class='icon-size-22-14 mr-2' />" + data.podName + "</div> </div>";
          },
          className: "routeCell"
        },
        {
          title: 'CARGO TYPE',
          data: 'shippingCatName',
        },
        // {
        //   title: 'HANDLING UNIT',
        //   data: 'containerSpecShortName',
        // },
        {
          title: 'RATE / CBM',
          data: function (data) {
            return (Number(data.price)).toLocaleString('en-US', {
              style: 'currency',
              currency: data.currencyCode,
            });
          }
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
            return "<img src='" + url + "' class='icon-size-16' />";
          },
          className: 'moreOption'
        }
      ],
      drawCallback: function () {
        let $api = this.api();
        let pages = $api.page.info().pages;
        if (pages === 1 || !pages) {
          $('.publishRatesLCL .dataTables_paginate').hide();
        } else {
          // SHow everything
          $('.publishRatesLCL.dataTables_paginate').show();
        }
      },
      // processing: true,
      // serverSide: true,
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
    this.setdataInTableLcl();
  }

  setdataInTableLcl() {
    setTimeout(() => {
      if (this.tablepublishBySeaLcl && this.tablepublishBySeaLcl.nativeElement) {
        this.dataTablepublishByseaLcl = $(this.tablepublishBySeaLcl.nativeElement);
        let alltableOption = this.dataTablepublishByseaLcl.DataTable(this.dtOptionsBySeaLCL);
        this.publishloadingLcl = false;
        $("#selectallpublishRatesLcl").click(() => {
          this.delPublishRatesLcl = [];
          var cols = alltableOption.column(0).nodes();
          this.checkedallpublishRatesLcl = !this.checkedallpublishRatesLcl;
          for (var i = 0; i < cols.length; i += 1) {
            cols[i].querySelector("input[type='checkbox']").checked = this.checkedallpublishRatesLcl;
            if (this.checkedallpublishRatesLcl) {
              this.delPublishRatesLcl.push(cols[i].querySelector("input[type='checkbox']").id);
              this.selectedItem('add', alltableOption);
              this.rateValidityTextLCL = "Edit Validity"
            }
          }
          if (i == cols.length && !this.checkedallpublishRatesLcl) {
            this.delPublishRatesLcl = [];
            this.selectedItem('remove', alltableOption);
            this.rateValidityTextLCL = "Edit Rate / Validity"

          }

        });

        $('#publishRateTableLcl').off('click').on('click', 'input[type="checkbox"]', (event) => {
          let index = this.delPublishRatesLcl.indexOf((<HTMLInputElement>event.target).id);
          let selection = event.currentTarget.parentElement.parentElement.parentElement;
          if (index >= 0) {
            this.delPublishRatesLcl.splice(index, 1);
            selection.classList.remove('selected');
          } else {
            selection.classList.add('selected');
            this.delPublishRatesLcl.push((<HTMLInputElement>event.target).id)
          }
          if (this.delPublishRatesLcl && this.delPublishRatesLcl.length > 1) {
            this.rateValidityTextLCL = "Edit Validity";
          }
          else {
            this.rateValidityTextLCL = "Edit Rate / Validity";
          }
        });
      }
    }, 0);
  }



  setdataInTable() {
    setTimeout(() => {
      if (this.tablepublishBySea && this.tablepublishBySea.nativeElement) {
        this.dataTablepublishBysea = $(this.tablepublishBySea.nativeElement);
        let alltableOption = this.dataTablepublishBysea.DataTable(this.dtOptionsBySeaFCL);
        this.publishloading = false;
        $(alltableOption.table().container()).on('click', 'img.pointer', (event) => {
          event.stopPropagation();
          let selectedId = (<HTMLElement>event.target).id;
          if (selectedId) {
            this.rateHistory(selectedId, 'Rate_FCL')
          }
        });
        $("#selectallpublishRates").click(() => {
          this.delPublishRates = [];
          var cols = alltableOption.column(0).nodes();
          this.checkedallpublishRates = !this.checkedallpublishRates;
          for (var i = 0; i < cols.length; i += 1) {
            cols[i].querySelector("input[type='checkbox']").checked = this.checkedallpublishRates;
            if (this.checkedallpublishRates) {
              this.delPublishRates.push(cols[i].querySelector("input[type='checkbox']").id);
              this.selectedItem('add', alltableOption);
              this.rateValidityTextFCL = "Edit Validity";
            }
          }
          if (i == cols.length && !this.checkedallpublishRates) {
            this.delPublishRates = [];
            this.selectedItem('remove', alltableOption);
            this.rateValidityTextFCL = "Edit Rate / Validity";
          }

        });

        $('#publishRateTable').off('click').on('click', 'input[type="checkbox"]', (event) => {
          let index = this.delPublishRates.indexOf((<HTMLInputElement>event.target).id);
          let selection = event.currentTarget.parentElement.parentElement.parentElement;
          if (index >= 0) {
            this.delPublishRates.splice(index, 1);
            selection.classList.remove('selected');
          } else {
            selection.classList.add('selected');
            this.delPublishRates.push((<HTMLInputElement>event.target).id);
          }
          if (this.delPublishRates && this.delPublishRates.length > 1) {
            this.rateValidityTextFCL = "Edit Validity";
          }
          else {
            this.rateValidityTextFCL = "Edit Rate / Validity";
          }

        });


      }
    }, 0);
  }

  selectedItem(type, alltableOption) {
    if (type == 'add') {
      alltableOption.rows().every(function (rowIdx, tableLoop, rowLoop) {
        var data = this.node();
        data.classList.add('selected');
        // ... do something with data(), or this.node(), etc
      });
    }
    else {
      alltableOption.rows().every(function (rowIdx, tableLoop, rowLoop) {
        var data = this.node();
        data.classList.remove('selected');
        data.children[0].children[0].children[0].checked = false;
        // ... do something with data(), or this.node(), etc
      });
    }
  }
  orgfilter(type) {
    if (type == "FCL") {
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
    else if (type == "LCL") {
      if (this.filterOriginLcl && typeof this.filterOriginLcl == "object" && Object.keys(this.filterOriginLcl).length) {
        return this.filterOriginLcl.PortID;
      }
      else if (this.filterOriginLcl && typeof this.filterOriginLcl == "string") {
        return -1;
      }
      else if (!this.filterOriginLcl) {
        return null;
      }
    }
  }
  destfilter(type) {
    if (type == "FCL") {
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
    if (type == "LCL") {
      if (this.filterDestinationLcl && typeof this.filterDestinationLcl == "object" && Object.keys(this.filterDestinationLcl).length) {
        return this.filterDestinationLcl.PortID;
      }
      else if (this.filterDestinationLcl && typeof this.filterDestinationLcl == "string") {
        return -1;
      }
      else if (!this.filterDestinationLcl) {
        return null;
      }
    }
  }

  discardDraft() {
    let discardarr = [];
    this.draftsfcl.forEach(elem => {
      discardarr.push(elem.ProviderPricingDraftID)
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
        this.draftsfcl = [];
        this.allSeaDraftRatesByFCL = [];
        this.draftDataBYSeaFCL = [];
        this.publishRates = [];
        this.generateDraftTable();
      }
    }, (reason) => {
      // console.log("reason");
    });
    let obj = {
      data: discardarr,
      type: "draftSeaRateFCL"
    }
    modalRef.componentInstance.deleteIds = obj;
    setTimeout(() => {
      if (document.getElementsByTagName('body')[0].classList.contains('modal-open')) {
        document.getElementsByTagName('html')[0].style.overflowY = 'hidden';
      }
    }, 0);
  }

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
        this.generateDraftTableLCL();
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
          this.filterTable();
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
            this.filterTable();
            this.delPublishRates = [];
          }
        }

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
  delLclPubRecord() {
    if (!this.delPublishRatesLcl.length) return;
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
        if (this.allRatesListLcL.length == this.delPublishRatesLcl.length) {
          this.allRatesListLcL = [];
          this.delPublishRatesLcl = [];
          this.filterTableLcl();
        }
        else {
          for (var i = 0; i < this.delPublishRatesLcl.length; i++) {
            for (let y = 0; y < this.allRatesListLcL.length; y++) {
              if (this.delPublishRatesLcl[i] == this.allRatesListLcL[y].consolidatorPricingID) {
                this.allRatesListLcL.splice(y, 1);
              }
            }
          }
          if (i == this.delPublishRatesLcl.length) {
            this.filterTableLcl();
            this.delPublishRatesLcl = [];
          }
        }

      }
    }, (reason) => {
      // console.log("reason");
    });
    let obj = {
      data: this.delPublishRatesLcl,
      type: "publishSeaRateLCL"
    }
    modalRef.componentInstance.deleteIds = obj;
    setTimeout(() => {
      if (document.getElementsByTagName('body')[0].classList.contains('modal-open')) {
        document.getElementsByTagName('html')[0].style.overflowY = 'hidden';
      }
    }, 0);
  }

  deletepublishRecord(type) {
    if (type == "FCL") {
      this.delFclPubRecord()
    }
    if (type == "LCL") {
      this.delLclPubRecord()
    }

  }

  publishRate() {
    this._seaFreightService.publishDraftRate(this.publishRates).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        for (var i = 0; i < this.publishRates.length; i++) {
          for (let y = 0; y < this.draftsfcl.length; y++) {
            if (this.draftsfcl[y].ProviderPricingDraftID == this.publishRates[i]) {
              this.draftsfcl.splice(y, 1);
            }
          }
        }
        if (this.publishRates.length == i) {
          this.checkedalldraftRates = false;
          this.publishRates = [];
          this.generateDraftTable();
          this.getAllPublishRates();
        }
      }
    })
  }

  publishRateLcl() {
    this._seaFreightService.publishDraftRateLCL(this.publishRatesLCL).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        for (var i = 0; i < this.publishRatesLCL.length; i++) {
          for (let y = 0; y < this.draftslcl.length; y++) {
            if (this.draftslcl[y].ConsolidatorPricingDraftID == this.publishRatesLCL[i]) {
              this.draftslcl.splice(y, 1);
            }
          }
        }
        if (this.publishRatesLCL.length == i) {
          this.checkedalldraftRates = false;
          this.publishRatesLCL = [];
          this.generateDraftTableLCL();
          this.getAllPublishRatesLcl();
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
            this.generateDraftTable();
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
            this.generateDraftTableLCL();
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
  rateValidity() {
    if (!this.delPublishRates.length) return;
    let updateValidity = [];
    for (let i = 0; i < this.allRatesList.length; i++) {
      for (let y = 0; y < this.delPublishRates.length; y++) {
        if (this.allRatesList[i].carrierPricingID == this.delPublishRates[y]){
          updateValidity.push(this.allRatesList[i])
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
      if (result =='Success') {
        this.getAllPublishRates();
        this.checkedallpublishRates = false
        this.delPublishRates=[];
      }
    });
    let obj = {
      data: updateValidity,
      type: "rateValidityFCL"
    }
    modalRef.componentInstance.validityData = obj;
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
        this.getAllPublishRatesLcl();
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


  rateHistory(recId, fortype) {
    const modalRef = this.modalService.open(RateHistoryComponent, {
      size: 'lg',
      centered: true,
      windowClass: 'upper-medium-modal',
      backdrop: 'static',
      keyboard: false
    });

    let obj = {
      id: recId,
      type: fortype
    }
    modalRef.componentInstance.getRecord = obj;
    setTimeout(() => {
      if (document.getElementsByTagName('body')[0].classList.contains('modal-open')) {
        document.getElementsByTagName('html')[0].style.overflowY = 'hidden';
      }
    }, 0);
  }


  



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

  getAdditionalData() {
    this._seaFreightService.getAllAdditionalCharges().subscribe((res: any) => {
      this.seaCharges = res.filter(e => e.modeOfTrans === 'SEA' && e.addChrType === 'ADCH')
    }, (err) => {
      console.log(err);

    })
  }


}
