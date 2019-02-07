import { Component, OnInit, ElementRef, ViewChild, Renderer2, ViewEncapsulation, Input } from '@angular/core';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import {
NgbDatepicker,
NgbInputDatepicker,
NgbDateStruct,
NgbCalendar,
NgbDateAdapter,
NgbDateParserFormatter,
NgbModal
} from '@ng-bootstrap/ng-bootstrap';
import { NgbDateFRParserFormatter } from '../../../constants/ngb-date-parser-formatter';
import { PlatformLocation } from '@angular/common';
import { SeaFreightService } from '../../../components/pages/user-desk/manage-rates/sea-freight/sea-freight.service';
import { SharedService } from '../../../services/shared.service';
import { Observable, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';


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
selector: 'app-rate-validity',
templateUrl: './rate-validity.component.html',
encapsulation: ViewEncapsulation.None,
providers: [{ provide: NgbDateParserFormatter, useClass: NgbDateFRParserFormatter }],
styleUrls: ['./rate-validity.component.scss']
})
export class RateValidityComponent implements OnInit {

@Input() validityData: any;
@ViewChild("dp") input: NgbInputDatepicker;
@ViewChild('rangeDp') rangeDp: ElementRef;

private allCurrencies:any[]=[]
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
private userProfile: any;
public price;
public selectedCurrency: any;
isHovered = date =>
this.fromDate && !this.toDate && this.hoveredDate && after(date, this.fromDate) && before(date, this.hoveredDate)
isInside = date => after(date, this.fromDate) && before(date, this.toDate);
isFrom = date => equals(date, this.fromDate);
isTo = date => equals(date, this.toDate);

constructor(
calendar: NgbCalendar,
private location: PlatformLocation,
private _activeModal: NgbActiveModal,
private _parserFormatter: NgbDateParserFormatter,
private renderer: Renderer2,
private _seaFreightService: SeaFreightService,
private _sharedService: SharedService

) { location.onPopState(() => this.closeModal(null)); }

ngOnInit() {
let userInfo = JSON.parse(localStorage.getItem('userInfo'));
if (userInfo && userInfo.returnText) {
this.userProfile = JSON.parse(userInfo.returnText);
}
this.allservicesBySea()
}
allservicesBySea() {
this._sharedService.dataLogisticServiceBySea.subscribe(state => {
if (state && state.length) {
for (let index = 0; index < state.length; index++) {
if (state[index].LogServName == "SEA") {
this.allCurrencies = state[index].DropDownValues.UserCurrency;
if (this.allCurrencies.length && this.validityData && this.validityData.data && this.validityData.data.length && this.validityData.data.length==1){
this.setData()
}
}
}
}
})
}
setData(){
let parsed = '';
this.selectedCurrency = this.allCurrencies.find(obj => obj.currencyID == this.validityData.data[0].currencyID)
this.price = this.validityData.data[0].price;
if (this.validityData.data[0].effectiveFrom) {
this.fromDate.day = new Date(this.validityData.data[0].effectiveFrom).getDate();
this.fromDate.year = new Date(this.validityData.data[0].effectiveFrom).getFullYear();
this.fromDate.month = new Date(this.validityData.data[0].effectiveFrom).getMonth() + 1;
}
if (this.validityData.data[0].effectiveTo) {
this.toDate.day = new Date(this.validityData.data[0].effectiveTo).getDate();
this.toDate.year = new Date(this.validityData.data[0].effectiveTo).getFullYear();
this.toDate.month = new Date(this.validityData.data[0].effectiveTo).getMonth() + 1;
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
this.closeModal(null);
}
closeModal(status) {
this._activeModal.close(status);
document.getElementsByTagName('html')[0].style.overflowY = 'auto';
}

numberValid(evt) {
let charCode = evt.which ? evt.which : evt.keyCode;
if (charCode > 31 && (charCode < 48 || charCode > 57)) return false;
return true;
}
updateRates(){
let rateData = [];
if (this.validityData && this.validityData.data && this.validityData.data.length){
this.validityData.data.forEach(element => {
rateData.push(
{
carrierPricingID: element.carrierPricingID,
rate: this.price,
effectiveFrom: (this.fromDate && this.fromDate.month) ? this.fromDate.month + '/' + this.fromDate.day + '/' + this.fromDate.year : null,
effectiveTo: (this.toDate && this.toDate.month) ? this.toDate.month + '/' + this.toDate.day + '/' + this.toDate.year : null,
modifiedBy: this.userProfile.LoginID
}
)
});
}

this._seaFreightService.rateValidityFCL(rateData).subscribe((res:any)=>{
if (res.returnStatus == "Success") {
this.closeModal(res.returnStatus);
}
})
}

currencies = (text$: Observable<string>) =>
text$.pipe(
debounceTime(200),
map(term => (!term || term.length < 3) ? []
: this.allCurrencies.filter(v => v.CurrencyCode && v.CurrencyCode.toLowerCase().indexOf(term.toLowerCase()) > -1))
)
currencyFormatter = (x: { CurrencyCode: string }) => x.CurrencyCode;

}