import { Component, OnInit, ViewEncapsulation, ViewChild, Renderer2, ElementRef, Input, ɵConsole } from '@angular/core';
import { PlatformLocation } from '@angular/common';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { SharedService } from '../../../services/shared.service';
import { Observable, Subject, Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import {
  NgbDatepicker,
  NgbInputDatepicker,
  NgbDateStruct,
  NgbCalendar,
  NgbDateAdapter,
  NgbDateParserFormatter,
  NgbModal
} from '@ng-bootstrap/ng-bootstrap';
import { NgbDateFRParserFormatter } from "../../../constants/ngb-date-parser-formatter";
import { GroundTransportService } from '../../../components/pages/user-desk/manage-rates/ground-transport/ground-transport.service';
import { ManageRatesService } from '../../../components/pages/user-desk/manage-rates/manage-rates.service';
import { cloneObject } from '../../../components/pages/user-desk/reports/reports.component';
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
  selector: 'app-ground-rate-dialog',
  templateUrl: './ground-rate-dialog.component.html',
  encapsulation: ViewEncapsulation.None,
  providers: [{ provide: NgbDateParserFormatter, useClass: NgbDateFRParserFormatter }],
  styleUrls: ['./ground-rate-dialog.component.scss'],
  host: {
    "(document:click)": "closeDropdown($event)"
  }
})
export class GroundRateDialogComponent implements OnInit {
  @ViewChild("dp") input: NgbInputDatepicker;
  @ViewChild('rangeDp') rangeDp: ElementRef;
  @ViewChild('originPickupBox') originPickupBox: ElementRef;
  @ViewChild('originDropdown') originDropdown: any
  @ViewChild('destinationDropdown') destinationDropdown;
  @Input() selectedData: any;

  public loading: boolean;
  public allShippingLines: any[] = [];
  public allCargoType: any[] = []
  public allContainers: any[] = [];
  private allPorts: any[] = [];
  public groundsPorts: any[] = [];
  public allCurrencies: any[] = [];
  private allRatesFilledData: any[] = []
  public filterOrigin: any = {};
  public filterDestination: any = {};
  public userProfile: any;
  public selectedCategory: any = {
    ShippingCatName: ''
  };
  public selectedContSize: any;
  public selectedPrice: any;
  public defaultCurrency: any = {
    CurrencyID: 101,
    CurrencyCode: 'AED',
    CountryCode: 'AE',
  }
  public selectedCurrency: any = this.defaultCurrency;

  public startDate: NgbDateStruct;
  public maxDate: NgbDateStruct;
  public minDate: NgbDateStruct;
  public hoveredDate: NgbDateStruct;
  public fromDate: any = {
    day: null,
    month: undefined,
    year: undefined
  };
  public toDate: any = {
    day: undefined,
    month: undefined,
    year: undefined
  };
  public model: any;
  private newProviderDraftID = undefined;
  private transPortMode

  //Ahmer
  public seaPorts = []
  public groundPorts = []

  isHovered = date =>
    this.fromDate && !this.toDate && this.hoveredDate && after(date, this.fromDate) && before(date, this.hoveredDate)
  isInside = date => after(date, this.fromDate) && before(date, this.toDate);
  isFrom = date => equals(date, this.fromDate);
  isTo = date => equals(date, this.toDate);

  public selectedCustomer: any[] = [];
  public destinationsList = []
  public originsList = []
  public userInfo: any;
  public selectedOrigins: any = [{}];
  public selectedDestinations: any = [{}];
  public disabledCustomers: boolean = false;
  public addDestinationActive: boolean = false;
  public addOriginActive: boolean = false;
  public allCustomers: any[] = [];

  constructor(
    private location: PlatformLocation,
    private _activeModal: NgbActiveModal,
    private _manageRateService: ManageRatesService,
    private _sharedService: SharedService,
    private _parserFormatter: NgbDateParserFormatter,
    private renderer: Renderer2,
    private _groundFreightService: GroundTransportService,
    private _toast: ToastrService

  ) { location.onPopState(() => this.closeModal(null)); }


  ngOnInit() {
    this.setDateLimit()
    let userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo && userInfo.returnText) {
      this.userProfile = JSON.parse(userInfo.returnText);
    }
    this.allservicesBySea();
    this.allCustomers = this.selectedData.customers
    this.destinationsList = this.selectedData.addList
    this.originsList = this.selectedData.addList
  }



  allservicesBySea() {
    // this.getDropdownsList()
    this._sharedService.dataLogisticServiceBySea.subscribe(state => {
      if (state && state.length) {
        for (let index = 0; index < state.length; index++) {
          if (state[index].LogServName == "SEA") {
            this.allCargoType = state[index].DropDownValues.Category;
            this.allContainers = state[index].DropDownValues.ContainerGround;
            const seaPorts: Array<any> = (state[index].DropDownValues.Port && state[index].DropDownValues.Port.length > 0) ? state[index].DropDownValues.Port : []
            const groundAreas: Array<any> = (state[index].DropDownValues.GroundPort && state[index].DropDownValues.GroundPort.length > 0) ? state[index].DropDownValues.GroundPort : []
            // this.allPorts = seaPorts.concat(groundAreas);
            this.groundsPorts = Object.assign([], this.allPorts)
            // this.seaPorts = this.groundsPorts.filter(e => e.PortType === 'SEA')
            // this.groundPorts = this.groundsPorts.filter(e => e.PortType === 'GROUND')
            this.allCurrencies = state[index].DropDownValues.UserCurrency;
            if (this.selectedData) {
              this.transPortMode = this.selectedData.TransportType
              this.setData();
            }
          }
        }
      }
    })
  }
  setData() {
    let parsed = '';
    if (this.transPortMode == 'TRUCK') {
      this.groundsPorts = this.allPorts.filter(elem => elem.PortType.toLowerCase() == 'ground');
    }
    if (this.transPortMode == 'GROUND') {
      this.allContainers = this.allContainers.filter(obj => obj.ContainerSizeNature.toLowerCase() == 'container')
    }
    else if (this.transPortMode == 'TRUCK') {
      this.allContainers = this.allContainers.filter(obj => obj.ContainerSizeNature.toLowerCase() == 'truck')
    }
    this.selectedCategory = this.allCargoType.find(obj => obj.ShippingCatName.toLowerCase() == 'goods');
    this.selectedContSize = this.selectedData.ContainerSpecID;
    this.filterOrigin = this.allPorts.find(obj => obj.PortID == this.selectedData.PolID);
    this.filterDestination = this.allPorts.find(obj => obj.PortID == this.selectedData.PodID);
    this.selectedCurrency = this.allCurrencies.find(obj => obj.CurrencyID == this.selectedData.CurrencyID);
    this.selectedPrice = this.selectedData.Price;
    if (this.selectedData.EffectiveFrom) {
      this.fromDate.day = new Date(this.selectedData.EffectiveFrom).getDate();
      this.fromDate.year = new Date(this.selectedData.EffectiveFrom).getFullYear();
      this.fromDate.month = new Date(this.selectedData.EffectiveFrom).getMonth() + 1;
    }
    if (this.selectedData.EffectiveTo) {
      this.toDate.day = new Date(this.selectedData.EffectiveTo).getDate();
      this.toDate.year = new Date(this.selectedData.EffectiveTo).getFullYear();
      this.toDate.month = new Date(this.selectedData.EffectiveTo).getMonth() + 1;
    }
    if (!this.selectedCurrency) {
      this.selectedCurrency = this.defaultCurrency;
    }
    if (this.fromDate && this.fromDate.day) {
      this.model = this.fromDate;
      parsed += this._parserFormatter.format(this.fromDate);
    }
    if (this.toDate && this.toDate.day) {
      parsed += ' - ' + this._parserFormatter.format(this.toDate);
    }
    this.rangeDp.nativeElement.value = parsed;

  }

  public groundAddresses: any = []
  portsFilterartion(obj) {

    if (typeof obj === 'object') {
      this.showPickupDropdown = false;
      this.showDestinationDropdown = false;
    }
    if (this.transPortMode == 'GROUND') {

      if (obj && obj.PortType && obj.PortType == 'SEA') {
        this.groundsPorts = this.allPorts.filter(elem => elem.PortType.toLowerCase() != 'sea');
      }
      else if ((!this.filterOrigin || (this.filterOrigin && !this.filterOrigin.PortType)) && (!this.filterDestination || (this.filterDestination && !this.filterDestination.PortType))) {
        // this.groundsPorts = this.allPorts;
        this.groundAddresses = this.allPorts
      }
      else {
        return
      }

    }
  }


  savedraftrow(type) {
    this.loading = true;
    let obj = [
      {
        ID: (this.selectedData) ? this.selectedData.ID : 0,
        customerID: null,
        providerID: this.userProfile.ProviderID,
        containerSpecID: (this.selectedContSize == null || this.selectedContSize == 'null') ? null : this.selectedContSize,
        containerSpecDesc: (this.selectedContSize == null || this.selectedContSize == 'null') ? undefined : this.getContSpecName(this.selectedContSize),
        shippingCatID: (this.selectedCategory == null || this.selectedCategory == 'null') ? null : this.selectedCategory.ShippingCatID,
        shippingCatName: (this.selectedCategory == null || this.selectedCategory == 'null') ? undefined : this.selectedCategory.ShippingCatName,
        containerLoadType: (this.transPortMode == 'GROUND') ? "FCL" : "FTL",
        transportType: this.transPortMode,
        modeOfTrans: this.transPortMode,
        priceBasis: (this.transPortMode == 'GROUND') ? 'PER_CONTAINER' : 'PER_TRUCK',
        providerLocationD: "test loca",
        providerLocationL: "test loca",
        polID: (this.filterOrigin && this.filterOrigin.PortID) ? this.filterOrigin.PortID : null,
        polName: (this.filterOrigin && this.filterOrigin.PortID) ? this.filterOrigin.PortName : null,
        polCode: (this.filterOrigin && this.filterOrigin.PortID) ? this.filterOrigin.PortCode : null,
        polType: (this.filterOrigin && this.filterOrigin.PortID) ? this.filterOrigin.PortType : null,
        podID: (this.filterDestination && this.filterDestination.PortID) ? this.filterDestination.PortID : null,
        podName: (this.filterDestination && this.filterDestination.PortID) ? this.filterDestination.PortName : null,
        podCode: (this.filterDestination && this.filterDestination.PortID) ? this.filterDestination.PortCode : null,
        podType: (this.filterDestination && this.filterDestination.PortID) ? this.filterDestination.PortType : null,
        price: this.selectedPrice,
        currencyID: (this.selectedCurrency.CurrencyID) ? this.selectedCurrency.CurrencyID : 101,
        currencyCode: (this.selectedCurrency.CurrencyCode) ? this.selectedCurrency.CurrencyCode : 'AED',
        effectiveFrom: (this.fromDate && this.fromDate.month) ? this.fromDate.month + '/' + this.fromDate.day + '/' + this.fromDate.year : null,
        effectiveTo: (this.toDate && this.toDate.month) ? this.toDate.month + '/' + this.toDate.day + '/' + this.toDate.year : null,
      }
    ]
    this._groundFreightService.saveDraftRate(obj).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        this._toast.success('Rates added successfully', '');
        this.allRatesFilledData.push(obj[0]);
        if (type != 'saveNadd') {
          this.loading = false;
          let object = {
            data: this.allRatesFilledData
          }
          this.closeModal(object);
        } else {
          this.addRow()
        }
      }
    })
  }
  addRow() {
    this._groundFreightService.addDraftRates({ createdBy: this.userProfile.LoginID, providerID: this.userProfile.ProviderID, transportType: this.transPortMode }).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        this._sharedService.draftRowAddGround.next(res.returnObject);
        this.newProviderDraftID = undefined;
        this.selectedPrice = undefined;
        this.selectedContSize = null;
        this.newProviderDraftID = res.returnObject.ID;
        this.loading = false;
      }
    })
  }

  numberValid(evt) {
    let charCode = (evt.which) ? evt.which : evt.keyCode
    if (charCode > 31 && (charCode < 48 || charCode > 57))
      return false;
    return true;
  }

  getContSpecName(id) {
    return this.allContainers.find(obj => obj.ContainerSpecID == id).ContainerSpecShortName;
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

  closeModal(status) {
    this._sharedService.draftRowAddGround.next(null);
    this._activeModal.close(status);
    document.getElementsByTagName('html')[0].style.overflowY = 'auto';

  }
  closePopup() {
    let object = {
      data: this.allRatesFilledData
    }
    this.closeModal(object);
  }

  currencies = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      map(term => (!term || term.length < 3) ? []
        : this.allCurrencies.filter(v => v.CurrencyCode && v.CurrencyCode.toLowerCase().indexOf(term.toLowerCase()) > -1))
    )
  currencyFormatter = (x: { CurrencyCode: string }) => x.CurrencyCode;


  public showPickupDropdown: boolean = false;
  public showDestinationDropdown: boolean = false;
  public showPickupPorts: boolean = false;
  public showPickupDoors: boolean = false;
  public showDestPorts: boolean = false;
  public showDestDoors: boolean = false;

  toggleDropdown(type) {
    if (type === 'pickup') {
      this.showPickupDropdown = !this.showPickupDropdown
      this.closeDropDown('delivery')
      this.showPickupPorts = false
      this.showPickupDoors = false
    }
    if (type === 'delivery') {
      this.showDestinationDropdown = !this.showDestinationDropdown
      this.closeDropDown('pickup')
      this.showDestPorts = false
      this.showDestDoors = false
    }
  }

  togglePorts(type) {
    if (type === 'pickup-sea') {
      this.showPickupPorts = true
    } else if (type === 'pickup-door') {
      this.showPickupDoors = true
    } else if (type === 'delivery-sea') {
      this.showDestPorts = true
    } else if (type === 'delivery-door') {
      this.showDestDoors = true
    }
  }

  closeDropDown($action: string) {
    switch ($action) {
      case 'pickup':
        if (this.showPickupDropdown) {
          this.showPickupDropdown = false
        }
        break;
      case 'delivery':
        if (this.showDestinationDropdown) {
          this.showDestinationDropdown = false
        }
        break;
      default:
        if (this.showPickupDropdown || this.showDestinationDropdown) {
          this.showPickupDropdown = false
          this.showDestinationDropdown = false
        }
        break
    }
  }


  //Sea ports formatter and observer
  ports = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      map(term => (!term || term.length < 3) ? []
        : this.seaPorts.filter(v => v.PortName && v.PortName.toLowerCase().indexOf(term.toLowerCase()) > -1))
    )
  portsFormatter = (x: { PortName: string }) => {
    return x.PortName
  };

  //Ground areas formatter and observer
  addresses = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      map(term => (!term || term.length < 3) ? []
        : this.groundPorts.filter(v => v.PortName && v.PortName.toLowerCase().indexOf(term.toLowerCase()) > -1))
    )
  addressFormatter = (x: { PortName: string }) => {
    return x.PortName
  };

  setDateLimit() {
    const date = new Date();

    this.minDate = {
      month: date.getMonth() + 1,
      day: date.getDate(),
      year: date.getFullYear()
    };

    // this.maxDate = {
    //   year: ((this.minDate.month === 12 && this.minDate.day >= 17) ? date.getFullYear() + 1 : date.getFullYear()),
    //   month:
    //     moment(date)
    //       .add(15, "days")
    //       .month() + 1,
    //   day: moment(date)
    //     .add(15, "days")
    //     .date()
    // };
  }

}
