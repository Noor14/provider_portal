import { Component, OnInit, ViewChild, ViewEncapsulation, ElementRef, Renderer2, QueryList, AfterViewInit } from '@angular/core';
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
import { getJwtToken } from '../../../../../services/jwt.injectable';
import { SharedService } from '../../../../../services/shared.service';
import { baseExternalAssets } from '../../../../../constants/base.url';
import { ConfirmDeleteDialogComponent } from '../../../../../shared/dialogues/confirm-delete-dialog/confirm-delete-dialog.component';
// import { NgModel } from '@angular/forms';
import * as moment from 'moment';
import { DataTableDirective } from 'angular-datatables';
import { SeaRateDialogComponent } from '../../../../../shared/dialogues/sea-rate-dialog/sea-rate-dialog.component';
import { GroundTransportService } from './ground-transport.service';
import { NgbDateFRParserFormatter } from '../../../../../constants/ngb-date-parser-formatter';
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
export class GroundTransportComponent implements OnInit {


  public dtOptionsByGround: DataTables.Settings | any = {};
  public dtOptionsBySeaLCL: DataTables.Settings | any = {};
  public dtOptionsByGroundDraft: DataTables.Settings | any = {};
  public dtOptionsBySeaLCLDraft: DataTables.Settings | any = {};
  @ViewChild('draftBYsea') tabledraftBySea;
  @ViewChild('draftBYseaLCL') tabledraftBySeaLCL;
  @ViewChild('publishBysea') tablepublishBySea;
  @ViewChild('publishByseaLcl') tablepublishBySeaLcl;
  @ViewChild("dp") input: NgbInputDatepicker;
  // @ViewChild(NgModel) datePick: NgModel;
  @ViewChild('rangeDp') rangeDp: ElementRef;
  // @ViewChild(DataTableDirective) dtElement: DataTableDirective;

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
  public filterbyCargoTypeLcl;
  public filterbyContainerType;
  public filterbyHandlingType;
  public checkedallpublishRates: boolean = false;
  public checkedallpublishRatesLcl: boolean = false;
  public checkedalldraftRates: boolean = false;
  public checkedalldraftRatesLCL: boolean = false;

  isHovered = date =>
    this.fromDate && !this.toDate && this.hoveredDate && after(date, this.fromDate) && before(date, this.hoveredDate)
  isInside = date => after(date, this.fromDate) && before(date, this.toDate);
  isFrom = date => equals(date, this.fromDate);
  isTo = date => equals(date, this.toDate);
  constructor(
    private modalService: NgbModal,
    private _seaFreightService: GroundTransportService,
    private _sharedService: SharedService,
    private element: ElementRef,
    private renderer: Renderer2,
    private _parserFormatter: NgbDateParserFormatter,
  ) { }


  ngOnInit() {
    let userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo && userInfo.returnText) {
      this.userProfile = JSON.parse(userInfo.returnText);
    }
    this.startDate = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
    this.maxDate = { year: now.getFullYear() + 1, month: now.getMonth() + 1, day: now.getDate() };
    this.minDate = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
    this.getAllPublishRates();
    this.allservicesBySea();
  }



  clearFilter(event) {
    event.preventDefault();
    event.stopPropagation();
      if ((this.filterbyContainerType && this.filterbyContainerType != 'undefined') ||
        (this.filterDestination && Object.keys(this.filterDestination).length) ||
        (this.filterOrigin && Object.keys(this.filterOrigin).length) ||
        (this.fromDate && Object.keys(this.fromDate).length) ||
        (this.toDate && Object.keys(this.toDate).length)
      ) {
        this.fromDate = null;
        this.toDate = null;
        this.model = null;
        this.filterbyContainerType = 'undefined';
        this.filterDestination = {};
        this.filterOrigin = {};
        this.filter();
    }
  }
  filter() {
    this.getAllPublishRates()
  }

  addRatesManually() {
    this._seaFreightService.addDraftRates({ createdBy: this.userProfile.LoginID, providerID: this.userProfile.ProviderID }).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        this.draftDataBYSeaFCL.unshift(res.returnObject);
        if (this.allSeaDraftRatesByFCL && this.allSeaDraftRatesByFCL.length) {
          this.draftsfcl = this.allSeaDraftRatesByFCL.concat(this.draftDataBYSeaFCL);
        } else {
          this.draftsfcl = this.draftDataBYSeaFCL;
        }
        this.generateDraftTable();
        this.updatePopupRates(res.returnObject.ProviderPricingDraftID);

      }
    })
  }
  addRatesManuallyLCL() {
    this._seaFreightService.addDraftRatesLCL({ createdBy: this.userProfile.LoginID, providerID: this.userProfile.ProviderID }).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        this.draftDataBYSeaLCL.unshift(res.returnObject);
        if (this.allSeaDraftRatesByLCL && this.allSeaDraftRatesByLCL.length) {
          this.draftslcl = this.allSeaDraftRatesByLCL.concat(this.draftDataBYSeaLCL);
        } else {
          this.draftslcl = this.draftDataBYSeaLCL;
        }
        this.generateDraftTableLCL();
        this.updatePopupRates(res.returnObject.ConsolidatorPricingDraftID);

      }
    })
  }
  generateDraftTable() {
    this.dtOptionsByGroundDraft = {
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
            if (!data.CarrierName) {
              return "<span>-- Select --</span>"
            }
            else {
              let url = baseExternalAssets + "/" + data.CarrierImage;
              return "<img src='" + url + "' class='icon-size-24 mr-2' />" + data.CarrierName;
            }
          }

        },
        {
          title: 'ORIGIN / DEPARTURE',
          data: function (data) {
            const arrow = '../../../../../../assets/images/icons/grid-arrow.svg';
            if (!data.PolID || !data.PodID) {
              return "<div class='row'> <div class='col-5'><span> -- From -- </span></div> <div class='col-2'><img src='" + arrow + "' /></div> <div class='col-5'><span> -- To -- </span></div> </div>";
            }
            else {
              let polUrl = '../../../../../../assets/images/flags/4x3/' + data.PolCode.split(' ').shift().toLowerCase() + '.svg';
              let podCode = '../../../../../../assets/images/flags/4x3/' + data.PodCode.split(' ').shift().toLowerCase() + '.svg';
              const arrow = '../../../../../../assets/images/icons/grid-arrow.svg';
              return "<div class='row'> <div class='col-5'><img src='" + polUrl + "' class='icon-size-22-14 mr-2' />" + data.PolName + "</div> <div class='col-2'><img src='" + arrow + "' /></div> <div class='col-5'><img src='" + podCode + "' class='icon-size-22-14 mr-2' />" + data.PodName + "</div> </div>";

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
        {
          title: 'CONTAINER',
          data: function (data) {
            if (!data.ContainerSpecName) {
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
          title: '',
          data: function (data) {
            let url = '../../../../../../assets/images/icons/icon_del_round.svg';
            return "<img id='" + data.ProviderPricingDraftID + "' src='" + url + "' class='icon-size-16 pointer' />";
          }
        }
      ],

      info: false,
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
        }
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
          targets: -2,
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
              return "<div class='row'> <div class='col-5'><span> -- From -- </span></div> <div class='col-2'><img src='" + arrow + "' /></div> <div class='col-5'><span> -- To -- </span></div> </div>";
            }
            else {
              let polUrl = '../../../../../../assets/images/flags/4x3/' + data.PolCode.split(' ').shift().toLowerCase() + '.svg';
              let podCode = '../../../../../../assets/images/flags/4x3/' + data.PodCode.split(' ').shift().toLowerCase() + '.svg';
              const arrow = '../../../../../../assets/images/icons/grid-arrow.svg';
              return "<div class='row'> <div class='col-5'><img src='" + polUrl + "' class='icon-size-22-14 mr-2' />" + data.PolName + "</div> <div class='col-2'><img src='" + arrow + "' /></div> <div class='col-5'><img src='" + podCode + "' class='icon-size-22-14 mr-2' />" + data.PodName + "</div> </div>";

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
        {
          title: 'HANDLING UNIT',
          data: function (data) {
            if (!data.ContainerSpecShortName) {
              return "<span>-- Select --</span>"
            }
            else {
              return data.ContainerSpecShortName;
            }
          }
        },
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

      info: false,
      destroy: true,
      // pagingType: 'full_numbers',
      pageLength: 5,
      //scrollX: true,
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
        }
      },
      // fixedColumns: {
      //   leftColumns: 0,
      //   rightColumns: 1
      // },
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
        // let footer = $("<tfoot></tfoot>").appendTo("#draftRateTable");
        // let footertr = $("<tr></tr>").appendTo(footer);
        // $("<td colspan='20'> <a href='javascript:;' class ='addrow'>Add Another Rates</a> </td>").appendTo(footertr);
        // Add footer cells

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
            let rowId = event.currentTarget.cells[0].children[0].children[0].id;
            this.updatePopupRates(rowId);
          }
        });
        // $(alltableOption.table().container()).on('click', 'tfoot tr td a', (event) => {
        //     event.stopPropagation();
        //     this.addAnotherRates();

        // });

        $("#selectallDraftRatesLCL").click((event) => {
          this.publishRatesLCL = [];
          var cols = alltableOption.column(0).nodes();
          this.checkedalldraftRatesLCL = !this.checkedalldraftRatesLCL;
          for (var i = 0; i < cols.length; i += 1) {
            cols[i].querySelector("input[type='checkbox']").checked = this.checkedalldraftRatesLCL;
            if (this.checkedalldraftRatesLCL) {
              this.publishRatesLCL.push(cols[i].querySelector("input[type='checkbox']").id);
            }
          }
          if (i == cols.length && !this.checkedalldraftRatesLCL) {
            this.publishRatesLCL = [];
          }
        });

        $('#draftRateTableLCL').off('click').on('click', 'tbody tr td input[type="checkbox"]', (event) => {
          event.stopPropagation();
          let index = this.publishRatesLCL.indexOf((<HTMLInputElement>event.target).id)
          if (index >= 0) {
            this.publishRatesLCL.splice(index, 1);

          } else {
            this.publishRatesLCL.push((<HTMLInputElement>event.target).id)
          }

        });

      }

    }, 0);
  }
  setdataDraftInTable() {
    setTimeout(() => {
      if (this.tabledraftBySea && this.tabledraftBySea.nativeElement) {
        this.dataTabledraftBysea = $(this.tabledraftBySea.nativeElement);
        let alltableOption = this.dataTabledraftBysea.DataTable(this.dtOptionsByGroundDraft);
        // let footer = $("<tfoot></tfoot>").appendTo("#draftRateTable");
        // let footertr = $("<tr></tr>").appendTo(footer);
        // $("<td colspan='20'> <a href='javascript:;' class ='addrow'>Add Another Rates</a> </td>").appendTo(footertr);
        // Add footer cells

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
            let rowId = event.currentTarget.cells[0].children[0].children[0].id;
            this.updatePopupRates(rowId);
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
            cols[i].querySelector("input[type='checkbox']").checked = this.checkedalldraftRates;
            if (this.checkedalldraftRates) {
              this.publishRates.push(cols[i].querySelector("input[type='checkbox']").id);
            }
          }
          if (i == cols.length && !this.checkedalldraftRates) {
            this.publishRates = [];
          }
        });

        $('#draftRateTable').off('click').on('click', 'tbody tr td input[type="checkbox"]', (event) => {
          event.stopPropagation();
          let index = this.publishRates.indexOf((<HTMLInputElement>event.target).id)
          if (index >= 0) {
            this.publishRates.splice(index, 1);

          } else {
            this.publishRates.push((<HTMLInputElement>event.target).id)
          }

        });
      }

    }, 0);
  }


  updatePopupRates(rowId) {

    let obj = this.draftsfcl.find(obj => obj.ProviderPricingDraftID == rowId);

    const modalRef = this.modalService.open(SeaRateDialogComponent, {
      size: 'lg',
      centered: true,
      windowClass: '',
      backdrop: 'static',
      keyboard: false
    });
    modalRef.result.then((result) => {
      if (result && Object.keys(result).length) {
        this.setAddDraftData(result);
      }
    }, (reason) => {
      // console.log("reason");
    });

    modalRef.componentInstance.selectedData = obj;
    setTimeout(() => {
      if (document.getElementsByTagName('body')[0].classList.contains('modal-open')) {
        document.getElementsByTagName('html')[0].style.overflowY = 'hidden';
      }
    }, 0);

  }

  setAddDraftData(result) {
    for (let index = 0; index < this.draftsfcl.length; index++) {
      if (this.draftsfcl[index].ProviderPricingDraftID == result.providerPricingDraftID) {
        this.draftsfcl[index].CarrierID = result.carrierID;
        this.draftsfcl[index].CarrierImage = result.carrierImage;
        this.draftsfcl[index].CarrierName = result.carrierName;
        this.draftsfcl[index].ContainerLoadType = result.containerLoadType;
        this.draftsfcl[index].ContainerSpecID = result.containerSpecID;
        this.draftsfcl[index].ContainerSpecName = result.containerSpecName;
        this.draftsfcl[index].ShippingCatID = result.shippingCatID;
        this.draftsfcl[index].ShippingCatName = result.shippingCatName;
        this.draftsfcl[index].CurrencyID = result.currencyID;
        this.draftsfcl[index].CurrencyCode = result.currencyCode;
        this.draftsfcl[index].Price = result.price;
        this.draftsfcl[index].EffectiveFrom = result.effectiveFrom;
        this.draftsfcl[index].EffectiveTo = result.effectiveTo;
        this.draftsfcl[index].PodCode = result.podCode;
        this.draftsfcl[index].PolCode = result.polCode;
        this.draftsfcl[index].PodName = result.podName;
        this.draftsfcl[index].PolName = result.polName;
        this.draftsfcl[index].PodID = result.podID;
        this.draftsfcl[index].PolID = result.polID;
        this.generateDraftTable();
        break;
      }
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
  filterBydate(date, type) {
    if (!date && this.fromDate && this.toDate) {
      this.fromDate = null;
      this.toDate = null;
      this.getAllPublishRates();
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
    if (this.fromDate && this.fromDate.month && this.toDate && this.toDate.month) {
      this.getAllPublishRates();
    }
  }

  allservicesBySea() {
    this._sharedService.dataLogisticServiceBySea.subscribe(state => {
      if (state && state.length) {
        for (let index = 0; index < state.length; index++) {
          if (state[index].LogServName == "SEA") {
            this.allCargoType = state[index].DropDownValues.Category;
            this.allContainersType = state[index].DropDownValues.ContainerGround;
            this.allPorts = state[index].DropDownValues.Port.concat(state[index].DropDownValues.GroundPort);
            this.allCurrencies = state[index].DropDownValues.UserCurrency;
            if (state[index].DraftDataFCL) {
              this.allSeaDraftRatesByFCL = state[index].DraftDataFCL;
              this.draftsfcl = this.allSeaDraftRatesByFCL;
            }
            this.generateDraftTable();
            this.draftloading = true;
          }
        }
      }
    })
  }



  filterByroute(obj) {

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
      containerSpecID: (this.filterbyContainerType == 'undefined') ? null : this.filterbyContainerType,
      polID: this.orgfilter(),
      podID: this.destfilter(),
      effectiveFrom: (this.fromDate && this.fromDate.month) ? this.fromDate.month + '/' + this.fromDate.day + '/' + this.fromDate.year : null,
      effectiveTo: (this.toDate && this.toDate.month) ? this.toDate.month + '/' + this.toDate.day + '/' + this.toDate.year : null,
      sortColumn: null,
      sortColumnDirection: null
    }
    this._seaFreightService.getAllrates(obj).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        if (!res.returnObject){
          this.allRatesList = [];
        }
        else{
          this.allRatesList = res.returnObject;
        }
        this.checkedallpublishRates = false;
        this.filterTable();
      }
    })

  }




  filterTable() {
    this.dtOptionsByGround = {
      // ajax: {
      //   url: "http://10.20.1.13:9091/api/providerratefcl/SearchRates",
      //   type: "POST"
      // },
      data: this.allRatesList,
      columns: [
        {
          title: '<div class="fancyOptionBoxes"> <input id = "selectallpublishRates" type = "checkbox"> <label for= "selectallpublishRates"> <span> </span></label></div>',
          data: function (data) {
            return '<div class="fancyOptionBoxes"> <input id = "' + data.id + '" type = "checkbox"> <label for= "' + data.id + '"> <span> </span></label></div>';
          }
        },
        {
          title: 'ORIGIN / DEPARTURE',
          data: function (data) {
            let polUrl = '../../../../../../assets/images/flags/4x3/' + data.polCode.split(' ').shift().toLowerCase() + '.svg';
            let podCode = '../../../../../../assets/images/flags/4x3/' + data.podCode.split(' ').shift().toLowerCase() + '.svg';
            const arrow = '../../../../../../assets/images/icons/grid-arrow.svg';
            return "<div class='row'> <div class='col-5' ><img src='" + polUrl + "' class='icon-size-22-14 mr-2' />" + data.polName + "</div> <div class='col-2'><img src='" + arrow + "' /></div> <div class='col-5'><img src='" + podCode + "' class='icon-size-22-14 mr-2' />" + data.podName + "</div> </div>";
          },
          className: "routeCell"
        },
        {
          title: 'TYPE',
          data: 'type',
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
            return "<img src='" + url + "' class='icon-size-16' />";
          },
          className: 'moreOption'
        }
      ],
      // processing: true,
      // serverSide: true,
      // retrieve: true,
      destroy: true,
      // pagingType: 'full_numbers',
      pageLength: 5,
      // scrollX: true,
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
        }
      },
      // fixedColumns: {
      //   leftColumns: 0,
      //   rightColumns: 1
      // },
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
            return "<div class='row'> <div class='col-5' ><img src='" + polUrl + "' class='icon-size-22-14 mr-2' />" + data.polName + "</div> <div class='col-2'><img src='" + arrow + "' /></div> <div class='col-5'><img src='" + podCode + "' class='icon-size-22-14 mr-2' />" + data.podName + "</div> </div>";
          },
          className: "routeCell"
        },
        {
          title: 'CARGO TYPE',
          data: 'shippingCatName',
        },
        {
          title: 'HANDLING UNIT',
          data: 'containerSpecShortName',
        },
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
      // processing: true,
      // serverSide: true,
      // retrieve: true,
      destroy: true,
      // pagingType: 'full_numbers',
      pageLength: 5,
      //scrollX: true,
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
        }
      },
      // fixedColumns: {
      //   leftColumns: 0,
      //   rightColumns: 1
      // },
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
              this.selectedItem('add', alltableOption)
            }
          }
          if (i == cols.length && !this.checkedallpublishRatesLcl) {
            this.delPublishRatesLcl = [];
            this.selectedItem('remove', alltableOption)

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
        });
      }
    }, 0);
  }



  setdataInTable() {
    setTimeout(() => {
      if (this.tablepublishBySea && this.tablepublishBySea.nativeElement) {
        this.dataTablepublishBysea = $(this.tablepublishBySea.nativeElement);
        let alltableOption = this.dataTablepublishBysea.DataTable(this.dtOptionsByGround);
        this.publishloading = false;
        $("#selectallpublishRates").click(() => {
          this.delPublishRates = [];
          var cols = alltableOption.column(0).nodes();



          this.checkedallpublishRates = !this.checkedallpublishRates;
          for (var i = 0; i < cols.length; i += 1) {
            cols[i].querySelector("input[type='checkbox']").checked = this.checkedallpublishRates;
            if (this.checkedallpublishRates) {
              this.delPublishRates.push(cols[i].querySelector("input[type='checkbox']").id);
              this.selectedItem('add', alltableOption)
            }
          }
          if (i == cols.length && !this.checkedallpublishRates) {
            this.delPublishRates = [];
            this.selectedItem('remove', alltableOption)

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
            this.delPublishRates.push((<HTMLInputElement>event.target).id)
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
        // ... do something with data(), or this.node(), etc
      });
    }
  }
  orgfilter() {
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
  destfilter() {
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



}
