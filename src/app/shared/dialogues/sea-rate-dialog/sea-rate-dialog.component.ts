import { Component, OnInit, ViewEncapsulation, EventEmitter, ViewChild, Renderer2, ElementRef, Input, Output } from '@angular/core';
import { PlatformLocation } from '@angular/common';
import { NgbActiveModal, NgbDropdownConfig } from "@ng-bootstrap/ng-bootstrap";
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
import { SeaFreightService } from '../../../components/pages/user-desk/manage-rates/sea-freight/sea-freight.service';
import { cloneObject } from '../../../components/pages/user-desk/reports/reports.component';
import { LoginDialogComponent } from '../login-dialog/login-dialog.component';
import { changeCase, loading, getImagePath, ImageSource, ImageRequiredSize } from '../../../constants/globalFunctions';
import *  as moment from 'moment'
import { ManageRatesService } from '../../../components/pages/user-desk/manage-rates/manage-rates.service';

const equals = (one: NgbDateStruct, two: NgbDateStruct) =>
  one && two && two.year === one.year && two.month === one.month && two.day === one.day;

const before = (one: NgbDateStruct, two: NgbDateStruct) =>
  !one || !two ? false : one.year === two.year ? one.month === two.month ? one.day === two.day
    ? false : one.day < two.day : one.month < two.month : one.year < two.year;

const after = (one: NgbDateStruct, two: NgbDateStruct) =>
  !one || !two ? false : one.year === two.year ? one.month === two.month ? one.day === two.day
    ? false : one.day > two.day : one.month > two.month : one.year > two.year;
@Component({
  selector: "app-sea-rate-dialog",
  templateUrl: "./sea-rate-dialog.component.html",
  encapsulation: ViewEncapsulation.None,
  providers: [
    { provide: NgbDateParserFormatter, useClass: NgbDateFRParserFormatter },
    NgbDropdownConfig
  ],
  styleUrls: ["./sea-rate-dialog.component.scss"],
  host: {
    "(document:click)": "closeDropdown($event)"
  }
})
export class SeaRateDialogComponent implements OnInit {
  @ViewChild("dp") input: NgbInputDatepicker;
  @ViewChild("rangeDp") rangeDp: ElementRef;
  @ViewChild('originPickupBox') originPickupBox: ElementRef;
  @ViewChild('destinationPickupBox') destinationPickupBox: ElementRef;
  @ViewChild('originDropdown') originDropdown: any
  @ViewChild('destinationDropdown') destinationDropdown;
  @Input() selectedData: any;
  @Output() savedRow = new EventEmitter<any>()

  citiesResults: Object;
  searchTerm$ = new Subject<string>();

  public allShippingLines: any[] = [];
  public allCargoType: any[] = [];
  public allContainersType: any[] = [];
  public allContainers: any[] = [];
  public allHandlingType: any[] = [];
  public allCustomers: any[] = []
  public allPorts: any[] = [];
  public seaPorts: any[] = [];
  public allCurrencies: any[] = [];
  private allRatesFilledData: any[] = [];
  public filterOrigin: any = {};
  public filterDestination: any = {};
  public userProfile: any;
  public selectedCategory: any = null;
  public selectedContSize: any = null;
  public selectedHandlingUnit: any;
  public selectedCustomer: any[] = [];
  public selectedShipping: any;
  public selectedPrice: any;
  public couplePrice: any;
  public defaultCurrency: any = {
    id: 101,
    shortName: "AED",
    imageName: 'AE'
  };
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
  private newProviderPricingDraftID = undefined;
  isHovered = date =>
    this.fromDate &&
    !this.toDate &&
    this.hoveredDate &&
    after(date, this.fromDate) &&
    before(date, this.hoveredDate);
  isInside = date => after(date, this.fromDate) && before(date, this.toDate);
  isFrom = date => equals(date, this.fromDate);
  isTo = date => equals(date, this.toDate);

  public destinationsList = []
  public originsList = []
  public userInfo: any;
  public selectedOrigins: any = [{}];
  public selectedDestinations: any = [{}];
  public disabledCustomers: boolean = false;
  public containerLoadParam: string = 'FCL'
  public userCurrency: number;

  constructor(
    private location: PlatformLocation,
    private _activeModal: NgbActiveModal,
    private _sharedService: SharedService,
    private _parserFormatter: NgbDateParserFormatter,
    private _manageRateService: ManageRatesService,
    private renderer: Renderer2,
    private _seaFreightService: SeaFreightService,
    private _toast: ToastrService,
    private config: NgbDropdownConfig,
    private _eref: ElementRef
  ) {
    location.onPopState(() => this.closeModal(null));
    config.autoClose = false;
  }

  ngOnInit() {
    this._sharedService.currencyList.subscribe(res => {
      if (res) {
        this.allCurrencies = res;
      }
    })
    this.userInfo = JSON.parse(localStorage.getItem("userInfo"));
    this.setCurrency()
    this.setDateLimit()
    if (this.userInfo && this.userInfo.returnText) {
      this.userProfile = JSON.parse(this.userInfo.returnText);
    }
    console.log(this.selectedData);
    this.containerLoadParam = (this.selectedData.forType === 'FCL-Ground' ? 'FCL' : this.selectedData.forType)
    this.allservicesBySea();
    if (this.selectedData.mode === 'draft') {
      if (this.selectedData.data && this.selectedData.data.JsonSurchargeDet) {
        this.setEditData(this.selectedData.mode)
      }
    } else if (this.selectedData.mode === 'publish') {
      if (this.selectedData.data && this.selectedData.data[0].jsonSurchargeDet) {
        this.setEditData(this.selectedData.mode)
      }
    }



    this.allCustomers = this.selectedData.customers
    this.destinationsList = this.selectedData.addList
    this.originsList = this.selectedData.addList
    this.getSurchargeBasis(this.containerLoadParam)

  }

  allservicesBySea() {
    this.getDropdownsList()
    this._sharedService.dataLogisticServiceBySea.subscribe(state => {

      if (state && state.length) {
        for (let index = 0; index < state.length; index++) {
          if (state[index].LogServName == "SEA") {
            this.allShippingLines = state[index].DropDownValues.ShippingLine;
            console.log(this.allShippingLines);
            this.allHandlingType = state[index].DropDownValues.ContainerLCL;
            if (this.selectedData && this.selectedData.data && this.containerLoadParam === "FCL") {
              if (this.selectedData.mode === 'publish') {
                this.disabledCustomers = true;
                let data = changeCase(this.selectedData.data[0], 'pascal')
                this.setData(data);
              } else {
                this.setData(this.selectedData.data);
              }
            }
            else if (this.selectedData && this.selectedData.data && (this.containerLoadParam === "LCL" || this.containerLoadParam === "FTL")) {
              if (this.selectedData.mode === 'publish') {
                this.disabledCustomers = true;
                let data = changeCase(this.selectedData.data[0], 'pascal')
                this.setData(data);
                // this.setDataLCL(data);
              } else {
                this.setData(this.selectedData.data);
                // this.setDataLCL(this.selectedData.data);
              }

            }
          }
        }
      }
    });
  }

  setDateLimit() {
    const date = new Date();

    this.minDate = {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate()
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

  setData(data) {
    console.log(data);
    let parsed = "";
    this.selectedCategory = data.ShippingCatID;
    this.cargoTypeChange(this.selectedCategory);
    this.selectedContSize = data.ContainerSpecID;

    if (data.PolType === 'Ground') {
      this.filterOrigin = this.groundPorts.find(
        obj => obj.PortID == data.PolID
      );
    } else if (data.PolType === 'CITY') {
      this._manageRateService.getAllCities(data.PolName).pipe(debounceTime(400), distinctUntilChanged()).subscribe((res: any) => {
        const cities = res;
        this.showDoubleRates = false
        this.filterOrigin = cities[0]
      }, (err: any) => {
        console.log(err)
      })
    } else {
      this.filterOrigin = this.seaPorts.find(
        obj => obj.PortID == data.PolID
      );
    }
    if (data.PodType === 'Ground') {
      this.filterDestination = this.groundPorts.find(
        obj => obj.PortID == data.PodID
      );
    } else if (data.PodType === 'CITY') {
      this._manageRateService.getAllCities(data.PodName).pipe(debounceTime(400), distinctUntilChanged()).subscribe((res: any) => {
        const cities = res;
        this.showDoubleRates = false
        this.filterDestination = cities[0]
      }, (err: any) => {
        console.log(err)
      })
    } else {
      this.filterDestination = this.seaPorts.find(
        obj => obj.PortID == data.PodID
      );
    }

    this.containerChange(data.ContainerSpecID)
    if (data.CouplePrice) {
      this.couplePrice = data.CouplePrice
      this.showDoubleRates = true;
    }

    this.selectedShipping = this.allShippingLines.find(
      obj => obj.CarrierID == data.CarrierID
    );

    this.selectedCurrency = this.allCurrencies.find(
      obj => obj.id === data.CurrencyID
    );
    this.selectedPrice = data.Price;
    this.disabledCustomers = true;
    if (data.JsonCustomerDetail && data.CustomerType !== 'null') {
      this.selectedCustomer = JSON.parse(data.JsonCustomerDetail)
    }

    if (data.EffectiveFrom) {
      this.fromDate.day = new Date(data.EffectiveFrom).getDate();
      this.fromDate.year = new Date(data.EffectiveFrom).getFullYear();
      this.fromDate.month = new Date(data.EffectiveFrom).getMonth() + 1;
    }
    if (data.EffectiveTo) {
      this.toDate.day = new Date(data.EffectiveTo).getDate();
      this.toDate.year = new Date(data.EffectiveTo).getFullYear();
      this.toDate.month = new Date(data.EffectiveTo).getMonth() + 1;
    }
    if (!this.selectedCurrency) {
      this.selectedCurrency = this.defaultCurrency;
    }
    if (this.fromDate && this.fromDate.day) {
      this.model = this.fromDate;
      parsed += this._parserFormatter.format(this.fromDate);
    }
    if (this.toDate && this.toDate.day) {
      parsed += " - " + this._parserFormatter.format(this.toDate);
    }
    this.rangeDp.nativeElement.value = parsed;
  }
  setDataLCL(data) {
    let parsed = "";
    this.selectedCategory = data.ShippingCatID;
    this.cargoTypeChange(this.selectedCategory);
    this.selectedHandlingUnit = data.ContainerSpecID;
    this.filterOrigin = this.seaPorts.find(
      obj => obj.PortID == data.PolID
    );
    this.filterDestination = this.seaPorts.find(
      obj => obj.PortID == data.PodID
    );
    this.selectedCurrency = this.allCurrencies.find(
      obj => obj.CurrencyID == data.CurrencyID
    );
    this.selectedPrice = data.Price;
    if (data.EffectiveFrom) {
      this.fromDate.day = new Date(data.EffectiveFrom).getDate();
      this.fromDate.year = new Date(data.EffectiveFrom).getFullYear();
      this.fromDate.month = new Date(data.EffectiveFrom).getMonth() + 1;
    }
    if (data.EffectiveTo) {
      this.toDate.day = new Date(data.EffectiveTo).getDate();
      this.toDate.year = new Date(data.EffectiveTo).getFullYear();
      this.toDate.month = new Date(data.EffectiveTo).getMonth() + 1;
    }
    if (!this.selectedCurrency) {
      this.selectedCurrency = this.defaultCurrency;
    }
    if (this.fromDate && this.fromDate.day) {
      this.model = this.fromDate;
      parsed += this._parserFormatter.format(this.fromDate);
    }
    if (this.toDate && this.toDate.day) {
      parsed += " - " + this._parserFormatter.format(this.toDate);
    }
    this.rangeDp.nativeElement.value = parsed;
  }

  cargoTypeChange(type) {
    if (this.transPortMode === 'SEA') {
      let data = this.fclContainers.filter(obj => obj.ShippingCatID == type);
      this.allContainers = data;
    }
  }

  savedraftrow(type) {
    if (type !== 'update') {
      this.saveDataInFCLDraft(type);
    } else if (type === 'update') {
      this.updateRatesfcl(this.containerLoadParam.toLowerCase())
    }
  }

  updateRatesfcl(type) {
    let rateData = [];
    if (this.selectedData.data && this.selectedData.data && this.selectedData.data.length) {
      this.selectedData.data.forEach(element => {
        let LCLObj = {
          consolidatorPricingID: element.consolidatorPricingID,
          rate: this.selectedPrice,
          effectiveFrom: (this.fromDate && this.fromDate.month) ? this.fromDate.month + '/' + this.fromDate.day + '/' + this.fromDate.year : null,
          effectiveTo: (this.toDate && this.toDate.month) ? this.toDate.month + '/' + this.toDate.day + '/' + this.toDate.year : null,
          modifiedBy: this.userProfile.LoginID,
          JsonSurchargeDet: JSON.stringify(this.selectedOrigins.concat(this.selectedDestinations)),
          customerID: element.customerID,
          jsonCustomerDetail: element.jsonCustomerDetail,
          customerType: element.customerType
        }
        let FCLObj = {
          carrierPricingID: element.carrierPricingID,
          rate: this.selectedPrice,
          effectiveFrom: (this.fromDate && this.fromDate.month) ? this.fromDate.month + '/' + this.fromDate.day + '/' + this.fromDate.year : null,
          effectiveTo: (this.toDate && this.toDate.month) ? this.toDate.month + '/' + this.toDate.day + '/' + this.toDate.year : null,
          modifiedBy: this.userProfile.LoginID,
          JsonSurchargeDet: JSON.stringify(this.selectedOrigins.concat(this.selectedDestinations)),
          customerID: element.customerID,
          jsonCustomerDetail: element.jsonCustomerDetail,
          customerType: element.customerType
        }
        let FTLObj = {
          pricingID: element.id,
          couplePrice: parseInt(this.couplePrice),
          rate: this.selectedPrice,
          effectiveFrom: (this.fromDate && this.fromDate.month) ? this.fromDate.month + '/' + this.fromDate.day + '/' + this.fromDate.year : null,
          effectiveTo: (this.toDate && this.toDate.month) ? this.toDate.month + '/' + this.toDate.day + '/' + this.toDate.year : null,
          modifiedBy: this.userProfile.LoginID,
          transportType: 'TRUCK',
          JsonSurchargeDet: JSON.stringify(this.selectedOrigins.concat(this.selectedDestinations)),
          customerID: element.customerID,
          jsonCustomerDetail: element.jsonCustomerDetail,
          customerType: element.customerType
        }
        if (type === 'fcl' && this.transPortMode === 'SEA') {
          rateData.push(FCLObj)
        } else if (type === 'lcl' && this.transPortMode === 'SEA') {
          rateData.push(LCLObj)
        } else if ((type === 'ftl' && this.transPortMode === 'GROUND') || (type === 'fcl' && this.transPortMode === 'GROUND')) {
          type = 'ground'
          rateData.push(FTLObj)
        }
      });
    }
    this._seaFreightService.rateValidityFCL(type, rateData).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        this._toast.success('Record successfully updated', '')
        this.closeModal(res.returnStatus);
      }
    })
  }

  addRowLCL() {
    this._seaFreightService.addDraftRatesLCL({
      createdBy: this.userProfile.LoginID,
      providerID: this.userProfile.ProviderID
    })
      .subscribe((res: any) => {
        if (res.returnStatus == "Success") {
          this._sharedService.draftRowLCLAdd.next(res.returnObject);
          this.newProviderPricingDraftID = undefined;
          this.selectedPrice = undefined;
          this.selectedHandlingUnit = null;
          this.newProviderPricingDraftID = res.returnObject.ConsolidatorPricingDraftID;
        }
      });
  }


  public TotalImportCharges: number = 0
  public TotalExportCharges: number = 0
  saveDataInFCLDraft(type) {
    let customers = [];
    if (this.selectedCustomer.length) {
      this.selectedCustomer.forEach(element => {
        let obj = {
          CustomerID: element.CustomerID,
          CustomerType: element.CustomerType,
          CustomerName: element.CustomerName,
          CustomerImage: element.CustomerImage
        }
        customers.push(obj)
      });
    }

    let totalImp = []
    let totalExp = []

    const expCharges = this.selectedOrigins.filter((e) => e.Imp_Exp === 'EXPORT')
    const impCharges = this.selectedDestinations.filter((e) => e.Imp_Exp === 'IMPORT')
    if (impCharges.length) {
      impCharges.forEach(element => {
        totalImp.push(parseInt(element.Price));
      });
      this.TotalImportCharges = totalImp.reduce((all, item) => {
        return all + item;
      });
    }
    if (expCharges.length) {
      expCharges.forEach(element => {
        totalExp.push(parseInt(element.Price));
      });
      this.TotalExportCharges = totalExp.reduce((all, item) => {
        return all + item;
      });
    }
    console.log(this.containerLoadParam);
    if (this.containerLoadParam === 'FTL') {

    }

    let obj = {
      ID: (this.selectedData.ID ? this.selectedData.ID : 0),
      providerPricingDraftID: (this.selectedData.data) ? this.selectedData.data.ProviderPricingDraftID : 0,
      consolidatorPricingDraftID: (this.selectedData.data) ? this.selectedData.data.ConsolidatorPricingDraftID : 0,
      customerID: (this.selectedCustomer.length ? this.selectedCustomer[0].CustomerID : null),
      customersList: (customers.length ? customers : null),
      carrierID: (this.selectedShipping) ? this.selectedShipping.CarrierID : undefined,
      carrierName: (this.selectedShipping) ? this.selectedShipping.CarrierName : undefined,
      carrierImage: (this.selectedShipping) ? this.selectedShipping.CarrierImage : undefined,
      providerID: this.userProfile.ProviderID,
      containerSpecID: (this.selectedContSize == null || this.selectedContSize == 'null') ? null : parseInt(this.selectedContSize),
      containerSpecName: (this.selectedContSize == null || this.selectedContSize == 'null') ? undefined : this.getContSpecName(this.selectedContSize),
      shippingCatID: (this.selectedCategory == null || this.selectedCategory == 'null') ? null : parseInt(this.selectedCategory),
      shippingCatName: (this.selectedCategory == null || this.selectedCategory == 'null') ? undefined : this.getShippingName(this.selectedCategory),
      containerLoadType: this.containerLoadParam,
      transportType: this.transPortMode,
      modeOfTrans: this.transPortMode,
      priceBasis: this.priceBasis,
      providerLocationD: "",
      providerLocationL: "",
      polID: (this.filterOrigin && (this.filterOrigin.PortID || this.filterOrigin.id)) ? (this.filterOrigin.PortID || this.filterOrigin.id) : null,
      polName: (this.filterOrigin && (this.filterOrigin.PortID || this.filterOrigin.id)) ? (this.filterOrigin.PortName || this.filterOrigin.title) : null,
      polCode: (this.filterOrigin && (this.filterOrigin.PortID || this.filterOrigin.id)) ? (this.filterOrigin.PortCode || this.filterOrigin.code) : null,
      podID: (this.filterDestination && (this.filterDestination.PortID || this.filterDestination.id)) ? (this.filterDestination.PortID || this.filterDestination.id) : null,
      polType: (this.filterOrigin && (this.filterOrigin.PortID || this.filterOrigin.id)) ? (this.filterOrigin.PortType || this.filterOrigin.type) : null,
      podName: (this.filterDestination && (this.filterDestination.PortID || this.filterDestination.id)) ? (this.filterDestination.PortName || this.filterDestination.title) : null,
      podCode: (this.filterDestination && (this.filterDestination.PortID || this.filterDestination.id)) ? (this.filterDestination.PortID || this.filterDestination.code) : null,
      podType: (this.filterDestination && (this.filterDestination.PortID || this.filterDestination.id)) ? (this.filterDestination.PortType || this.filterDestination.type) : null,
      price: this.selectedPrice,
      couplePrice: this.couplePrice,
      currencyID: (this.selectedCurrency && this.selectedCurrency.id) ? this.selectedCurrency.id : 101,
      currencyCode: (this.selectedCurrency && this.selectedCurrency.shortName) ? this.selectedCurrency.shortName : 'AED',
      effectiveFrom: (this.fromDate && this.fromDate.month) ? this.fromDate.month + '/' + this.fromDate.day + '/' + this.fromDate.year : null,
      effectiveTo: (this.toDate && this.toDate.month) ? this.toDate.month + '/' + this.toDate.day + '/' + this.toDate.year : null,
      JsonSurchargeDet: JSON.stringify(this.selectedOrigins.concat(this.selectedDestinations)),
      TotalImportCharges: this.TotalImportCharges,
      TotalExportCharges: this.TotalExportCharges,
      createdBy: this.userProfile.LoginID
    }

    if (obj.transportType === 'SEA') {
      let ADCHValidated: boolean = true;
      let exportCharges
      let importCharges
      if (obj.JsonSurchargeDet) {
        const parsedJsonSurchargeDet = JSON.parse(obj.JsonSurchargeDet)
        exportCharges = parsedJsonSurchargeDet.filter(e => e.Imp_Exp === 'EXPORT')
        importCharges = parsedJsonSurchargeDet.filter(e => e.Imp_Exp === 'IMPORT')
      }

      if (exportCharges.length) {
        this.selectedOrigins.forEach(element => {
          if (!element.Price) {
            this._toast.error('Price is missing for ' + element.addChrName, 'Error')
            ADCHValidated = false
            return;
          }
          if (!element.CurrId) {
            this._toast.error('Currency is missing for ' + element.addChrName, 'Error')
            ADCHValidated = false
            return;
          }
        });
      }

      if (importCharges.length) {
        this.selectedDestinations.forEach(element => {
          if (!element.Price) {
            this._toast.error('Price is missing for ' + element.addChrName, 'Error')
            ADCHValidated = false
            return;
          }
          if (!element.CurrId) {
            this._toast.error('Currency is missing for ' + element.addChrName, 'Error')
            ADCHValidated = false
            return;
          }
        });
      }

      if (!ADCHValidated) {
        return false
      }

    }

    if (!obj.carrierID &&
      !obj.containerSpecID &&
      !obj.effectiveFrom &&
      !obj.effectiveTo &&
      !obj.podID &&
      !obj.polID &&
      !obj.price &&
      !obj.shippingCatID
    ) {
      this._toast.info('Please fill atleast one field to save', 'Info')
      return;
    }

    if ((obj.podID && obj.polID) && obj.podID === obj.polID) {
      this._toast.warning('Source and Destination ports cannot be same', 'Warning')
      return;
    }

    console.log(this.selectedData.drafts);
    let duplicateRecord: boolean = false;
    if (this.selectedData.drafts) {
      this.selectedData.drafts.forEach(element => {
        if (
          element.CarrierID === obj.carrierID &&
          element.ContainerSpecID === obj.containerSpecID &&
          moment(element.EffectiveFrom).format('D MMM, Y') === moment(obj.effectiveFrom).format('D MMM, Y') &&
          moment(element.EffectiveTo).format('D MMM, Y') === moment(obj.effectiveTo).format('D MMM, Y') &&
          element.PodID === obj.podID &&
          element.PolID === obj.polID &&
          element.Price === parseInt(obj.price) &&
          element.ShippingCatID === obj.shippingCatID
        ) {
          duplicateRecord = true;
        }
      });
    }

    if (obj.podType === 'Ground' && obj.polType === 'Ground') {
      this._toast.info('Please change origin or destination type', 'Info')
      return;
    }

    if (duplicateRecord) {
      // this._toast.warning('This record has already been added', 'Warning')
      // return
    }

    if (this.selectedData.forType === 'FCL') {
      this._seaFreightService.saveDraftRate(this.selectedData.forType.toLowerCase(), obj).subscribe((res: any) => {
        if (res.returnId > 0) {
          this._toast.success("Rates added successfully", "Success");
          if (type === "onlySave") {
            this.closeModal(res.returnObject);
          } else {
            console.log(this.selectedData);
            if(this.selectedData.data) {
              this.selectedData.data.ProviderPricingDraftID = 0;
            }
            this.selectedPrice = undefined;
            this.selectedContSize = null;
            this.savedRow.emit(res.returnObject)
          }
        }
      });
    } else if (this.selectedData.forType == 'LCL') {
      this._seaFreightService.saveDraftRate('lcl', obj).subscribe((res: any) => {
        if (res.returnId > 0) {
          this._toast.success("Rates added successfully", "Success");
          if (type === "onlySave") {
            this.closeModal(res.returnObject);
          } else {
            this.selectedPrice = undefined;
            if(this.selectedData.data) {
              this.selectedData.data.ConsolidatorPricingDraftID = 0;
            }
            
            this.selectedContSize = null;
            this.savedRow.emit(res.returnObject)
          }
        }
      });
    } else if (this.selectedData.forType == 'FCL-Ground' || this.selectedData.forType == 'FTL') {
      this._seaFreightService.saveDraftRate('ground', obj).subscribe((res: any) => {
        if (res.returnId > 0) {
          this._toast.success("Rates added successfully", "Success");
          if (type === "onlySave") {
            this.closeModal(res.returnObject);
          } else {
            this.selectedPrice = undefined;
            if(this.selectedData) {
              this.selectedData.ID = 0;
            }
            this.couplePrice = null;
            this.selectedContSize = null;
            this.savedRow.emit(res.returnObject)
          }
        }
      });
    }
  }



  addRow() {
    this._seaFreightService
      .addDraftRates({
        createdBy: this.userProfile.LoginID,
        providerID: this.userProfile.ProviderID
      })
      .subscribe((res: any) => {
        if (res.returnStatus == "Success") {
          this._sharedService.draftRowFCLAdd.next(res.returnObject);
          this.newProviderPricingDraftID = undefined;
          this.selectedPrice = undefined;
          this.selectedContSize = null;
          this.newProviderPricingDraftID = res.returnObject.ProviderPricingDraftID;
        }
      });
  }

  numberValid(evt) {
    let charCode = evt.which ? evt.which : evt.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) return false;
    return true;
  }

  getContSpecName(id) {
    return this.allContainers.find(obj => obj.ContainerSpecID == id).ContainerSpecShortName;
  }
  getShippingName(id) {
    return this.allCargoType.find(obj => obj.ShippingCatID == id).ShippingCatName;
  }

  getHandlingSpecName(id) {
    return this.allHandlingType.find(obj => obj.ContainerSpecID == id).ContainerSpecShortName;
  }
  onDateSelection(date: NgbDateStruct) {
    let parsed = "";
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
      parsed += " - " + this._parserFormatter.format(this.toDate);
    }

    this.renderer.setProperty(this.rangeDp.nativeElement, "value", parsed);
  }

  closeModal(status) {
    this._activeModal.close(status);
    if (this.containerLoadParam == "FCL") {
      this._sharedService.draftRowFCLAdd.next(null);
    }
    else if (this.containerLoadParam == "LCL") {
      this._sharedService.draftRowLCLAdd.next(null);
    }
    document.getElementsByTagName("html")[0].style.overflowY = "auto";
  }
  closePopup() {
    // let object = {
    //   data: this.allRatesFilledData
    // };
    this.closeModal(false);
  }
  shippings = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      map(term =>
        !term || term.length < 3
          ? []
          : this.allShippingLines.filter(
            v =>
              v.CarrierName &&
              v.CarrierName.toLowerCase().indexOf(term.toLowerCase()) > -1
          )
      )
    );
  formatter = (x: { CarrierName: string; CarrierImage: string }) => x.CarrierName

  ports = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      map(term =>
        !term || term.length < 3
          ? []
          : this.seaPorts.filter(
            v =>
              v.PortName &&
              v.PortName.toLowerCase().indexOf(term.toLowerCase()) > -1
          )
      )
    );
  portsFormatter = (x: { PortName: string }) => x.PortName;

  currencies = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      map(term =>
        !term || term.length < 3
          ? []
          : this.allCurrencies.filter(
            v =>
              v.shortName &&
              v.shortName.toLowerCase().indexOf(term.toLowerCase()) > -1
          )
      )
    );
  currencyFormatter = (x) => x.shortName;


  selectCharges(type, model, index) {
    model.Imp_Exp = type;
    if (type === 'EXPORT') {
      if ((Object.keys(this.selectedOrigins[index]).length === 0 && this.selectedOrigins[index].constructor === Object) || !this.selectedOrigins[index].hasOwnProperty('currency')) {
        model.CurrId = this.selectedCurrency.id
        model.currency = this.selectedCurrency
      } else {
        model.CurrId = this.selectedOrigins[index].currency.id
        model.currency = this.selectedOrigins[index].currency
      }
      const { selectedOrigins } = this
      selectedOrigins.forEach(element => {
        if ((Object.keys(element).length === 0 && element.constructor === Object)) {
          let idx = selectedOrigins.indexOf(element)
          selectedOrigins.splice(idx, 1)
        }
      });
      if (selectedOrigins[index]) {
        this.originsList.push(selectedOrigins[index])
        selectedOrigins[index] = model;
      } else {
        selectedOrigins.push(model)
      }
      this.selectedOrigins = cloneObject(selectedOrigins)
      this.originsList = this.originsList.filter(e => e.addChrID !== model.addChrID)
    } else if (type === 'IMPORT') {
      if ((Object.keys(this.selectedDestinations[index]).length === 0 && this.selectedDestinations[index].constructor === Object) || !this.selectedDestinations[index].hasOwnProperty('currency')) {
        model.CurrId = this.selectedCurrency.id
        model.currency = this.selectedCurrency
      } else {
        model.CurrId = this.selectedDestinations[index].currency.id
        model.currency = this.selectedDestinations[index].currency
      }
      const { selectedDestinations } = this
      selectedDestinations.forEach(element => {
        if ((Object.keys(element).length === 0 && element.constructor === Object)) {
          let idx = selectedDestinations.indexOf(element)
          selectedDestinations.splice(idx, 1)
        }
      });
      if (selectedDestinations[index]) {
        this.destinationsList.push(selectedDestinations[index])
        selectedDestinations[index] = model;
      } else {
        selectedDestinations.push(model)
      }
      this.selectedDestinations = cloneObject(selectedDestinations)
      this.destinationsList = this.destinationsList.filter(e => e.addChrID !== model.addChrID)
    }
  }

  getVal(idx, event, type) {
    if (typeof event === 'object') {
      if (type === 'origin') {
        this.selectedOrigins[idx].CurrId = event.id
      } else if (type === 'destination') {
        this.selectedDestinations[idx].CurrId = event.id
      }
    }
  }

  addMoreCharges(type) {
    if (type === 'origin') {
      if (!this.selectedOrigins[this.selectedOrigins.length - 1].CurrId) {
        this._toast.info('Please select currency', 'Info')
        return;
      }
      if (!this.selectedOrigins[this.selectedOrigins.length - 1].Price) {
        this._toast.info('Please add price', 'Info')
        return;
      }
      if (!this.selectedOrigins[this.selectedOrigins.length - 1].addChrCode) {
        this._toast.info('Please select any additional charge', 'Info')
        return;
      }
      if (!(Object.keys(this.selectedOrigins[this.selectedOrigins.length - 1]).length === 0 && this.selectedOrigins[this.selectedOrigins.length - 1].constructor === Object) && (parseInt(this.selectedOrigins[this.selectedOrigins.length - 1].Price)) && this.selectedOrigins[this.selectedOrigins.length - 1].CurrId) {
        this.selectedOrigins.push({
          CurrId: this.selectedOrigins[this.selectedOrigins.length - 1].currency.id,
          currency: this.selectedOrigins[this.selectedOrigins.length - 1].currency
        })
      }
    } else if (type === 'destination') {
      if (!this.selectedDestinations[this.selectedDestinations.length - 1].CurrId) {
        this._toast.info('Please select currency', 'Info')
        return;
      }
      if (!this.selectedDestinations[this.selectedDestinations.length - 1].Price) {
        this._toast.info('Please add price', 'Info')
        return;
      }
      if (!this.selectedDestinations[this.selectedDestinations.length - 1].addChrCode) {
        this._toast.info('Please select any additional charge', 'Info')
        return;
      }
      if (!(Object.keys(this.selectedDestinations[this.selectedDestinations.length - 1]).length === 0 && this.selectedDestinations[this.selectedDestinations.length - 1].constructor === Object) && (parseInt(this.selectedDestinations[this.selectedDestinations.length - 1].Price)) && this.selectedDestinations[this.selectedDestinations.length - 1].CurrId) {
        this.selectedDestinations.push({
          CurrId: this.selectedDestinations[this.selectedDestinations.length - 1].currency.id,
          currency: this.selectedDestinations[this.selectedDestinations.length - 1].currency
        })
      }
    }
  }

  setEditData(type) {
    let parsedJsonSurchargeDet;
    if (type === 'publish') {
      parsedJsonSurchargeDet = JSON.parse(this.selectedData.data[0].jsonSurchargeDet)
    } else if (type === 'draft') {
      parsedJsonSurchargeDet = JSON.parse(this.selectedData.data.JsonSurchargeDet)
    }
    this.destinationsList = cloneObject(this.selectedData.addList)
    this.selectedData.addList.forEach(element => {
      this.destinationsList.forEach(e => {
        if (e.addChrID === element.addChrID) {
          let idx = this.destinationsList.indexOf(e)
          this.destinationsList.splice(1, idx)
        }
      })
      // this.originsList.forEach(e => {
      //   if (e.addChrID === element.addChrID) {
      //     let idx = this.originsList.indexOf(e)
      //     this.originsList.splice(1, idx)
      //   }
      // })
    });
    console.log(this.destinationsList);
    this.selectedOrigins = parsedJsonSurchargeDet.filter((e) => e.Imp_Exp === 'EXPORT')
    if (!this.selectedOrigins.length) {
      this.selectedOrigins = [{}]
    }
    this.selectedDestinations = parsedJsonSurchargeDet.filter((e) => e.Imp_Exp === 'IMPORT')
    if (!this.selectedDestinations.length) {
      this.selectedDestinations = [{}]
    }
  }

  closeDropdown(event) {
    let x: any = document.getElementsByClassName('dropdown-menu')
    if (!event.target.className.includes('has-open')) {
      this.originDropdown.close()
      this.destinationDropdown.close()
    }
    // if (!this._eref.nativeElement.contains(event.target)) // or some similar check
  }

  public surchargesList: any = []
  getSurchargeBasis(containerLoad) {
    this._seaFreightService.getSurchargeBasis(containerLoad).subscribe((res) => {
      this.surchargesList = res
    }, (err) => {
    })
  }
  public isOriginChargesForm = false;
  public isDestinationChargesForm = false;
  public lablelName: string = ''
  public surchargeType = '';
  public labelValidate: boolean = true
  public surchargeBasisValidate: boolean = true
  showCustomChargesForm(type) {
    if (type === 'origin') {
      this.isOriginChargesForm = !this.isOriginChargesForm
    } else if (type === 'destination') {
      this.isDestinationChargesForm = !this.isDestinationChargesForm
    }
  }

  onKeyDown(idx, event, type) {
    if (!event.target.value) {
      if (type === 'origin') {
        this.selectedOrigins[idx].currency = {}
        this.selectedOrigins[idx].CurrId = null;
      } else if (type === 'destination') {
        this.selectedDestinations[idx].currency = {}
        this.selectedDestinations[idx].CurrId = null;
      }
    }
  }

  public canAddLabel: boolean = true;
  addCustomLabel(type) {
    this.canAddLabel = true
    if (!this.lablelName) {
      this.labelValidate = false
      return;
    }
    if (!this.surchargeType) {
      this.surchargeBasisValidate = false
      return;
    }
    const selectedSurcharge = this.surchargesList.find(obj => obj.codeValID === parseInt(this.surchargeType));
    let obj = {
      addChrID: -1,
      addChrCode: 'OTHR',
      addChrName: this.lablelName,
      addChrDesc: this.lablelName,
      modeOfTrans: 'SEA',
      addChrBasis: selectedSurcharge.codeVal,
      createdBy: this.userProfile.PrimaryEmail,
      addChrType: 'ADCH',
      providerID: this.userProfile.ProviderID
    }
    this.selectedData.addList.forEach(element => {
      if (element.addChrName === obj.addChrName) {
        this.canAddLabel = false
      }
    });

    if (!this.canAddLabel) {
      this._toast.info('Already Added, Please try another name', 'Info')
      return false
    }

    this._seaFreightService.addCustomCharge(obj).subscribe((res: any) => {
      this.isOriginChargesForm = false;
      this.isDestinationChargesForm = false;
      if (res.returnId !== -1) {
        let obj = {
          addChrID: res.returnId,
          addChrCode: 'OTHR',
          addChrName: this.lablelName,
          addChrDesc: this.lablelName,
          modeOfTrans: 'SEA',
          addChrBasis: selectedSurcharge.codeVal,
          createdBy: this.userProfile.PrimaryEmail,
          addChrType: 'ADCH',
          providerID: this.userProfile.ProviderID
        }
        if (type === 'origin') {
          this.originsList.push(obj)
        } else if (type === 'destination') {
          this.destinationsList.push(obj)
        }
        this.lablelName = ''
        this.surchargeType = ''
      }
    }, (err) => {
      console.log(err);
    })
  }

  public addDestinationActive: boolean = false;
  public addOriginActive: boolean = false;
  dropdownToggle(event, type) {
    if (event) {
      this.isDestinationChargesForm = false;
      this.isOriginChargesForm = false;
      this.surchargeBasisValidate = true
      this.labelValidate = true
      if (type === 'destination') {
        this.addDestinationActive = true
      } else if (type === 'origin') {
        this.addOriginActive = true
      }
    } else {
      this.addOriginActive = false
      this.addDestinationActive = false
    }
  }


  public combinedContainers = []
  public fclContainers = []
  public selectedFCLContainers = []
  public shippingCategories = []
  public cities: any[] = []
  /**
   * Getting all dropdown values to fill
   *
   * @memberof SeaFreightComponent
   */
  getDropdownsList() {
    // this._sharedService.cityList.subscribe((state: any) => {
    //   if (state) {
    //     console.log(state);

    //     this.cities = state;
    //   }
    // });
    console.log(this.selectedData);
    this.transPortMode = 'SEA'
    this.allPorts = JSON.parse(localStorage.getItem('PortDetails'))
    this.seaPorts = this.allPorts.filter(e => e.PortType === 'SEA')
    this.combinedContainers = JSON.parse(localStorage.getItem('containers'))
    this.fclContainers = this.combinedContainers.filter(e => e.ContainerFor === 'FCL')
    let uniq = {}
    this.allCargoType = this.fclContainers.filter(obj => !uniq[obj.ShippingCatID] && (uniq[obj.ShippingCatID] = true));
    console.log(this.allCargoType)
    if (this.selectedData.forType === 'FCL-Ground' || this.selectedData.forType === 'FTL') {
      this.transPortMode = 'GROUND'
      let selectedCategory = this.allCargoType.find(obj => obj.ShippingCatName.toLowerCase() == 'goods');
      this.selectedCategory = selectedCategory.ShippingCatID
      this.groundPorts = this.allPorts.filter(e => e.PortType === 'Ground')
      if (this.groundPorts.length === 0) {
        loading(true)
        this._manageRateService.getPortsData('ground').subscribe((res: any) => {
          loading(false)
          this.groundPorts = res;
          localStorage.setItem('PortDetails', JSON.stringify(this.allPorts.concat(this.groundPorts)))
        })
      }
      // this.allContainers = this.combinedContainers.filter(e => e.ContainerFor === 'FTL' && e.ShippingCatID === this.selectedCategory)
      const groundContainers = this.combinedContainers.filter(e => e.ContainerFor === 'FTL' && e.ShippingCatID === this.selectedCategory)
      const containers = groundContainers.filter(e => e.ContainerSpecGroupName === 'Container')
      const trucks = groundContainers.filter(e => e.ContainerSpecGroupName != 'Container')
      console.log(containers);
      
      this.allContainers = containers.concat(trucks)
    }
  }


  // GROUND WORKING 
  public showPickupDropdown: boolean = false;
  public showDestinationDropdown: boolean = false;
  public showPickupPorts: boolean = false;
  public showPickupDoors: boolean = false;
  public showDestPorts: boolean = false;
  public showDestDoors: boolean = false;

  toggleDropdown(type) {
    if (!this.selectedContSize) return;
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
      setTimeout(() => {
        this.originPickupBox.nativeElement.focus();
        this.originPickupBox.nativeElement.select();
      }, 10);
    } else if (type === 'pickup-door') {
      this.showPickupDoors = true
      setTimeout(() => {
        this.originPickupBox.nativeElement.focus();
        this.originPickupBox.nativeElement.select();
      }, 10);
    } else if (type === 'delivery-sea') {
      this.showDestPorts = true
      setTimeout(() => {
        this.destinationPickupBox.nativeElement.focus();
        this.destinationPickupBox.nativeElement.select();
      }, 10);
    } else if (type === 'delivery-door') {
      this.showDestDoors = true
      setTimeout(() => {
        this.destinationPickupBox.nativeElement.focus();
        this.destinationPickupBox.nativeElement.select();
      }, 10);
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

  public groundAddresses: any = []
  public groundsPorts: any = []
  public transPortMode = 'SEA';
  portsFilterartion(obj) {
    if (typeof obj === 'object') {
      this.showPickupDropdown = false;
      this.showDestinationDropdown = false;
    }
    if (!this.showDoubleRates && this.transPortMode === 'GROUND') {
      if (obj.length >= 3) {
        this.searchTerm$ = obj
        this._manageRateService.getAllCities(obj).pipe(debounceTime(400), distinctUntilChanged()).subscribe((res: any) => {
          console.log(res)
          this.cities = res;
        }, (err: any) => {
          console.log(err)
        })
      }
    }
  }


  onCityKeyUp(obj) {
    console.log(obj);
  }


  //Ground areas formatter and observer
  public groundPorts = []
  addresses = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      map(term => (!term || term.length < 3) ? []
        : this.groundPorts.filter(v => v.PortName && v.PortName.toLowerCase().indexOf(term.toLowerCase()) > -1))
    )
  addressFormatter = (x: { PortName: string }) => {
    return x.PortName
  };

  //Ground areas formatter and observer
  citiesList = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(500),
      map(term => (!term || term.length < 3) ? [] : this.cities.filter(
        v => (v.title.toLowerCase().indexOf(term.toLowerCase()) > -1 || v.shortName.toLowerCase().indexOf(term.toLowerCase()) > -1 || v.code.toLowerCase().indexOf(term.toLowerCase()) > -1))))

  citiesFormatter = (x: { title: string, imageName: string }) => {
    return x.title
  };

  public showDoubleRates: boolean = false
  public priceBasis: string = ''
  containerChange(containerID) {
    if (this.transPortMode === 'GROUND') {
      let fclContainers = this.allContainers.filter(e => e.ContainerSpecID === parseInt(containerID) && e.ContainerSpecGroupName === 'Container')
      let ftlContainers = this.allContainers.filter(e => e.ContainerSpecID === parseInt(containerID))
      if (fclContainers.length) {
        this.priceBasis = fclContainers[0].PriceBasis
        this.showDoubleRates = true
        this.containerLoadParam = 'FCL'
      } else {
        this.couplePrice = null
        this.showDoubleRates = false
        this.containerLoadParam = 'FTL'
      }
      if (ftlContainers.length) {
        this.priceBasis = ftlContainers[0].PriceBasis
      }
    } else if (this.transPortMode === 'SEA') {
      const fclContainers = this.fclContainers.filter(e => e.ContainerSpecID === parseInt(containerID))
      if (fclContainers.length) {
        this.priceBasis = fclContainers[0].PriceBasis
      }
      console.log(fclContainers);
    }
  }


  /**
   * GET BASE URL FOR UI IMAGES
   *
   * @param {string} $image
   * @returns
   * @memberof SeaRateDialogComponent
   */
  getShippingLineImage($image: string) {
    return getImagePath(ImageSource.FROM_SERVER, '/' + $image, ImageRequiredSize.original)
  }

  setCurrency() {
    const userCurrency = parseInt(localStorage.getItem('userCurrency'))
    this.selectedCurrency = this.allCurrencies.find(
      obj => obj.id === userCurrency
    );
  }

  removeAdditionalCharge(type, obj) {
    console.log(type);
    console.log(obj);
    // if (type === 'origin') {
    //   this.selectedOrigins.forEach(element => {
    //     if (element.addChrID === obj.addChrID) {
    //       let idx = this.selectedOrigins.indexOf(element)
    //       this.selectedOrigins.splice(element, 1, {})
    //     }
    //   });
    // }
  }


}
