import { Component, OnInit, ViewEncapsulation, ViewChild, Renderer2, ElementRef, Input } from '@angular/core';
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
  @ViewChild('myDrop') myDrop: any
  @Input() selectedData: any;

  public allShippingLines: any[] = [];
  public allCargoType: any[] = [];
  public allContainersType: any[] = [];
  public allContainers: any[] = [];
  public allHandlingType: any[] = [];
  public allPorts: any[] = [];
  public allCurrencies: any[] = [];
  private allRatesFilledData: any[] = [];
  public filterOrigin: any = {};
  public filterDestination: any = {};
  public userProfile: any;
  public selectedCategory: any;
  public selectedContSize: any;
  public selectedHandlingUnit: any;
  public selectedShipping: any;
  public selectedPrice: any;
  public defaultCurrency: any = {
    CurrencyID: 101,
    CurrencyCode: "AED",
    CountryCode: 'AE'
  };
  public selectedCurrency: any;
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

  constructor(
    private location: PlatformLocation,
    private _activeModal: NgbActiveModal,
    private _sharedService: SharedService,
    private _parserFormatter: NgbDateParserFormatter,
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
    this.userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (this.userInfo && this.userInfo.returnText) {
      this.userProfile = JSON.parse(this.userInfo.returnText);
    }
    this.allservicesBySea();
    if (this.selectedData.data.JsonSurchargeDet) {
      this.setEditData()
    }
    this.destinationsList = this.selectedData.addList
    this.originsList = this.selectedData.addList
    this.getSurchargeBasis(this.selectedData.forType)
    console.log(this.selectedData.addList);

  }

  allservicesBySea() {
    this._sharedService.dataLogisticServiceBySea.subscribe(state => {
      if (state && state.length) {
        for (let index = 0; index < state.length; index++) {
          if (state[index].LogServName == "SEA") {
            this.allShippingLines = state[index].DropDownValues.ShippingLine;
            this.allCargoType = state[index].DropDownValues.Category;
            this.allContainersType = state[index].DropDownValues.ContainerFCL;
            this.allHandlingType = state[index].DropDownValues.ContainerLCL;
            this.allPorts = state[index].DropDownValues.Port;
            this.allCurrencies = state[index].DropDownValues.UserCurrency;

            if (this.selectedData && this.selectedData.data && this.selectedData.forType === "FCL") {
              this.setData(this.selectedData.data);
            }
            else if (this.selectedData && this.selectedData.data && this.selectedData.forType === "LCL") {
              this.setDataLCL(this.selectedData.data);
            }
          }
        }
      }
    });
  }
  setData(data) {
    let parsed = "";
    this.selectedCategory = data.ShippingCatID;
    this.cargoTypeChange(this.selectedCategory);
    this.selectedContSize = data.ContainerSpecID;
    this.filterOrigin = this.allPorts.find(
      obj => obj.PortID == data.PolID
    );
    this.filterDestination = this.allPorts.find(
      obj => obj.PortID == data.PodID
    );
    this.selectedShipping = this.allShippingLines.find(
      obj => obj.CarrierID == data.CarrierID
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
  setDataLCL(data) {
    let parsed = "";
    this.selectedCategory = data.ShippingCatID;
    this.cargoTypeChange(this.selectedCategory);
    this.selectedHandlingUnit = data.ContainerSpecID;
    this.filterOrigin = this.allPorts.find(
      obj => obj.PortID == data.PolID
    );
    this.filterDestination = this.allPorts.find(
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
    let data = this.allContainersType.filter(obj => obj.ShippingCatID == type);
    this.allContainers = data;
  }

  savedraftrow(type) {
    if (this.selectedData.forType == 'FCL') {
      this.saveDataInFCLDraft(type);
    }
    else if (this.selectedData.forType == 'LCL') {
      this.saveDataInLCLDraft(type);
    }
  }

  saveDataInLCLDraft(type) {
    let obj = [{
      consolidatorPricingDraftID: (!this.newProviderPricingDraftID) ? this.selectedData.data.ConsolidatorPricingDraftID : this.newProviderPricingDraftID,
      customerID: null,
      providerID: this.userProfile.ProviderID,
      // containerSpecID: (this.selectedHandlingUnit == null || this.selectedHandlingUnit == 'null') ? null : this.selectedHandlingUnit,
      // containerSpecShortName: (this.selectedHandlingUnit == null || this.selectedHandlingUnit == 'null') ? undefined : this.getHandlingSpecName(this.selectedHandlingUnit),
      containerSpecID: (this.selectedHandlingUnit == null || this.selectedHandlingUnit == 'null') ? null : null,
      containerSpecShortName: (this.selectedHandlingUnit == null || this.selectedHandlingUnit == 'null') ? undefined : null,
      shippingCatID: (this.selectedCategory == null || this.selectedCategory == 'null') ? null : this.selectedCategory,
      shippingCatName: (this.selectedCategory == null || this.selectedCategory == 'null') ? undefined : this.getShippingName(this.selectedCategory),
      containerLoadType: "LCL",
      modeOfTrans: "SEA",
      polID: (this.filterOrigin && this.filterOrigin.PortID) ? this.filterOrigin.PortID : null,
      polName: (this.filterOrigin && this.filterOrigin.PortID) ? this.filterOrigin.PortName : null,
      polCode: (this.filterOrigin && this.filterOrigin.PortID) ? this.filterOrigin.PortCode : null,
      podID: (this.filterDestination && this.filterDestination.PortID) ? this.filterDestination.PortID : null,
      podName: (this.filterDestination && this.filterDestination.PortID) ? this.filterDestination.PortName : null,
      podCode: (this.filterDestination && this.filterDestination.PortID) ? this.filterDestination.PortCode : null,
      price: this.selectedPrice,
      currencyID: (this.selectedCurrency.CurrencyID) ? this.selectedCurrency.CurrencyID : 101,
      currencyCode: (this.selectedCurrency.CurrencyCode) ? this.selectedCurrency.CurrencyCode : 'AED',
      effectiveFrom: (this.fromDate && this.fromDate.month) ? this.fromDate.month + '/' + this.fromDate.day + '/' + this.fromDate.year : null,
      effectiveTo: (this.toDate && this.toDate.month) ? this.toDate.month + '/' + this.toDate.day + '/' + this.toDate.year : null,
    }
    ]
    this._seaFreightService.saveDraftRateLCL(obj).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        this._toast.success("Rates added successfully", "");
        this.allRatesFilledData.push(obj[0]);
        if (type != "saveNadd") {
          let object = {
            data: this.allRatesFilledData
          };
          this.closeModal(object);
        } else {
          this.addRowLCL();
        }
      }
    });
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


  saveDataInFCLDraft(type) {
    let obj = [{
      providerPricingDraftID: (!this.newProviderPricingDraftID) ? this.selectedData.data.ProviderPricingDraftID : this.newProviderPricingDraftID,
      customerID: null,
      carrierID: (this.selectedShipping) ? this.selectedShipping.CarrierID : undefined,
      carrierName: (this.selectedShipping) ? this.selectedShipping.CarrierName : undefined,
      carrierImage: (this.selectedShipping) ? this.selectedShipping.CarrierImage : undefined,
      providerID: this.userProfile.ProviderID,
      containerSpecID: (this.selectedContSize == null || this.selectedContSize == 'null') ? null : this.selectedContSize,
      containerSpecName: (this.selectedContSize == null || this.selectedContSize == 'null') ? undefined : this.getContSpecName(this.selectedContSize),
      shippingCatID: (this.selectedCategory == null || this.selectedCategory == 'null') ? null : this.selectedCategory,
      shippingCatName: (this.selectedCategory == null || this.selectedCategory == 'null') ? undefined : this.getShippingName(this.selectedCategory),
      containerLoadType: "FCL",
      modeOfTrans: "SEA",
      polID: (this.filterOrigin && this.filterOrigin.PortID) ? this.filterOrigin.PortID : null,
      polName: (this.filterOrigin && this.filterOrigin.PortID) ? this.filterOrigin.PortName : null,
      polCode: (this.filterOrigin && this.filterOrigin.PortID) ? this.filterOrigin.PortCode : null,
      podID: (this.filterDestination && this.filterDestination.PortID) ? this.filterDestination.PortID : null,
      podName: (this.filterDestination && this.filterDestination.PortID) ? this.filterDestination.PortName : null,
      podCode: (this.filterDestination && this.filterDestination.PortID) ? this.filterDestination.PortCode : null,
      price: this.selectedPrice,
      currencyID: (this.selectedCurrency.CurrencyID) ? this.selectedCurrency.CurrencyID : 101,
      currencyCode: (this.selectedCurrency.CurrencyCode) ? this.selectedCurrency.CurrencyCode : 'AED',
      effectiveFrom: (this.fromDate && this.fromDate.month) ? this.fromDate.month + '/' + this.fromDate.day + '/' + this.fromDate.year : null,
      effectiveTo: (this.toDate && this.toDate.month) ? this.toDate.month + '/' + this.toDate.day + '/' + this.toDate.year : null,
      JsonSurchargeDet: JSON.stringify(this.selectedOrigins.concat(this.selectedDestinations))
    }
    ]

    let parsedJsonSurchargeDet = JSON.parse(obj[0].JsonSurchargeDet)
    const impArr = parsedJsonSurchargeDet.filter(e => e.Imp_Exp === 'IMPORT')
    const expArr = parsedJsonSurchargeDet.filter(e => e.Imp_Exp === 'EXPORT')

    const { carrierName, containerSpecID, price, podCode, polCode, shippingCatID } = obj[0]
    if (!carrierName && !containerSpecID && !price && !podCode && !polCode && !shippingCatID && !expArr.length && !impArr.length) {
      this._toast.error('Please fill atleast one field', 'Error')
      return
    }

    this._seaFreightService.saveDraftRate(obj).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        this._toast.success("Rates added successfully", "");
        this.allRatesFilledData.push(obj[0]);
        if (type != "saveNadd") {
          let object = {
            data: this.allRatesFilledData
          };
          this.closeModal(object);
        } else {
          this.addRow();
          this.selectedOrigins = [{}]
          this.selectedDestinations = [{}]
          this.destinationsList = this.selectedData.addList
          this.originsList = this.selectedData.addList
        }
      }
    });
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
    if (this.selectedData.forType == "FCL") {
      this._sharedService.draftRowFCLAdd.next(null);
    }
    else if (this.selectedData.forType == "LCL") {
      this._sharedService.draftRowLCLAdd.next(null);
    }
    document.getElementsByTagName("html")[0].style.overflowY = "auto";
  }
  closePopup() {
    let object = {
      data: this.allRatesFilledData
    };
    this.closeModal(object);
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
  formatter = (x: { CarrierName: string }) => x.CarrierName;

  ports = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      map(term =>
        !term || term.length < 3
          ? []
          : this.allPorts.filter(
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
              v.CurrencyCode &&
              v.CurrencyCode.toLowerCase().indexOf(term.toLowerCase()) > -1
          )
      )
    );
  currencyFormatter = (x) => x.CurrencyCode;

  public selectedOrigins: any = [{}];
  public selectedDestinations: any = [{}];
  selectCharges(type, model, index) {
    model.Imp_Exp = type;
    if (type === 'EXPORT') {
      if ((Object.keys(this.selectedOrigins[index]).length === 0 && this.selectedOrigins[index].constructor === Object) || !this.selectedOrigins[index].hasOwnProperty('currency')) {
        model.CurrId = this.selectedCurrency.CurrencyID
        model.currency = this.selectedCurrency
      } else {
        model.CurrId = this.selectedOrigins[index].currency.CurrencyID
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
        model.CurrId = this.selectedCurrency.CurrencyID
      } else {
        model.CurrId = this.selectedDestinations[index].currency.CurrencyID
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
        this.selectedOrigins[idx].CurrId = event.CurrencyID
      } else if (type === 'destination') {
        this.selectedDestinations[idx].CurrId = event.CurrencyID
      }
    }
  }

  addMoreCharges(type) {
    if (type === 'origin') {
      if (!(Object.keys(this.selectedOrigins[this.selectedOrigins.length - 1]).length === 0 && this.selectedOrigins[this.selectedOrigins.length - 1].constructor === Object) && (parseInt(this.selectedOrigins[this.selectedOrigins.length - 1].Price)) && this.selectedOrigins[this.selectedOrigins.length - 1].CurrId) {
        console.log(this.selectedOrigins);

        this.selectedOrigins.push({
          currency: this.selectedOrigins[this.selectedOrigins.length - 1].currency
        })
      }
    } else if (type === 'destination') {
      if (!(Object.keys(this.selectedDestinations[this.selectedDestinations.length - 1]).length === 0 && this.selectedDestinations[this.selectedDestinations.length - 1].constructor === Object) && (parseInt(this.selectedDestinations[this.selectedDestinations.length - 1].Price)) && this.selectedDestinations[this.selectedDestinations.length - 1].CurrId) {
        this.selectedDestinations.push({
          currency: this.selectedDestinations[this.selectedDestinations.length - 1].currency
        })
      }
    }
  }

  setEditData() {
    const parsedJsonSurchargeDet = JSON.parse(this.selectedData.data.JsonSurchargeDet)
    this.selectedOrigins = parsedJsonSurchargeDet.filter((e) => e.Imp_Exp === 'EXPORT')
    if (!this.selectedOrigins.length) {
      this.selectedOrigins = [{}]
    }
    console.log(this.selectedOrigins);
    this.selectedDestinations = parsedJsonSurchargeDet.filter((e) => e.Imp_Exp === 'IMPORT')
    if (!this.selectedDestinations.length) {
      this.selectedDestinations = [{}]
    }
  }

  closeDropdown(event) {
    console.log(event);
    if(event.target.id === '') {
      this.myDrop.close()
    }
    
    // if (!this._eref.nativeElement.contains(event.target)) // or some similar check
    //  console.log('here')
  }

  public surchargesList: any = []
  getSurchargeBasis(containerLoad) {
    this._seaFreightService.getSurchargeBasis(containerLoad).subscribe((res) => {
      console.log(res)
      this.surchargesList = res
    }, (err) => {
      console.log(err);

    })
  }
  public isChargesForm = false;
  public lablelName: string = ''
  public surchargeType: any;
  public labelValidate: boolean = true
  public surchargeBasisValidate: boolean = true
  showCustomChargesForm(event) {
    event.stopPropagation()
    this.myDrop.open()
    this.isChargesForm = !this.isChargesForm
  }

  public canAddLabel: boolean = true;
  addCustomLabel() {
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
      modeOfTrans: this.selectedData.forType,
      addChrBasis: selectedSurcharge.codeVal,
      createdBy: this.userProfile.PrimaryEmail,
      addChrType: 'ADCH',
      providerID: this.userProfile.ProviderID
    }

    this.selectedData.addList.forEach(element => {
      if (element.addChrName === obj.addChrName && element.addChrBasis === obj.addChrBasis) {
        this.canAddLabel = false
        return false;
      }
    });

    if (!this.canAddLabel) {
      this._toast.info('Already Added, Please try another surcharge type', 'Info')
      return false
    }


    this._seaFreightService.addCustomCharge(obj).subscribe((res: any) => {
      this.isChargesForm = false;
      if (res.returnId !== -1) {
        let obj = {
          addChrID: res.returnId,
          addChrCode: 'OTHR',
          addChrName: this.lablelName,
          addChrDesc: this.lablelName,
          modeOfTrans: this.selectedData.forType,
          addChrBasis: selectedSurcharge.codeVal,
          createdBy: this.userProfile.PrimaryEmail,
          addChrType: 'ADCH',
          providerID: this.userProfile.ProviderID
        }
        this.selectedData.addList.push(obj)
      }
    }, (err) => {
      console.log(err);
    })
  }

  dropdownToggle(event, type) {
    if (event) {
      this.isChargesForm = false;
      this.surchargeBasisValidate = true
      this.labelValidate = true
    }
  }

}
