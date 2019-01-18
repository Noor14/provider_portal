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
  styleUrls: ['./air-rate-dialog.component.scss']
})
export class AirRateDialogComponent implements OnInit {

  @ViewChild("dp") input: NgbInputDatepicker;
  @ViewChild('rangeDp') rangeDp: ElementRef;
  @Input() selectedData: any;

  public allAirLines: any[] = [];
  public allCargoType: any[] = []
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
  
  public defaultCurrency:any = {
    CurrencyID: 101,
    CurrencyCode: 'AED',
  }
  public selectedCurrency: any;


  public startDate: NgbDateStruct;
  public maxDate: NgbDateStruct;
  public minDate: NgbDateStruct;
  public hoveredDate: NgbDateStruct;
  public fromDate: any = {
    day : null,
    month : undefined,
    year : undefined
  };
  public toDate: any = {
    day : undefined,
    month : undefined,
    year : undefined
  };
  public model: any;

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
    private  _airFreightService: AirFreightService

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
            if(this.selectedData){
              this.setData()
            }

          }
        }
      }
    })
  }
  setData(){
      this.selectedCategory = this.selectedData.ShippingCatID;
      this.filterOrigin = this.allPorts.find(obj => obj.PortID == this.selectedData.PolID);
      this.filterDestination = this.allPorts.find(obj => obj.PortID == this.selectedData.PodID);
      this.selectedAirline = this.allAirLines.find(obj => obj.CarrierID == this.selectedData.CarrierID);
      this.selectedCurrency = this.allCurrencies.find(obj => obj.CurrencyID == this.selectedData.CurrencyID);
      this.minPrice = this.selectedData.Price;
      this.normalPrice = this.selectedData.Price;
      this.plusfortyFivePrice = this.selectedData.Price;
      this.plushundredPrice = this.selectedData.Price;
      this.plusTwoFiftyPrice = this.selectedData.Price;
      this.plusFiveHundPrice = this.selectedData.Price;
      this.plusThousandPrice = this.selectedData.Price;
      this.fromDate.day = new Date(this.selectedData.EffectiveFrom).getDate();
      this.fromDate.year = new Date(this.selectedData.EffectiveFrom).getFullYear();
      this.fromDate.month = new Date(this.selectedData.EffectiveFrom).getMonth()+1;
      this.toDate.day = new Date(this.selectedData.EffectiveTo).getDate();
      this.toDate.year = new Date(this.selectedData.EffectiveTo).getFullYear();
      this.toDate.month = new Date(this.selectedData.EffectiveTo).getMonth()+1;
      if (!this.selectedCurrency) {
        this.selectedCurrency = this.defaultCurrency;
      }
    // this.model = this.fromDate + this.toDate;
      this.onDateSelection(this.model)

  }

  savedraftrow() {
  
    let obj = [
      {
        carrierPricingSetID: this.selectedData.CarrierPricingSetID,
        carrierID: this.selectedAirline.CarrierID,
        carrierName: this.selectedAirline.CarrierName,
        carrierImage: this.selectedAirline.CarrierImage,
        containerSpecID: null,
        price: 0,
        fromKg: 0,
        toKg: 0,
        modeOfTrans: "AIR",
        currencyID: (this.selectedCurrency.CurrencyID) ? this.selectedCurrency.CurrencyID : 101,
        currencyCode: (this.selectedCurrency.CurrencyCode) ? this.selectedCurrency.CurrencyCode : 'AED',
        effectiveFrom: this.fromDate.month + '/' + this.fromDate.day + '/' + this.fromDate.year,
        effectiveTo: this.toDate.month + '/' + this.toDate.day + '/' + this.toDate.year,
        minPrice: 0,
        providerID: this.userProfile.ProviderID,
        shippingCatID: (this.selectedCategory == 'null') ? null : this.selectedCategory,
        shippingCatName: (this.selectedCategory) ? this.getShippingName(this.selectedCategory) : undefined,
        carrierPricingDraftID: 0,
        polID: this.filterOrigin.PortID,
        polName: this.filterOrigin.PortName,
        polCode: this.filterOrigin.PortCode,
        podID: this.filterDestination.PortID,
        podName: this.filterDestination.PortName,
        podCode: this.filterDestination.PortCode,
        containerSpecShortName: null,
        objSlab: {
         slab1: "string",
          price1: "string",
          minPrice1: "string",
          priceWithCode1: "string",
          slab2: "string",
          price2: "string",
          minPrice2: "string",
          priceWithCode2: "string",
          slab3: "string",
          price3: "string",
          minPrice3: "string",
          priceWithCode3: "string",
          slab4: "string",
          price4: "string",
          minPrice4: "string",
          priceWithCode4: "string",
          slab5: "string",
          price5: "string",
          minPrice5: "string",
          priceWithCode5: "string"
        },
        slab: "string"
      }
     ]
    this. _airFreightService.saveDraftRate(obj).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        this.closeModal(obj[0]);
      }
    })
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

  closeModal(status) {
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
