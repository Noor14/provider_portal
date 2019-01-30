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
import { AirFreightService } from './air-freight.service';
import { getJwtToken } from '../../../../../services/jwt.injectable';
import { SharedService } from '../../../../../services/shared.service';
import { baseExternalAssets } from '../../../../../constants/base.url';
import { ConfirmDeleteDialogComponent } from '../../../../../shared/dialogues/confirm-delete-dialog/confirm-delete-dialog.component';
// import { NgModel } from '@angular/forms';
import * as moment from 'moment';
// import { DataTableDirective } from 'angular-datatables';
import { AirRateDialogComponent } from '../../../../../shared/dialogues/air-rate-dialog/air-rate-dialog.component';
import { NgbDateFRParserFormatter } from '../../../../../constants/ngb-date-parser-formatter';
import { ManageRatesService } from '../manage-rates.service';
import { ToastrService } from 'ngx-toastr';
import { FormControl, FormGroup, Validators, FormArray } from '@angular/forms';

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
  selector: 'app-air-freight',
  templateUrl: './air-freight.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./air-freight.component.scss'],
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
export class AirFreightComponent implements OnInit, OnDestroy {

  private draftRates: any;
  private addnsaveRates: any;
  
  public dtOptionsByAir: DataTables.Settings | any = {};
  public dtOptionsByAirDraft: DataTables.Settings | any = {};
  @ViewChild('draftBYair') tabledraftByAir;
  @ViewChild('publishByair') tablepublishByAir;
  @ViewChild("dp") input: NgbInputDatepicker;
  // @ViewChild(NgModel) datePick: NgModel;
  @ViewChild('rangeDp') rangeDp: ElementRef;
  // @ViewChild(DataTableDirective) dtElement: DataTableDirective;

  public dataTablepublishByAir: any;
  public datatabledraftByAir: any;
  public allRatesList: any;
  public publishloading: boolean;
  public draftloading: boolean = true;
  public allAirLines: any[] = [];
  public allCargoType: any[] = []
  public allPorts: any[] = [];
  public allCurrencies: any[] = [];
  public allSeaDraftRatesByAIR: any[] = [];
  public draftDataBYAIR: any[] = [];
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

  public filterbyAirLine;
  public filterbyCargoType;
  public checkedallpublishRates: boolean = false;
  public checkedalldraftRates: boolean = false;
  // term and condition
  public policyForm : any;
  public termNcondError: boolean;
  public disable: boolean;

  isHovered = date =>
    this.fromDate && !this.toDate && this.hoveredDate && after(date, this.fromDate) && before(date, this.hoveredDate)
  isInside = date => after(date, this.fromDate) && before(date, this.toDate);
  isFrom = date => equals(date, this.fromDate);
  isTo = date => equals(date, this.toDate);

  constructor(
    private modalService: NgbModal,
    private _airFreightService: AirFreightService,
    private _sharedService: SharedService,
    private element: ElementRef,
    private renderer: Renderer2,
    private _parserFormatter: NgbDateParserFormatter,
    private _manageRatesService: ManageRatesService,
    private _toast: ToastrService
  ) { }

  ngOnInit() {
    let userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo && userInfo.returnText) {
      this.userProfile = JSON.parse(userInfo.returnText);
    }

    this.policyForm = new FormGroup({
      termNcond: new FormControl(null, [Validators.required, Validators.maxLength(5000)]),
    });

    this.startDate = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
    this.maxDate = { year: now.getFullYear() + 1, month: now.getMonth() + 1, day: now.getDate() };
    this.minDate = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
    this.getAllPublishRates();
    this.allservicesByAir();
    this.addnsaveRates = this._sharedService.draftRowAddAir.subscribe(state => {
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
      if ((this.filterbyAirLine && this.filterbyAirLine != 'undefined') ||
        (this.filterbyCargoType && this.filterbyCargoType != 'undefined') ||
        (this.filterDestination && Object.keys(this.filterDestination).length) ||
        (this.filterOrigin && Object.keys(this.filterOrigin).length) ||
        (this.fromDate && Object.keys(this.fromDate).length) ||
        (this.toDate && Object.keys(this.toDate).length)
      ) {
        this.model = null;
        this.fromDate = null;
        this.toDate = null;
        this.filterbyAirLine = 'undefined';
        this.filterbyCargoType = 'undefined';
        this.filterDestination = {};
        this.filterOrigin = {};
        this.filter();
      }
  }
  filter() {
    this.getAllPublishRates()
  }
   addRatesManually() {
     this._airFreightService.addDraftRates({ createdBy: this.userProfile.LoginID, providerID: this.userProfile.ProviderID, currencyID : 101 }).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        this.setRowinDRaftTable(res.returnObject, 'openPopup');
      }
    })
  }

  setRowinDRaftTable(obj, type) {
    if (typeof obj.slab == "string"){
      obj.slab = JSON.parse(obj.slab);
    }
    this.draftDataBYAIR.unshift(obj);
    if (this.allSeaDraftRatesByAIR && this.allSeaDraftRatesByAIR.length) {
      this.draftslist = this.allSeaDraftRatesByAIR.concat(this.draftDataBYAIR);
    } else {
      this.draftslist = this.draftDataBYAIR;
    }
    if (type == 'openPopup') {
    this.updatePopupRates(obj.CarrierPricingSetID);
  }
    this.generateDraftTable();
  }
  
  generateDraftTable() {
    this.dtOptionsByAirDraft = {
     data: this.draftslist,
      columns: [
        {
          title: '<div class="fancyOptionBoxes"> <input id = "selectallDraftRates" type = "checkbox"> <label for= "selectallDraftRates"> <span> </span></label></div>',
          data: function (data) {
            return '<div class="fancyOptionBoxes"> <input id = "' + data.CarrierPricingSetID + '" type = "checkbox"> <label for= "' + data.CarrierPricingSetID + '"> <span> </span></label></div>';
          }
        },
        {
          title: 'AIRLINE',
          data: function (data) {
            if (!data.CarrierID) {
              return "<span>-- Select --</span>"
            }
            else {
              let url = baseExternalAssets + "/" + data.CarrierImage;
              return "<img src='" + url + "' class='icon-size-24 mr-2' />" + data.CarrierName;
            }
          },
          className: "carrierName"
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
          title: 'MINIMUM PRICE',
          data: function (data) {
            let minPrice = data.slab.minPrice1.split(' ').pop();
            if (data.slab && data.slab.minPrice1 && Math.ceil(minPrice)){
            return (Number(data.slab.minPrice1.split(' ').pop())).toLocaleString('en-US', {
              style: 'currency',
              currency: data.slab.minPrice1.split(' ').shift(),
            });
            }
            else{
              return "<span>-- Select --</span>"
            }
          },
        },
        {
          title: 'NORMAL PRICE',
          data: function (data) {
            let normalPrice = data.slab.priceWithCode1.split(' ').pop()
            if (data.slab && data.slab.priceWithCode1 && Math.ceil(normalPrice)){
              return (Number(data.slab.priceWithCode1.split(' ').pop())).toLocaleString('en-US', {
                style: 'currency',
                currency: data.slab.priceWithCode1.split(' ').shift(),
              });
            }
            else {
              return "<span>-- Select --</span>"
            }
          },
        },
        {
          title: '+45 PRICE',
          data: function (data) {
            let plusFortyFivePrice = data.slab.priceWithCode2.split(' ').pop()
            if (data.slab && data.slab.priceWithCode2 && Math.ceil(plusFortyFivePrice)) {
            return (Number(data.slab.priceWithCode2.split(' ').pop())).toLocaleString('en-US', {
              style: 'currency',
              currency: data.slab.priceWithCode2.split(' ').shift(),
            });
          }
          else{
              return "<span>-- Select --</span>"
          }
          },
        },
 
        {
          title: '+100 PRICE',
          data: function (data) {
            let plusHundredPrice = data.slab.priceWithCode3.split(' ').pop()
            if (data.slab && data.slab.priceWithCode3 && Math.ceil(plusHundredPrice)){
              return (Number(data.slab.priceWithCode3.split(' ').pop())).toLocaleString('en-US', {
                style: 'currency',
                currency: data.slab.priceWithCode3.split(' ').shift(),
              });
            }
              else{
            return "<span>-- Select --</span>"
          }
          },
        },

        {
          title: '+250 PRICE',
          data: function (data) {
            let plustwoFityPrice = data.slab.priceWithCode4.split(' ').pop()
            if (data.slab && data.slab.priceWithCode4 && Math.ceil(plustwoFityPrice)) {
            return (Number(data.slab.priceWithCode4.split(' ').pop())).toLocaleString('en-US', {
              style: 'currency',
              currency: data.slab.priceWithCode4.split(' ').shift(),
            });
          }
            else {
              return "<span>-- Select --</span>"
            }
          },
        },

        {
          title: '+500 PRICE',
          data: function (data) {
            let plusFiveHundredPrice = data.slab.priceWithCode5.split(' ').pop();
            if (data.slab && data.slab.priceWithCode5 && Math.ceil(plusFiveHundredPrice)) {
            return (Number(data.slab.priceWithCode5.split(' ').pop())).toLocaleString('en-US', {
              style: 'currency',
              currency: data.slab.priceWithCode5.split(' ').shift(),
            });
          }
            else {
              return "<span>-- Select --</span>"
            }
          },
        },
        {
          title: '+1000 PRICE',
          data: function (data) {
            let plusThousandPrice = data.slab.priceWithCode6.split(' ').pop()
            if (data.slab && data.slab.priceWithCode6 && Math.ceil(plusThousandPrice)) {
            return (Number(data.slab.priceWithCode6.split(' ').pop())).toLocaleString('en-US', {
              style: 'currency',
              currency: data.slab.priceWithCode6.split(' ').shift(),
            });
          }
          else{
              return "<span>-- Select --</span>"
          }
          },
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
            return "<img id='" + data.CarrierPricingSetID + "' src='" + url + "' class='icon-size-16 pointer' />";
          }
        }
      ],
      drawCallback: function () {
        let $api = this.api();
        let pages = $api.page.info().pages;
        if (pages === 1 || !pages) {
          $('.draft-Air .dataTables_paginate').hide();
        } else {
          // SHow everything
          $('.draft-Air .dataTables_paginate').show();
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
        }
      },
      fixedColumns: {
        leftColumns: 0,
        rightColumns: 1,
        scrollY: 'none'
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

    this.setdataDraftInTable();
  }

  setdataDraftInTable() {
    setTimeout(() => {
      if (this.tabledraftByAir && this.tabledraftByAir.nativeElement) {
        this.datatabledraftByAir = $(this.tabledraftByAir.nativeElement);
        let alltableOption = this.datatabledraftByAir.DataTable(this.dtOptionsByAirDraft);
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
              this.publishRates.push(cols[i].querySelector("input[type='checkbox']").id);
              this.selectedItem('add', alltableOption);
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
            selection.classList.push('selected');
          }

        });
      }

    }, 0);
  }


  updatePopupRates(rowId) {
    let obj = this.draftslist.find(obj => obj.CarrierPricingSetID == rowId);
    const modalRef = this.modalService.open(AirRateDialogComponent, {
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
    }, (reason) => {
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
        if (this.draftslist[index].CarrierPricingSetID == data[i].carrierPricingSetID) {
          this.draftslist[index].CarrierID = data[i].carrierID;
          this.draftslist[index].CarrierImage = data[i].carrierImage;
          this.draftslist[index].CarrierName = data[i].carrierName;
          this.draftslist[index].ContainerLoadType = data[i].containerLoadType;
          this.draftslist[index].ShippingCatID = data[i].shippingCatID;
          this.draftslist[index].ShippingCatName = data[i].shippingCatName;
          this.draftslist[index].CurrencyID = data[i].currencyID;
          this.draftslist[index].CurrencyCode = data[i].currencyCode;
          this.draftslist[index].slab.priceWithCode1 = data[i].objSlab.priceWithCode1;
          this.draftslist[index].slab.priceWithCode2 = data[i].objSlab.priceWithCode2;
          this.draftslist[index].slab.priceWithCode3 = data[i].objSlab.priceWithCode3;
          this.draftslist[index].slab.priceWithCode4 = data[i].objSlab.priceWithCode4;
          this.draftslist[index].slab.priceWithCode5 = data[i].objSlab.priceWithCode5;
          this.draftslist[index].slab.priceWithCode6 = data[i].objSlab.priceWithCode6;

          this.draftslist[index].slab.minPrice1 = data[i].objSlab.minPrice1;
          this.draftslist[index].slab.minPrice2 = data[i].objSlab.minPrice2;
          this.draftslist[index].slab.minPrice3 = data[i].objSlab.minPrice3;
          this.draftslist[index].slab.minPrice4 = data[i].objSlab.minPrice4;
          this.draftslist[index].slab.minPrice5 = data[i].objSlab.minPrice5;
          this.draftslist[index].slab.minPrice6 = data[i].objSlab.minPrice6;

          this.draftslist[index].slab.price1 = data[i].objSlab.price1;
          this.draftslist[index].slab.price2 = data[i].objSlab.price2;
          this.draftslist[index].slab.price3 = data[i].objSlab.price3;
          this.draftslist[index].slab.price4 = data[i].objSlab.price4;
          this.draftslist[index].slab.price5 = data[i].objSlab.price5;
          this.draftslist[index].slab.price6 = data[i].objSlab.price6;

          this.draftslist[index].EffectiveFrom = data[i].effectiveFrom;
          this.draftslist[index].EffectiveTo = data[i].effectiveTo;
          this.draftslist[index].PodCode = data[i].podCode;
          this.draftslist[index].PolCode = data[i].polCode;
          this.draftslist[index].PodName = data[i].podName;
          this.draftslist[index].PolName = data[i].polName;
          this.draftslist[index].PodID = data[i].podID;
          this.draftslist[index].PolID = data[i].polID;
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
  addRatesByAirManually() {
      if ((!this.allSeaDraftRatesByAIR || (this.allSeaDraftRatesByAIR && !this.allSeaDraftRatesByAIR.length)) && (!this.draftDataBYAIR || (this.draftDataBYAIR && !this.draftDataBYAIR.length))) {
        this.addRatesManually();
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

  allservicesByAir() {
    this.draftRates = this._sharedService.dataLogisticServiceBySea.subscribe(state => {
      if (state && state.length) {
        for (let index = 0; index < state.length; index++) {
          if (state[index].LogServName == "SEA") {
            this.allAirLines = state[index].DropDownValues.AirLine;
            this.allCargoType = state[index].DropDownValues.Category;
            this.allPorts = state[index].DropDownValues.AirPort;
            this.allCurrencies = state[index].DropDownValues.UserCurrency;
            if(state[index].TCAIR){
            this.policyForm.controls['termNcond'].setValue(state[index].TCAIR);
            this.disable = true;
            }
            if (state[index].DraftDataAir && state[index].DraftDataAir.length) {
              state[index].DraftDataAir.map(elem => {
                if (typeof elem.slab == "string") {
                elem.slab = JSON.parse(elem.slab)
              }
              });
              this.allSeaDraftRatesByAIR = state[index].DraftDataAir;
              this.draftslist = this.allSeaDraftRatesByAIR;
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
      pageNo: 1,
      pageSize: 50,
      providerID: this.userProfile.ProviderID,
      carrierID: (this.filterbyAirLine == 'undefined') ? null : this.filterbyAirLine,
      shippingCatID: (this.filterbyCargoType == 'undefined') ? null : this.filterbyCargoType,
      polID: this.orgfilter(),
      podID: this.destfilter(),
      effectiveFrom: (this.fromDate && this.fromDate.month) ? this.fromDate.month + '/' + this.fromDate.day + '/' + this.fromDate.year : null,
      effectiveTo: (this.toDate && this.toDate.month) ? this.toDate.month + '/' + this.toDate.day + '/' + this.toDate.year : null,
      sortColumn: null,
      sortColumnDirection: null,
    }
    this._airFreightService.getAllrates(obj).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        if (res.returnObject && res.returnObject.length){
        res.returnObject.map(elem => {
          if (typeof elem.slab == "string") {
            elem.slab = JSON.parse(elem.slab);
          }
        });
        this.allRatesList = res.returnObject;
        }else{
          this.allRatesList = [];
        }
        this.checkedallpublishRates = false;
        this.filterTable();
      }
    })

  }




  filterTable() {
    this.dtOptionsByAir = {
      data: this.allRatesList,
      columns: [
        {
          title: '<div class="fancyOptionBoxes"> <input id = "selectallpublishRates" type = "checkbox"> <label for= "selectallpublishRates"> <span> </span></label></div>',
          data: function (data) {
            return '<div class="fancyOptionBoxes"> <input id = "' + data.carrierPricingSetID + '" type = "checkbox"> <label for= "' + data.carrierPricingSetID + '"> <span> </span></label></div>';
          }
        },
        {
          title: 'AirLINE',
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
          title: 'MINIMUM PRICE',
            data: function (data) {
            return (Number(data.slab.minPrice1.split(' ').pop())).toLocaleString('en-US', {
              style: 'currency',
              currency: data.slab.minPrice1.split(' ').shift(),
            });
          },
        },
        {
          title: 'NORMAL PRICE',
          data: function (data) {
            return (Number(data.slab.priceWithCode1.split(' ').pop())).toLocaleString('en-US', {
              style: 'currency',
              currency: data.slab.priceWithCode1.split(' ').shift(),
            });
          },
        },
        
        {
          title: '+45 PRICE',
          data: function (data) {
            return (Number(data.slab.priceWithCode2.split(' ').pop())).toLocaleString('en-US', {
              style: 'currency',
              currency: data.slab.priceWithCode2.split(' ').shift(),
            });
          },
        },
       
        {
          title: '+100 PRICE',
          data: function (data) {
            return (Number(data.slab.priceWithCode3.split(' ').pop())).toLocaleString('en-US', {
              style: 'currency',
              currency: data.slab.priceWithCode3.split(' ').shift(),
            });
          },
        },
   
        {
          title: '+250 PRICE',
          data: function (data) {
            return (Number(data.slab.priceWithCode4.split(' ').pop())).toLocaleString('en-US', {
              style: 'currency',
              currency: data.slab.priceWithCode4.split(' ').shift(),
            });
          },
        },
        {
          title: '+500 PRICE',
          data: function (data) {
            return (Number(data.slab.priceWithCode5.split(' ').pop())).toLocaleString('en-US', {
              style: 'currency',
              currency: data.slab.priceWithCode5.split(' ').shift(),
            });
          },
        },
        {
          title: '+1000 PRICE',
          data: function (data) {
              return (Number(data.slab.priceWithCode6.split(' ').pop())).toLocaleString('en-US', {
                style: 'currency',
                currency: data.slab.priceWithCode6.split(' ').shift(),
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
          $('.publishRateAir .dataTables_paginate').hide();
        } else {
          // SHow everything
          $('.publishRateAir .dataTables_paginate').show();
        }
      },
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
      if (this.tablepublishByAir && this.tablepublishByAir.nativeElement) {
        this.dataTablepublishByAir = $(this.tablepublishByAir.nativeElement);
        let alltableOption = this.dataTablepublishByAir.DataTable(this.dtOptionsByAir);
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
      discardarr.push(elem.CarrierPricingSetID)
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
        this.allSeaDraftRatesByAIR = [];
        this.draftDataBYAIR = [];
        this.publishRates = [];
        this.generateDraftTable();
      }
    }, (reason) => {
      // console.log("reason");
    });
    let obj = {
      data: discardarr,
      type: "draftAirRate"
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
      type: "publishAirRate"
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
    this._airFreightService.publishDraftRate(this.publishRates).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        for (var i = 0; i < this.publishRates.length; i++) {
          for (let y = 0; y < this.draftslist.length; y++) {
            if (this.draftslist[y].CarrierPricingSetID == this.publishRates[i]) {
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
          if (this.draftslist[index].CarrierPricingSetID == id) {
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
      data: [id],
      type: "draftAirRate"
    }
    modalRef.componentInstance.deleteIds = obj;
    setTimeout(() => {
      if (document.getElementsByTagName('body')[0].classList.contains('modal-open')) {
        document.getElementsByTagName('html')[0].style.overflowY = 'hidden';
      }
    }, 0);
  }

  saveTermNcond() {
    let obj = {
      providerID: this.userProfile.ProviderID,
      termsAndConditions: this.policyForm.value.termNcond,
      transportType: "GROUND",
      modifiedBy: this.userProfile.LoginID
    }
    this._manageRatesService.termNCondition(obj).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        this._toast.success("Term and Condition saved Successfully", "");
        this.disable = true;
      }
    })
  }

  
}
