import { Component, OnInit, ElementRef, ViewChild, Renderer2, ViewEncapsulation } from '@angular/core';
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

  @ViewChild("dp") input: NgbInputDatepicker;
  @ViewChild('rangeDp') rangeDp: ElementRef;
  public startDate: NgbDateStruct;
  public maxDate: NgbDateStruct;
  public minDate: NgbDateStruct;
  public hoveredDate: NgbDateStruct;
  public fromDate: any;
  public toDate: any;
  public model: any;




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

    ) { }

  ngOnInit() {
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
      data: []
    };
    this.closeModal(object);
  }
  closeModal(status) {
    this._activeModal.close(status);
    document.getElementsByTagName('html')[0].style.overflowY = 'auto';
  }
}
