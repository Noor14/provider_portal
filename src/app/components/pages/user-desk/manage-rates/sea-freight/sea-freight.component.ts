import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit, ViewEncapsulation, ElementRef, Renderer2 } from '@angular/core';
import {
  NgbDatepicker,
  NgbInputDatepicker,
  NgbDateStruct,
  NgbCalendar,
  NgbDateAdapter,
  NgbDateParserFormatter,
  NgbModal,
  ModalDismissReasons
} from '@ng-bootstrap/ng-bootstrap';
import { DiscardDraftComponent } from '../../../../../shared/dialogues/discard-draft/discard-draft.component';
import { Observable, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { SeaFreightService } from './sea-freight.service';
import { getJwtToken } from '../../../../../services/jwt.injectable';
import { SharedService } from '../../../../../services/shared.service';
// import { NgModel } from '@angular/forms';
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
  styleUrls: ['./sea-freight.component.scss']
})
export class SeaFreightComponent implements OnInit {

  public dtOptions: DataTables.Settings | any = {};
  @ViewChild('dataTable') table;
  @ViewChild("d") input: NgbInputDatepicker;
  // @ViewChild(NgModel) datePick: NgModel;
  @ViewChild('myRangeInput') myRangeInput: ElementRef;
  public dataTable: any;
  public allRatesList: any;
  public loading: boolean;
  public allShippingLines: any[] = [];
  public allCargoType: any[] = []
  public allContainersType: any[] = [];
  public allPorts: any[] = [];
  public filterOrigin: any={};
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
    private _parserFormatter: NgbDateParserFormatter
  ) {

  }

  ngOnInit() {
    this.getAllPublishRates();
    this.allservicesBySea();
    this.startDate = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
    this.maxDate = { year: now.getFullYear() + 1, month: now.getMonth() + 1, day: now.getDate() };
    this.minDate = { year: now.getFullYear() - 1, month: now.getMonth() + 1, day: now.getDate() };
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

    this.renderer.setProperty(this.myRangeInput.nativeElement, 'value', parsed);
  }
  allservicesBySea() {
    this._sharedService.dataLogisticServiceBySea.subscribe(state => {
      if (state && state.length) {
        for (let index = 0; index < state.length; index++) {
          if (state[index].LogServName == "SEA") {
            this.allShippingLines = state[index].DropDownValues.ShippingLine;
            this.allCargoType = state[index].DropDownValues.Category;
            this.allContainersType = state[index].DropDownValues.Container;
            this.allPorts = state[index].DropDownValues.Port
          }
        }
      }
    })
  }
  getAllPublishRates() {
    this.loading = true;
    this._seaFreightService.getAllrates().subscribe((res: any) => {
      if (res && res.length) {
        this.allRatesList = res;
        this.loading = false;
        this.dtOptions = {
          data: this.allRatesList,
          columns: [
            {
              title: 'ID',
              data: 'id',
            },
            {
              title: 'Short Name',
              data: 'shortName',
              defaultContent: '<select><option disable>-- Select --</option> <option>One</option></select>'
            },
            {
              title: 'Title',
              data: 'title'
            },
            {
              title: 'Short Name',
              data: 'shortName',
              defaultContent: '<input placeholder="0.00" type="text" size="10"/>'
            },
            {
              title: 'Title',
              data: 'title'
            },
            {
              title: 'Short Name',
              data: 'shortName'
            },
            {
              title: 'Title',
              data: 'title'
            },
            {
              title: 'Short Name',
              data: 'shortName'
            },
            {
              title: 'Title',
              data: 'title'
            },
            {
              title: 'Short Name',
              data: 'shortName'
            },
            {
              title: 'Title',
              data: 'title'
            },
            {
              title: 'Short Name',
              data: 'shortName'
            },
            {
              title: 'Title',
              data: 'title'
            },
            {
              title: 'Short Name',
              data: 'shortName'
            },
            {
              title: 'Title',
              data: 'title'
            },
            {
              title: 'Short Name',
              data: 'shortName'
            },
            {
              title: 'Title',
              data: 'title'
            },
            {
              title: 'Short Name',
              data: 'shortName'
            },
            {
              title: 'Title',
              data: 'title'
            },
            {
              title: 'Short Name',
              data: 'shortName'
            },
            {
              title: 'Title',
              data: 'title'
            },
            {
              title: 'Short Name',
              data: 'shortName'
            },
            {
              title: 'Title',
              data: 'title'
            },
            {
              title: 'Short Name',
              data: 'shortName'
            },
            {
              title: 'Title',
              data: 'title'
            },
            {
              title: 'Short Name',
              data: 'shortName'
            },

          ],
          // processing: true,
          // serverSide: true,
          pagingType: 'full_numbers',
          pageLength: 10,
          scrollX: true,
          searching: false,
          lengthChange: false,
          responsive: true,
          language: {
            paginate: {
              next: '<img src="../../../../../../assets/images/icons/icon_arrow_right.svg" class="icon-size-16">',
              previous: '<img src="../../../../../../assets/images/icons/icon_arrow_left.svg" class="icon-size-16">'
            }
          },
          columnDefs: [
            {
              targets: 0,
              width: 'auto'
            }, {
              targets: "_all",
              width: "150"
            }
          ]
        };
        this.dataTable = $(this.table.nativeElement);
        this.dataTable.DataTable(this.dtOptions);
        // $('table').on('click', 'tbody td:not(:first-child)', function (e) {
        //   editor.inline(this);
        // });
        // var myTable = $('table').DataTable();
        // $('table').on('click', 'tbody td', function () {
        //   myTable.cell(this).edit();
        // });

      }
    })

  }

  discardDraft() {
    this.modalService.open(DiscardDraftComponent, {
      size: 'lg',
      centered: true,
      windowClass: 'small-modal',
      backdrop: 'static',
      keyboard: false
    });

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

}
