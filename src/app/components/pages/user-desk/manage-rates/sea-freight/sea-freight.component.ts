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
  public dtOptionsBySeaFCLDraft: DataTables.Settings | any = {};
  @ViewChild('draftBYsea') tabledraftBySea;
  @ViewChild('publishBysea') tablepublishBySea;
  @ViewChild("dp") input: NgbInputDatepicker;
  // @ViewChild(NgModel) datePick: NgModel;
  @ViewChild('rangeDp') rangeDp: ElementRef;
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;

  public dtTrigger: any = new Subject();


  public dataTablepublishBysea: any;
  public dataTabledraftBysea: any;
  public allRatesList: any;
  public publishloading: boolean;
  public draftloading: boolean;
  public allShippingLines: any[] = [];
  public allCargoType: any[] = []
  public allContainersType: any[] = [];
  public allPorts: any[] = [];
  public allCurrencies: any[] = [];
  public allSeaDraftRatesByFCL: any[] = [];
  public draftDataBYSeaFCL: any[] = [];
  public draftsfcl: any[] = [];
  public delPublishRates: any[] = [];
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

  public userProfile:any;

  // filterartion variable;

  public filterbyShippingLine;
  public filterbyCargoType;
  public filterbyContainerType;
  public checkedallpublishRates: boolean = false;
  public checkedalldraftRates:boolean = false;

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
    this.dtOptionsBySeaFCLDraft = {
      info: false,
      destroy: true,
      pagingType: 'full_numbers',
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
          targets: 2,
          width: '235'
        },
        {
          targets: -1,
          width: 'auto',
          orderable: false,
        },
        {
          targets: "_all",
          width: "150"
        }
      ],

    }


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

  clearFilter(event){
    event.preventDefault();
    event.stopPropagation();
    if ((this.filterbyShippingLine && this.filterbyShippingLine != 'undefined') || 
      (this.filterbyCargoType && this.filterbyCargoType != 'undefined') ||
      (this.filterbyContainerType && this.filterbyContainerType != 'undefined') || 
      (this.filterDestination && Object.keys(this.filterDestination).length) || 
      (this.filterOrigin && Object.keys(this.filterOrigin).length)
       ){
      this.filterbyShippingLine = 'undefined';
      this.filterbyCargoType = 'undefined';
      this.filterbyContainerType = 'undefined';
      this.filterDestination = {};
      this.filterOrigin = {};
      this.filter();
    }
   }
  filter(){
    this.getAllPublishRates()
  }
  addRatesManually() {
    this._seaFreightService.addDraftRates({ createdBy: this.userProfile.LoginID, providerID: this.userProfile.ProviderID}).subscribe((res: any) => {
        if (res.returnStatus == "Success") {
          this.draftDataBYSeaFCL.push(res.returnObject);
          if (this.allSeaDraftRatesByFCL && this.allSeaDraftRatesByFCL.length){
            this.draftsfcl = this.allSeaDraftRatesByFCL.concat(this.draftDataBYSeaFCL);
          }else{
            this.draftsfcl = this.draftDataBYSeaFCL;
          }
         this.generateDraftTable();
        }
      })
  }

  generateDraftTable() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();
      // Call the dtTrigger to rerender again
      this.dtTrigger.next();
    });
    // this.dtOptionsBySeaFCLDraft = {
    //   // ajax: {
    //   //   url: "http://10.20.1.13:9091/api/providerratefcl/SearchRates",
    //   //   type: "POST"
    //   // },
    //   // data: this.draftsfcl,
    //   // columns: [
    //   //   {
    //   //     title: '<div class="fancyOptionBoxes"> <input id = "selectallDraftRates" type = "checkbox"> <label for= "selectallDraftRates"> <span> </span></label></div>',
    //   //     data: function (data) {
    //   //       return '<div class="fancyOptionBoxes"> <input id = "' + data.ProviderPricingDraftID + '" type = "checkbox"> <label for= "' + data.ProviderPricingDraftID + '"> <span> </span></label></div>';
    //   //     }

    //   //   },
    //   //   {
    //   //     title: 'SHIPPING LINE',
    //   //     // data: function (data) {
    //   //     //   let url = baseExternalAssets + "/" + data.carrierImage;
    //   //     //   return "<img src='" + url + "' class='icon-size-24 mr-2' />" + data.carrierName;
    //   //     // },
    //   //     data:'CarrierID',
    //   //     defaultContent: '<select><option disable>-- Select --</option> <option>One</option></select>'
    //   //   },
    //   //   {
    //   //     title: 'ORIGIN / DEPARTURE',
    //   //     // data: function (data) {
    //   //     //   let polUrl = '../../../../../../assets/images/flags/4x3/' + data.polCode.split(' ').shift().toLowerCase() + '.svg';
    //   //     //   let podCode = '../../../../../../assets/images/flags/4x3/' + data.podCode.split(' ').shift().toLowerCase() + '.svg';
    //   //     //   const arrow = '../../../../../../assets/images/icons/grid-arrow.svg';
    //   //     //   return "<img src='" + polUrl + "' class='icon-size-22-14 mr-2' />" + data.polName + " <img src='" + arrow + "' class='ml-2 mr-2' />" + "<img src='" + podCode + "' class='icon-size-22-14 ml-1 mr-2' />" + data.podName;
    //   //     // }
    //   //     data:'PolID',
    //   //     defaultContent: '<select><option disable>-- Select --</option> <option>One</option></select>'
          
    //   //   },
    //   //   {
    //   //     title: 'CARGO TYPE',
    //   //     data: 'ShippingCatID',
    //   //     defaultContent: '<select><option disable>-- Select --</option> <option>One</option></select>'
    //   //   },
    //   //   {
    //   //     title: 'CONTAINER',
    //   //     data: 'ContainerSpecID',
    //   //     defaultContent: '<select><option disable>-- Select --</option><option>One</option></select>'
    //   //   },
    //   //   {
    //   //     title: 'RATE',
    //   //     data: 'Price',
    //   //     defaultContent: '<select><option disable>-- Select --</option> <option>One</option></select>'
          
    //   //   },
    //   //   {
    //   //     title: 'RATE VALIDITY',
    //   //     data: 'Price',
    //   //     defaultContent: '<select><option disable>-- Select --</option> <option>One</option></select>'
          
    //   //   },
    //   //   {
    //   //     title: '',
    //   //     data: function (data) {
    //   //       let url = '../../../../../../assets/images/icons/icon_del_round.svg';
    //   //       return "<img src='" + url + "' class='icon-size-16' />";
    //   //     },
    //   //     className: 'moreOption'
    //   //   }
    //   // ],
    //   // processing: true,
    //   // serverSide: true,
    //   // retrieve: true,
    //   info: false,
    //   destroy: true,
    //   pagingType: 'full_numbers',
    //   pageLength: 5,
    //   scrollX: true,
    //   scrollY: '60vh',
    //   scrollCollapse: true,
    //   searching: false,
    //   lengthChange: false,
    //   responsive: true,
    //   order: [[1, "asc"]],
    //   language: {
    //     paginate: {
    //       next: '<img src="../../../../../../assets/images/icons/icon_arrow_right.svg" class="icon-size-16">',
    //       previous: '<img src="../../../../../../assets/images/icons/icon_arrow_left.svg" class="icon-size-16">'
    //     }
    //   },
    //   // fixedColumns: {
    //   //   leftColumns: 0,
    //   //   rightColumns: 1
    //   // },
    //   columnDefs: [
    //     {
    //       targets: 0,
    //       width: 'auto',
    //       orderable: false,
    //     },
    //     {
    //       targets: 2,
    //       width: '235'
    //     },
    //     {
    //       targets: -1,
    //       width: 'auto',
    //       orderable: false,
    //     },
    //     {
    //       targets: "_all",
    //       width: "150"
    //     }
    //   ],

    // }
    
    // this.setdataDraftInTable();
  }

  // setdataDraftInTable() {
  //   setTimeout(() => {
  //     this.dataTabledraftBysea = $(this.tabledraftBySea.nativeElement);
  //     let alltableOption = this.dataTabledraftBysea.DataTable(this.dtOptionsBySeaFCLDraft);
  //     this.draftloading = false;
     
  //     $("#selectallDraftRates").click(() => {
  //       var cols = alltableOption.column(0).nodes();
  //       this.checkedalldraftRates = !this.checkedalldraftRates;
  //       for (var i = 0; i < cols.length; i += 1) {
  //         cols[i].querySelector("input[type='checkbox']").checked = this.checkedalldraftRates;
  //       }
  //     });
  //   }, 0);
  // }
  addAnotherRates(){
    this.addRatesManually();
  }
  addRatesByseaManually(){
    if ((!this.allSeaDraftRatesByFCL || (this.allSeaDraftRatesByFCL && !this.allSeaDraftRatesByFCL.length)) && (!this.draftDataBYSeaFCL || (this.draftDataBYSeaFCL && !this.draftDataBYSeaFCL.length))){
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
            this.allSeaDraftRatesByFCL = state[index].DraftDataFCL;
            this.draftsfcl = this.allSeaDraftRatesByFCL;
            this.dtTrigger.next();
            // this.draftloading = true;
          }
        }
      }
    })
  }
  filterByroute(obj){
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
  filtertionPort(obj){
    if ((typeof obj == "object" && Object.keys(obj).length) || (typeof obj == "string" && obj)) this.getAllPublishRates();
  }
  getAllPublishRates() {
    this.publishloading = true;
    let obj = {
      providerID: 1047,     
      // providerID: this.userProfile.ProviderID,     
      pageNo: 1,
      pageSize: 50,
      carrierID: (this.filterbyShippingLine == 'undefined')? null : this.filterbyShippingLine,
      shippingCatID: (this.filterbyCargoType == 'undefined') ? null : this.filterbyCargoType,
      containerSpecID: (this.filterbyContainerType == 'undefined') ? null : this.filterbyContainerType,
      polID: this.orgfilter(),
      podID: this.destfilter(),
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
            return "<img src='" + polUrl + "' class='icon-size-22-14 mr-2' />" + data.polName + " <img src='" + arrow + "' class='ml-2 mr-2' />" + "<img src='" + podCode + "' class='icon-size-22-14 ml-1 mr-2' />" + data.podName;
          }
        },
        {
          title: 'CARGO TYPE',
          data: 'shippingCatName',
          defaultContent: '<select><option disable>-- Select --</option> <option>One</option></select>'
        },
        {
          title: 'CONTAINER',
          data: 'containerSpecDesc',
          defaultContent: '<select><option disable>-- Select --</option><option>One</option></select>'
        },
        {
          title: 'RATE',
          data: 'priceWithCode'
        },
        {
          title: 'RATE VALIDITY',
          data: function(data){
            return moment(data.effectiveFrom).format('D MMM, Y') + ' to ' + moment(data.effectiveTo).format('D MMM, Y') 
          }
        },
        {
          title: '',
          data: function (data) {
            let url = '../../../../../../assets/images/icons/menu.svg';
            return "<img src='" + url + "' class='icon-size-16' />";
          },
          className:'moreOption'
        }
      ],
      // processing: true,
      // serverSide: true,
      // retrieve: true,
      destroy: true,
      pagingType: 'full_numbers',
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

    setdataInTable(){
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
            if (this.checkedallpublishRates){
            this.delPublishRates.push(cols[i].querySelector("input[type='checkbox']").id);
            }
          }
          if (i == cols.length && !this.checkedallpublishRates){
            this.delPublishRates = [];
          }
          
        });
     
        $('#publishRateTable').on('click', 'input[type="checkbox"]', (event) => {
          let index = this.delPublishRates.indexOf((<HTMLInputElement>event.target).id)
          if (index >= 0){
            this.delPublishRates.splice(index, 1);
            
          }else{
            this.delPublishRates.push((<HTMLInputElement>event.target).id)
          }
          
        });

      },0);
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
    this.draftsfcl.forEach(elem=>{
      discardarr.push(elem.ProviderPricingDraftID)
    })
    const modalRef =  this.modalService.open(DiscardDraftComponent, {
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

  deletepublishRecord(){
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
        this.allRatesList = [];
        this.delPublishRates = [];
        this.filterTable();
      }
    }, (reason) => {
      // console.log("reason");
    });
    let obj = {
      data: this.delPublishRates,
      type:"publishSeaRateFCL"
    }
    modalRef.componentInstance.deleteIds = obj;
    setTimeout(() => {
      if (document.getElementsByTagName('body')[0].classList.contains('modal-open')) {
        document.getElementsByTagName('html')[0].style.overflowY = 'hidden';
      }
    }, 0);
  }







  ports = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      map(term => (!term || term.length < 3) ? []
        : this.allPorts.filter(v => v.PortName.toLowerCase().indexOf(term.toLowerCase()) > -1))
    )
  formatter = (x: {PortName: string }) => x.PortName;



  savedraftrow(index, data){
    let carrier = document.getElementById(index+'carrier') as any;
    let shipping = document.getElementById(index+'shipping') as any;
    let container = document.getElementById(index + 'container') as any;
    let currencyID = document.getElementById(index + 'currencyID') as any;
    let price = document.getElementById(index +'price') as any;
    let obj= [ 
      { 
        providerPricingDraftID: data.ProviderPricingDraftID, 
        carrierID: (carrier.value=='null')? null : carrier.value, 
        providerID: this.userProfile.ProviderID, 
        containerSpecID: (container.value=='null')? null : container.value, 
        shippingCatID: (shipping.value=='null')? null : shipping.value, 
        containerLoadType: "FCL", 
        modeOfTrans: "SEA", 
        polID: 2007, 
        podID: 100, 
        price: (price.value == 'null' || !price.value)? null : price.value, 
        currencyID: currencyID.value, 
        effectiveFrom: "2018-12-01T10:24:39.027Z", 
        effectiveTo: "2018-12-24T10:24:39.027Z", 
    
      }
    ]
    this._seaFreightService.saveDraftRate(obj).subscribe((res:any)=>{
      if(res.returnStatus=="Success"){

      }
    })
  }

  deleteRow(id) {
    const modalRef = this.modalService.open(ConfirmDeleteDialogComponent, {
      size: 'lg',
      centered: true,
      windowClass: 'small-modal',
      backdrop: 'static',
      keyboard: false
    });
    modalRef.result.then((result) => {
      if (result == "Success"){
        for (let index = 0; index < this.draftsfcl.length; index++) {
          if (this.draftsfcl[index].ProviderPricingDraftID == id){
            this.draftsfcl.splice(index, 1);
            this.generateDraftTable();
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
