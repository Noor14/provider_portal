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
import { SeaFreightService } from './sea-freight.service';
import { getJwtToken } from '../../../../../services/jwt.injectable';
import { SharedService } from '../../../../../services/shared.service';
import { baseExternalAssets } from '../../../../../constants/base.url';
import { ConfirmDeleteDialogComponent } from '../../../../../shared/dialogues/confirm-delete-dialog/confirm-delete-dialog.component';
// import { NgModel } from '@angular/forms';
import * as moment from 'moment';
import { DataTableDirective } from 'angular-datatables';
import { SeaRateDialogComponent } from '../../../../../shared/dialogues/sea-rate-dialog/sea-rate-dialog.component';
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
export class SeaFreightComponent implements OnInit {

  public dtOptionsBySeaFCL: DataTables.Settings | any = {};
  public dtOptionsBySeaLCL: DataTables.Settings | any = {};
  public dtOptionsBySeaFCLDraft: DataTables.Settings | any = {};
  @ViewChild('draftBYsea') tabledraftBySea;
  @ViewChild('publishBysea') tablepublishBySea;
  @ViewChild('publishByseaLcl') tablepublishBySeaLcl;
  @ViewChild("dp") input: NgbInputDatepicker;
  // @ViewChild(NgModel) datePick: NgModel;
  @ViewChild('rangeDp') rangeDp: ElementRef;
  // @ViewChild(DataTableDirective) dtElement: DataTableDirective;

  public dataTablepublishBysea: any;
  public dataTablepublishByseaLcl: any;
  public dataTabledraftBysea: any;
  public allRatesList: any;
  public allRatesListLcL: any;
  public publishloading: boolean;
  public publishloadingLcl: boolean;
  public draftloading: boolean = true;
  public allShippingLines: any[] = [];
  public allCargoType: any[] = []
  public allContainersType: any[] = [];
  public allPorts: any[] = [];
  public allCurrencies: any[] = [];
  public allSeaDraftRatesByFCL: any[] = [];
  public draftDataBYSeaFCL: any[] = [];
  public draftsfcl: any[] = [];
  public delPublishRates: any[] = [];
  public delPublishRatesLcl: any[] = [];
  public publishRates: any[] = [];
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
  public checkedallpublishRates: boolean = false;
  public checkedallpublishRatesLcl: boolean = false;
  public checkedalldraftRates: boolean = false;

  isHovered = date =>
    this.fromDate && !this.toDate && this.hoveredDate && after(date, this.fromDate) && before(date, this.hoveredDate)
  isInside = date => after(date, this.fromDate) && before(date, this.toDate);
  isFrom = date => equals(date, this.fromDate);
  isTo = date => equals(date, this.toDate);
  constructor(
    private modalService: NgbModal,
    private _seaFreightService: SeaFreightService,
    private _sharedService: SharedService,
    private element: ElementRef,
    private renderer: Renderer2,
    private _parserFormatter: NgbDateParserFormatter,
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

  }

  clearFilter(event) {
    event.preventDefault();
    event.stopPropagation();
    if ((this.filterbyShippingLine && this.filterbyShippingLine != 'undefined') ||
      (this.filterbyCargoType && this.filterbyCargoType != 'undefined') ||
      (this.filterbyContainerType && this.filterbyContainerType != 'undefined') ||
      (this.filterDestination && Object.keys(this.filterDestination).length) ||
      (this.filterOrigin && Object.keys(this.filterOrigin).length)
    ) {
      this.filterbyShippingLine = 'undefined';
      this.filterbyCargoType = 'undefined';
      this.filterbyContainerType = 'undefined';
      this.filterDestination = {};
      this.filterOrigin = {};
      this.filter();
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
        console.log(res.returnObject);
        this.draftDataBYSeaFCL.unshift(res.returnObject);
        if (this.allSeaDraftRatesByFCL && this.allSeaDraftRatesByFCL.length) {
          this.draftsfcl = this.allSeaDraftRatesByFCL.concat(this.draftDataBYSeaFCL);
        } else {
          this.draftsfcl = this.draftDataBYSeaFCL;
        }
        this.generateDraftTable();
      }
    })
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
            if (!data.CarrierName) {
              return "<span>--Select--</span>"
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
              return "<div class='row'> <div class='col-5'><span> --From-- </span></div> <div class='col-2'><img src='" + arrow + "' /></div> <div class='col-5'><span> --To-- </span></div> </div>";
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
              return "<span>--Select--</span>"
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
              return "<span>--Select--</span>"
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
              return "<span>--Select--</span>"
            }
            else {
              return data.CurrencyCode + ' ' + data.Price;
            }
          }
        },
        {
          title: 'RATE VALIDITY',
          data: function (data) {
            if (!data.EffectiveFrom || !data.EffectiveTo) {
              return "<span>--Select--</span>"
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

  setdataDraftInTable() {
    setTimeout(() => {
      this.dataTabledraftBysea = $(this.tabledraftBySea.nativeElement);
      let alltableOption = this.dataTabledraftBysea.DataTable(this.dtOptionsBySeaFCLDraft);
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


    }, 0);
  }

  updatePopupRates(rowId) {
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

    modalRef.componentInstance.addRateId = rowId;
    setTimeout(() => {
      if (document.getElementsByTagName('body')[0].classList.contains('modal-open')) {
        document.getElementsByTagName('html')[0].style.overflowY = 'hidden';
      }
    }, 0);

  }

  setAddDraftData(result) {
    for (let index = 0; index < this.draftsfcl.length; index++) {
      if (this.draftsfcl[index].ProviderPricingDraftID == result.providerPricingDraftID) {
        this.draftsfcl[index].carrierID = result.carrierID;
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
        this.draftsfcl[index].PolID = result.polName;
        this.generateDraftTable();
        break;
      }
    }
  }
  addAnotherRates() {
    this.addRatesManually();
  }
  addRatesByseaManually() {
    if ((!this.allSeaDraftRatesByFCL || (this.allSeaDraftRatesByFCL && !this.allSeaDraftRatesByFCL.length)) && (!this.draftDataBYSeaFCL || (this.draftDataBYSeaFCL && !this.draftDataBYSeaFCL.length))) {
      this.addRatesManually();

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
    this._sharedService.dataLogisticServiceBySea.subscribe(state => {
      if (state && state.length) {
        for (let index = 0; index < state.length; index++) {
          if (state[index].LogServName == "SEA") {
            this.allShippingLines = state[index].DropDownValues.ShippingLine;
            this.allCargoType = state[index].DropDownValues.Category;
            this.allContainersType = state[index].DropDownValues.ContainerFCL;
            this.allPorts = state[index].DropDownValues.Port;
            this.allCurrencies = state[index].DropDownValues.UserCurrency;
            if (state[index].DraftDataFCL) {
              this.allSeaDraftRatesByFCL = this.filterByDate(state[index].DraftDataFCL);
              this.draftsfcl = this.allSeaDraftRatesByFCL;
            }
            this.generateDraftTable();
            this.draftloading = true;
          }
        }
      }
    })
  }
  filterByDate(allSeaDraftRatesByFCL) {
    return allSeaDraftRatesByFCL.sort(function (a, b) {
      let dateA: any = new Date(a.CreatedDateTime);
      let dateB: any = new Date(b.CreatedDateTime);
      return dateB - dateA;
    });
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
  filtertionPort(obj, type) {
    if(type == "FCL"){
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
      effectiveFrom: null,
      effectiveTo: null,
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
      polID: this.orgfilter("LCL"),
      podID: this.destfilter("LCL"),
      effectiveFrom: null,
      effectiveTo: null,
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
      // ajax: {
      //   url: "http://10.20.1.13:9091/api/providerratefcl/SearchRates",
      //   type: "POST"
      // },
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
          defaultContent: '<select><option disable>-- Select --</option> <option>One</option></select>'
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
          title: 'CONTAINER',
          data: 'containerSpecDesc',
        },
        {
          title: 'RATE',
          data: 'priceWithCode'
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
          title: 'RATE / CBM',
          data: function (data) {
            return data.currencyCode + ' ' + data.price
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
          targets: 1,
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
      ]
    };
    this.setdataInTableLcl();
  }

  setdataInTableLcl() {
    setTimeout(() => {
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

    }, 0);
  }



  setdataInTable() {
    setTimeout(() => {
      this.dataTablepublishBysea = $(this.tablepublishBySea.nativeElement);
      let alltableOption = this.dataTablepublishBysea.DataTable(this.dtOptionsBySeaFCL);
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

  deletepublishRecord() {
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



}
