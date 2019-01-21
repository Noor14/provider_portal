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
import { getJwtToken } from '../../../../../services/jwt.injectable';
import { SharedService } from '../../../../../services/shared.service';
import { baseExternalAssets } from '../../../../../constants/base.url';
import { ConfirmDeleteDialogComponent } from '../../../../../shared/dialogues/confirm-delete-dialog/confirm-delete-dialog.component';
// import { NgModel } from '@angular/forms';
import * as moment from 'moment';
import { DataTableDirective } from 'angular-datatables';
import { GroundRateDialogComponent } from '../../../../../shared/dialogues/ground-rate-dialog/ground-rate-dialog.component';
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
export class GroundTransportComponent implements OnInit, OnDestroy  {


  private draftRates: any;
  private addnsaveRates: any;
  public dtOptionsByGround: DataTables.Settings | any = {};
  public dtOptionsByGroundDraft: DataTables.Settings | any = {};
  @ViewChild('draftBYGround') tabledraftByGround;
  @ViewChild('publishByground') tablepublishByGround;
  @ViewChild("dp") input: NgbInputDatepicker;
  // @ViewChild(NgModel) datePick: NgModel;
  @ViewChild('rangeDp') rangeDp: ElementRef;
  // @ViewChild(DataTableDirective) dtElement: DataTableDirective;

  public dataTablepublishByground: any;
  public dataTabledraftByground: any;
  public allRatesList: any;
  public publishloading: boolean;
  public draftloading: boolean = true;
  public allCargoType: any[] = []
  public allContainersType: any[] = [];
  public allHandlingType: any[] = [];
  public allPorts: any[] = [];
  public allCurrencies: any[] = [];
  public draftRatesByGround: any[] = [];
  public draftDataBYGround: any[] = [];
  public draftslist: any[] = [];
  public delPublishRates: any[] = [];
  public publishRates: any[] = [];
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
  public filterbyHandlingType;
  public checkedallpublishRates: boolean = false;
  public checkedalldraftRates: boolean = false;

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
    this.allservicesByGround();
    this.addnsaveRates = this._sharedService.draftRowAddGround.subscribe(state => {
      if (state && Object.keys(state).length) {
        this.setRowinDRaftTable(state, 'popup not open');
      }
    })
  }


  ngOnDestroy() {
    this.draftRates.unsubscribe();
    this.addnsaveRates.unsubscribe();
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
        this.model = null;
        this.fromDate = null;
        this.toDate = null;
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
    this._seaFreightService.addDraftRates({ createdBy: this.userProfile.LoginID, providerID: this.userProfile.ProviderID, transportType: "GROUND" }).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        this.setRowinDRaftTable(res.returnObject, 'openPopup');
      }
    })
  }

  setRowinDRaftTable(obj, type) {
    this.draftDataBYGround.unshift(obj);
    if (this.draftRatesByGround && this.draftRatesByGround.length) {
      this.draftslist = this.draftRatesByGround.concat(this.draftDataBYGround);
    } else {
      this.draftslist = this.draftDataBYGround;
    }
    if (type == 'openPopup') {
      this.updatePopupRates(obj.ID);
    }
    this.generateDraftTable();
  }

  generateDraftTable() {
    this.dtOptionsByGroundDraft = {
      data: this.draftslist,
      columns: [
        {
          title: '<div class="fancyOptionBoxes"> <input id = "selectallDraftRates" type = "checkbox"> <label for= "selectallDraftRates"> <span> </span></label></div>',
          data: function (data) {
            return '<div class="fancyOptionBoxes"> <input id = "' + data.ID + '" type = "checkbox"> <label for= "' + data.ID + '"> <span> </span></label></div>';
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
          title: 'TYPE',
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
          title: 'SIZE',
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
            return "<img id='" + data.ID + "' src='" + url + "' class='icon-size-16 pointer' />";
          }
        }
      ],
      drawCallback: function () {
        let $api = this.api();
        let pages = $api.page.info().pages;
        if (pages === 1 || !pages) {
          $('.draft-Ground .dataTables_paginate').hide();
        } else {
          // SHow everything
          $('.draft-Ground .dataTables_paginate').show();
        }
      },
      info: true,
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

    }

    this.setdataDraftInTable();
  }

  setdataDraftInTable() {
    setTimeout(() => {
      if (this.tabledraftByGround && this.tabledraftByGround.nativeElement) {
        this.dataTabledraftByground = $(this.tabledraftByGround.nativeElement);
        let alltableOption = this.dataTabledraftByground.DataTable(this.dtOptionsByGroundDraft);
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
            this.updatePopupRates(rowId);
            }
          }
        });

        $("#selectallDraftRates").click((event) => {
          this.publishRates = [];
          var cols = alltableOption.column(0).nodes();
          this.checkedalldraftRates = !this.checkedalldraftRates;
          for (var i = 0; i < cols.length; i += 1) {
            cols[i].querySelector("input[type='checkbox']").checked = this.checkedalldraftRates;
            if (this.checkedalldraftRates) {
             let obj = {
                draftID: cols[i].querySelector("input[type='checkbox']").id,
                providerID: this.userProfile.ProviderID,
                transportType: "GROUND",
              }
              this.publishRates.push(obj);
            }
          }
          if (i == cols.length && !this.checkedalldraftRates) {
            this.publishRates = [];
          }
        });

        $('#draftRateTable').off('click').on('click', 'tbody tr td input[type="checkbox"]', (event) => {
          event.stopPropagation();
          let targetedId = (<HTMLInputElement>event.target).id
          let index = this.publishRates.findIndex(obj => obj.draftID == targetedId);
            if (index >= 0) {
              this.publishRates.splice(index, 1);
          }
          else {
            let obj = {
              draftID: targetedId,
              providerID: this.userProfile.ProviderID,
              transportType: "GROUND",
            }
            this.publishRates.push(obj)
          }

        });
      }

    }, 0);
  }


  updatePopupRates(rowId) {
    let obj = this.draftslist.find(obj => obj.ID == rowId);
    const modalRef = this.modalService.open(GroundRateDialogComponent, {
      size: 'lg',
      centered: true,
      windowClass: '',
      backdrop: 'static',
      keyboard: false
    });
    modalRef.result.then((result) => {
      if (result && result.data && result.data.length) {
        this.setAddDraftData(result.data);
      }
    });

    modalRef.componentInstance.selectedData = obj;
    setTimeout(() => {
      if (document.getElementsByTagName('body')[0].classList.contains('modal-open')) {
        document.getElementsByTagName('html')[0].style.overflowY = 'hidden';
      }
    }, 0);

  }

  setAddDraftData(data) {
    for (var index = 0; index < this.draftslist.length; index++) {
      for (let i = 0; i < data.length; i++) {
        if (this.draftslist[index].ID == data[i].ID) {
          // this.draftslist[index].CarrierID = data[i].carrierID;
          // this.draftslist[index].CarrierImage = data[i].carrierImage;
          // this.draftslist[index].CarrierName = data[i].carrierName;
          this.draftslist[index].ContainerLoadType = data[i].containerLoadType;
          this.draftslist[index].ShippingCatID = data[i].shippingCatID;
          this.draftslist[index].ShippingCatName = data[i].shippingCatName;
          this.draftslist[index].ContainerSpecID = data[i].containerSpecID;
          this.draftslist[index].ContainerSpecName = data[i].containerSpecName;
          this.draftslist[index].CurrencyID = data[i].currencyID;
          this.draftslist[index].CurrencyCode = data[i].currencyCode;
          this.draftslist[index].EffectiveFrom = data[i].effectiveFrom;
          this.draftslist[index].EffectiveTo = data[i].effectiveTo;
          this.draftslist[index].PodCode = data[i].podCode;
          this.draftslist[index].PolCode = data[i].polCode;
          this.draftslist[index].PodName = data[i].podName;
          this.draftslist[index].PolName = data[i].polName;
          this.draftslist[index].PodID = data[i].podID;
          this.draftslist[index].PolID = data[i].polID;
          this.draftslist[index].Price = data[i].price;
        }
      }
    }
    if (index == this.draftslist.length) {
      this.generateDraftTable();
    }
  }
  
  addAnotherRates() {
      this.addRatesManually();
 
  }
  addRatesByseaManually() {
      if ((!this.draftRatesByGround || (this.draftRatesByGround && !this.draftRatesByGround.length)) && (!this.draftDataBYGround || (this.draftDataBYGround && !this.draftDataBYGround.length))) {
        this.addRatesManually();
    }
  }


  filterBydate(date) {
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

  allservicesByGround() {
    this.draftRates = this._sharedService.dataLogisticServiceBySea.subscribe(state => {
      if (state && state.length) {
        for (let index = 0; index < state.length; index++) {
          if (state[index].LogServName == "SEA") {
            this.allCargoType = state[index].DropDownValues.Category;
            this.allContainersType = state[index].DropDownValues.ContainerGround;
            this.allPorts = state[index].DropDownValues.Port.concat(state[index].DropDownValues.GroundPort);
            this.allCurrencies = state[index].DropDownValues.UserCurrency;
            if (state[index].DraftDataGround && state[index].DraftDataGround.length) {
              this.draftRatesByGround = state[index].DraftDataGround;
              this.draftslist = this.draftRatesByGround;
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
  filtertionPort(obj) {
      if ((typeof obj == "object" && Object.keys(obj).length) || (typeof obj == "string" && obj)) this.getAllPublishRates();

  }

  getAllPublishRates() {
    this.publishloading = true;
    let obj = {
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
          data: function (data) {
            return (Number(data.priceWithCode.split(' ').pop())).toLocaleString('en-US', {
              style: 'currency',
              currency: data.priceWithCode.split(' ').shift(),
            });
          },
        },
        {
          title: 'SIZE',
          data: function (data) {
            return (Number(data.priceWithCode.split(' ').pop())).toLocaleString('en-US', {
              style: 'currency',
              currency: data.priceWithCode.split(' ').shift(),
            });
          },
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


  setdataInTable() {
    setTimeout(() => {
      if (this.tablepublishByGround && this.tablepublishByGround.nativeElement) {
        this.dataTablepublishByground = $(this.tablepublishByGround.nativeElement);
        let alltableOption = this.dataTablepublishByground.DataTable(this.dtOptionsByGround);
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
    this.draftslist.forEach(elem => {
      let obj = {
          draftID: elem.ID,
          transportType: "GROUND",
          }
      discardarr.push(obj)
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
        this.draftslist = [];
        this.draftRatesByGround = [];
        this.draftDataBYGround = [];
        this.publishRates = [];
        this.generateDraftTable();
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

  publishRate() {
    this._seaFreightService.publishDraftRate(this.publishRates).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        for (var i = 0; i < this.publishRates.length; i++) {
          for (let y = 0; y < this.draftslist.length; y++) {
            if (this.draftslist[y].ID == this.publishRates[i].draftID) {
              this.draftslist.splice(y, 1);
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
        for (let index = 0; index < this.draftslist.length; index++) {
          if (this.draftslist[index].ID == id) {
            this.draftslist.splice(index, 1);
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
      data: [{
        draftID: id,
        transportType: "GROUND",

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

}
