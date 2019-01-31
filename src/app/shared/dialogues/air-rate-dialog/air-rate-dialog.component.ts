import { Component, OnInit, ViewEncapsulation, ViewChild, Renderer2, ElementRef, Input } from '@angular/core';
import { PlatformLocation } from '@angular/common';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { SharedService } from '../../../services/shared.service';
import { Observable, Subject, Subscription } from 'rxjs';
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
import { AirFreightService } from '../../../components/pages/user-desk/manage-rates/air-freight/air-freight.service';
import { ToastrService } from 'ngx-toastr';

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
  selector: 'app-air-rate-dialog',
  templateUrl: './air-rate-dialog.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./air-rate-dialog.component.scss']
})
export class AirRateDialogComponent implements OnInit {

  @ViewChild("dp") input: NgbInputDatepicker;
  @ViewChild('rangeDp') rangeDp: ElementRef;
  @Input() selectedData: any;

  public allAirLines: any[] = [];
  public allCargoType: any[] = [];
  public allPorts: any[] = [];
  public allCurrencies: any[] = [];
  public filterOrigin: any = {};
  public filterDestination: any = {};
  public userProfile: any;
  public selectedCategory: any;
  public selectedAirline: any;
  public minPrice: any;
  public normalPrice: any;
  public plusfortyFivePrice: any;
  public plushundredPrice: any;
  public plusTwoFiftyPrice: any;
  public plusFiveHundPrice: any;
  public plusThousandPrice: any;

  public defaultCurrency: any = {
    CurrencyID: 101,
    CurrencyCode: 'AED',
    CountryCode: 'AE',
  }
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
  private allRatesFilledData: any[] = [];
  private newProviderPricingDraftID = undefined;

  private newDraftOne = undefined;
  private newDraftTwo = undefined;
  private newDraftThree = undefined;
  private newDraftFour = undefined;
  private newDraftFive = undefined;
  private newDraftSix = undefined;

  isHovered = date =>
    this.fromDate && !this.toDate && this.hoveredDate && after(date, this.fromDate) && before(date, this.hoveredDate)
  isInside = date => after(date, this.fromDate) && before(date, this.toDate);
  isFrom = date => equals(date, this.fromDate);
  isTo = date => equals(date, this.toDate);
  constructor(
    private location: PlatformLocation,
    private _activeModal: NgbActiveModal,
    private _sharedService: SharedService,
    private _parserFormatter: NgbDateParserFormatter,
    private renderer: Renderer2,
    private _airFreightService: AirFreightService,
    private _toast: ToastrService

  ) { location.onPopState(() => this.closeModal(null)); }

  ngOnInit() {
    let userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo && userInfo.returnText) {
      this.userProfile = JSON.parse(userInfo.returnText);
    }
    this.allservicesBySea();
  }


  allservicesBySea() {
    this._sharedService.dataLogisticServiceBySea.subscribe(state => {
      if (state && state.length) {
        for (let index = 0; index < state.length; index++) {
          if (state[index].LogServName == "SEA") {
            this.allAirLines = state[index].DropDownValues.AirLine;
            this.allCargoType = state[index].DropDownValues.Category;
            this.allPorts = state[index].DropDownValues.AirPort;
            this.allCurrencies = state[index].DropDownValues.UserCurrency;
            if (this.selectedData) {
              this.setData()
            }

          }
        }
      }
    })
  }
  setData() {
    let parsed = "";
    this.selectedCategory = this.selectedData.ShippingCatID;
    this.selectedCategory = this.selectedData.ShippingCatID;
    this.filterOrigin = this.allPorts.find(obj => obj.PortID == this.selectedData.PolID);
    this.filterDestination = this.allPorts.find(obj => obj.PortID == this.selectedData.PodID);
    this.selectedAirline = this.allAirLines.find(obj => obj.CarrierID == this.selectedData.CarrierID);
    this.selectedCurrency = this.allCurrencies.find(obj => obj.CurrencyID == this.selectedData.CurrencyID);
    let minPrice = this.selectedData.slab.minPrice1.split(' ').pop();
    this.minPrice = (Math.ceil(minPrice)) ? Number(minPrice).toFixed(2) : null
    this.normalPrice = (Math.ceil(this.selectedData.slab.price1)) ? Number(this.selectedData.slab.price1).toFixed(2) : null;
    this.plusfortyFivePrice = (Math.ceil(this.selectedData.slab.price2)) ? Number(this.selectedData.slab.price2).toFixed(2) : null;
    this.plushundredPrice = (Math.ceil(this.selectedData.slab.price3)) ? Number(this.selectedData.slab.price3).toFixed(2) : null;
    this.plusTwoFiftyPrice = (Math.ceil(this.selectedData.slab.price4)) ? Number(this.selectedData.slab.price4).toFixed(2) : null;
    this.plusFiveHundPrice = (Math.ceil(this.selectedData.slab.price5)) ? Number(this.selectedData.slab.price5).toFixed(2) : null;
    this.plusThousandPrice = (Math.ceil(this.selectedData.slab.price6)) ? Number(this.selectedData.slab.price6).toFixed(2) : null;
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
    if (this.fromDate && this.fromDate.day) {
      this.model = this.fromDate;
      parsed += this._parserFormatter.format(this.fromDate);
    }
    if (this.toDate && this.toDate.day) {
      parsed += " - " + this._parserFormatter.format(this.toDate);
    }
    this.rangeDp.nativeElement.value = parsed;
    if (!this.selectedCurrency) {
      this.selectedCurrency = this.defaultCurrency;
    }

  }

  savedraftrow(type) {
    let obj =
    {
      carrierPricingSetID: (!this.newProviderPricingDraftID) ? this.selectedData.CarrierPricingSetID : this.newProviderPricingDraftID,
      carrierID: (this.selectedAirline) ? this.selectedAirline.CarrierID : undefined,
      carrierName: (this.selectedAirline) ? this.selectedAirline.CarrierName : undefined,
      carrierImage: (this.selectedAirline) ? this.selectedAirline.CarrierImage : undefined,
      containerSpecID: null,
      customerID: null,
      price: 0,
      fromKg: 0,
      toKg: 0,
      modeOfTrans: "AIR",
      currencyID: (this.selectedCurrency.CurrencyID) ? this.selectedCurrency.CurrencyID : 101,
      currencyCode: (this.selectedCurrency.CurrencyCode) ? this.selectedCurrency.CurrencyCode : 'AED',
      effectiveFrom: (this.fromDate && this.fromDate.month) ? this.fromDate.month + '/' + this.fromDate.day + '/' + this.fromDate.year : null,
      effectiveTo: (this.toDate && this.toDate.month) ? this.toDate.month + '/' + this.toDate.day + '/' + this.toDate.year : null,
      minPrice: 0,
      providerID: this.userProfile.ProviderID,
      shippingCatID: (this.selectedCategory == 'null') ? null : this.selectedCategory,
      shippingCatName: (this.selectedCategory) ? this.getShippingName(this.selectedCategory) : undefined,
      polID: (this.filterOrigin && this.filterOrigin.PortID) ? this.filterOrigin.PortID : null,
      polName: (this.filterOrigin && this.filterOrigin.PortID) ? this.filterOrigin.PortName : null,
      polCode: (this.filterOrigin && this.filterOrigin.PortID) ? this.filterOrigin.PortCode : null,
      podID: (this.filterDestination && this.filterDestination.PortID) ? this.filterDestination.PortID : null,
      podName: (this.filterDestination && this.filterDestination.PortID) ? this.filterDestination.PortName : null,
      podCode: (this.filterDestination && this.filterDestination.PortID) ? this.filterDestination.PortCode : null,
      containerSpecShortName: null,
      objSlab: {
        draftid1: (!this.newDraftOne) ? this.selectedData.slab.draftid1 : this.newDraftOne,
        draftid2: (!this.newDraftTwo) ? this.selectedData.slab.draftid2 : this.newDraftTwo,
        draftid3: (!this.newDraftThree) ? this.selectedData.slab.draftid3 : this.newDraftThree,
        draftid4: (!this.newDraftFour) ? this.selectedData.slab.draftid4 : this.newDraftFour,
        draftid5: (!this.newDraftFive) ? this.selectedData.slab.draftid5 : this.newDraftFive,
        draftid6: (!this.newDraftSix) ? this.selectedData.slab.draftid6 : this.newDraftSix,
        slab1: this.selectedData.slab.slab1,
        price1: (this.normalPrice) ? this.normalPrice : '0.00',
        minPrice1: (this.minPrice) ? this.selectedCurrency.CurrencyCode + ' ' + this.minPrice : this.selectedCurrency.CurrencyCode + ' 0.00',
        priceWithCode1: (this.normalPrice) ? this.selectedCurrency.CurrencyCode + ' ' + this.normalPrice : this.selectedCurrency.CurrencyCode + ' 0.00',
        slab2: this.selectedData.slab.slab2,
        price2: (this.plusfortyFivePrice) ? this.plusfortyFivePrice : '0.00',
        minPrice2: (this.normalPrice) ? this.selectedCurrency.CurrencyCode + ' ' + this.normalPrice : this.selectedCurrency.CurrencyCode + ' 0.00',
        priceWithCode2: (this.plusfortyFivePrice) ? this.selectedCurrency.CurrencyCode + ' ' + this.plusfortyFivePrice : this.selectedCurrency.CurrencyCode + ' 0.00',
        slab3: this.selectedData.slab.slab3,
        price3: (this.plushundredPrice) ? this.plushundredPrice : '0.00',
        minPrice3: (this.plusfortyFivePrice) ? this.selectedCurrency.CurrencyCode + ' ' + this.plusfortyFivePrice : this.selectedCurrency.CurrencyCode + ' 0.00',
        priceWithCode3: (this.plushundredPrice) ? this.selectedCurrency.CurrencyCode + ' ' + this.plushundredPrice : this.selectedCurrency.CurrencyCode + ' 0.00',
        slab4: this.selectedData.slab.slab4,
        price4: (this.plusTwoFiftyPrice) ? this.plusTwoFiftyPrice : '0.00',
        minPrice4: (this.plushundredPrice) ? this.selectedCurrency.CurrencyCode + ' ' + this.plushundredPrice : this.selectedCurrency.CurrencyCode + ' 0.00',
        priceWithCode4: (this.plusTwoFiftyPrice) ? this.selectedCurrency.CurrencyCode + ' ' + this.plusTwoFiftyPrice : this.selectedCurrency.CurrencyCode + ' 0.00',
        slab5: this.selectedData.slab.slab5,
        price5: (this.plusFiveHundPrice) ? this.plusFiveHundPrice : '0.00',
        minPrice5: (this.plusTwoFiftyPrice) ? this.selectedCurrency.CurrencyCode + ' ' + this.plusTwoFiftyPrice : this.selectedCurrency.CurrencyCode + ' 0.00',
        priceWithCode5: (this.plusFiveHundPrice) ? this.selectedCurrency.CurrencyCode + ' ' + this.plusFiveHundPrice : this.selectedCurrency.CurrencyCode + ' 0.00',
        slab6: this.selectedData.slab.slab6,
        price6: (this.plusThousandPrice) ? this.plusThousandPrice : '0.00',
        minPrice6: (this.plusFiveHundPrice) ? this.selectedCurrency.CurrencyCode + ' ' + this.plusFiveHundPrice : this.selectedCurrency.CurrencyCode + ' 0.00',
        priceWithCode6: (this.plusThousandPrice) ? this.selectedCurrency.CurrencyCode + ' ' + this.plusThousandPrice : this.selectedCurrency.CurrencyCode + ' 0.00'
      }
    }
    this._airFreightService.saveDraftRate(obj).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        this._toast.success("Rates added successfully", "");
        this.allRatesFilledData.push(obj);
        if (type != "saveNadd") {
          let object = {
            data: this.allRatesFilledData
          };
          this.closeModal(object);
        } else {
          this.addRow();
        }
      }
    })
  }

  addRow() {
    this._airFreightService
      .addDraftRates({
        createdBy: this.userProfile.LoginID,
        providerID: this.userProfile.ProviderID,
        currencyID: 101
      })
      .subscribe((res: any) => {
        if (res.returnStatus == "Success") {
          this.newDraftOne = undefined;
          this.newDraftTwo = undefined;
          this.newDraftThree = undefined;
          this.newDraftFour = undefined;
          this.newDraftFive = undefined;
          this.newDraftSix = undefined;
          this.newProviderPricingDraftID = undefined;
          this.minPrice = undefined;
          this.normalPrice = undefined;
          this.plusfortyFivePrice = undefined;
          this.plushundredPrice = undefined;
          this.plusTwoFiftyPrice = undefined;
          this.plusFiveHundPrice = undefined;
          this.plusThousandPrice = undefined;
          this.selectedCategory = null;
          this._sharedService.draftRowAddAir.next(res.returnObject);
          this.newDraftOne = res.returnObject.slab.draftid1;
          this.newDraftTwo = res.returnObject.slab.draftid2;
          this.newDraftThree = res.returnObject.slab.draftid3;
          this.newDraftFour = res.returnObject.slab.draftid4;
          this.newDraftFive = res.returnObject.slab.draftid5;
          this.newDraftSix = res.returnObject.slab.draftid6;
          this.newProviderPricingDraftID = res.returnObject.CarrierPricingSetID;
        }
      });
  }

  numberValid(evt) {
    let charCode = evt.which ? evt.which : evt.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) return false;
    return true;
  }


  getShippingName(id) {
    return this.allCargoType.find(obj => obj.ShippingCatID == id).ShippingCatName;
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
  closePopup() {
    let object = {
      data: this.allRatesFilledData
    };
    this.closeModal(object);
  }
  closeModal(status) {
    this._sharedService.draftRowAddAir.next(null);
    this._activeModal.close(status);
    document.getElementsByTagName('html')[0].style.overflowY = 'auto';
  }

  airlines = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      map(term => (!term || term.length < 3) ? []
        : this.allAirLines.filter(v => v.CarrierName && v.CarrierName.toLowerCase().indexOf(term.toLowerCase()) > -1))
    )
  formatter = (x: { CarrierName: string }) => x.CarrierName;

  ports = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      map(term => (!term || term.length < 3) ? []
        : this.allPorts.filter(v => v.PortName && v.PortName.toLowerCase().indexOf(term.toLowerCase()) > -1))
    )
  portsFormatter = (x: { PortName: string }) => x.PortName;

  currencies = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      map(term => (!term || term.length < 3) ? []
        : this.allCurrencies.filter(v => v.CurrencyCode && v.CurrencyCode.toLowerCase().indexOf(term.toLowerCase()) > -1))
    )
  currencyFormatter = (x: { CurrencyCode: string }) => x.CurrencyCode;


}
