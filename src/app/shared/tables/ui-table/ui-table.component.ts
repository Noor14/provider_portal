import { Component, OnInit, Input, Output, OnChanges, EventEmitter, SimpleChange } from '@angular/core';
import { getImagePath, ImageSource, ImageRequiredSize, getDateDiff, changeCase } from '../../../constants/globalFunctions';
import { baseExternalAssets } from '../../../constants/base.url';
import * as moment from 'moment';
import { PaginationInstance } from 'ngx-pagination';
import { cloneObject } from '../../../components/pages/user-desk/reports/reports.component';
import { firstBy } from 'thenby';

@Component({
  selector: 'app-ui-table',
  templateUrl: './ui-table.component.html',
  styleUrls: ['./ui-table.component.scss']
})
export class UiTableComponent implements OnInit, OnChanges {
  @Input() tableData: any;
  @Input() transMode: string;
  @Input() tableType: string; //draftFCL; publishFCL
  @Input() totalRecords: number
  @Input() containerLoad: string;
  @Output() checkedRows = new EventEmitter<any>()
  @Output() sorting = new EventEmitter<any>()
  @Output() pageEvent = new EventEmitter<any>()

  public selectedSort: any = {
    title: 'Rate For',
    value: 'CustomerName',
    column: 'CustomerID'
  }
  public data: Array<any> = []
  public maxSize: number = 7;
  public directionLinks: boolean = true;
  public autoHide: boolean = false;
  public checkAllPublish: boolean = false;
  public checkAllDrafts: boolean = false;
  public LCLRecords: number;
  public FCLRecords: number;

  // pagination vars
  // public pageSize: number = 5;
  public page: number = 1
  // collectionSize = this.totalRecords

  public thList: Array<HMTableHead> = [
    { title: "", activeClass: '', sortKey: "" },
    { title: "Rate For", activeClass: '', sortKey: "CustomerName" },
    { title: "Shipping Line", activeClass: '', sortKey: "" },
    { title: "Origin/Departure", activeClass: '', sortKey: "" },
    { title: "Cargo Type", activeClass: '', sortKey: "" },
    { title: "Container", activeClass: '', sortKey: "" },
    { title: "Rate", activeClass: '', sortKey: "" },
    { title: "Rate Validity", activeClass: '', sortKey: "" },
    { title: "Import Charges", activeClass: '', sortKey: "" },
    { title: "Export Charges", activeClass: '', sortKey: "" },
  ]

  public devicPageConfig: PaginationInstance = {
    id: 'some_unq_publish',
    itemsPerPage: 5,
    currentPage: 1,
  };

  public labels: any = {
    previousLabel: '',
    nextLabel: '',
    screenReaderPaginationLabel: 'Pagination',
    screenReaderPageLabel: 'page',
    screenReaderCurrentLabel: `You're on page`
  };

  public totalCount: number;

  constructor() { }

  ngOnInit() {
    if (this.tableType === 'draftFCL') {
      this.tableData = changeCase(this.tableData, 'camel')
      this.totalCount = this.tableData.length
    } else if (this.tableType === 'publishFCL') {
      this.totalCount = this.totalRecords
    }

    if (this.containerLoad === 'LCL' && this.transMode === 'SEA') {
      this.thList = [
        { title: "", activeClass: '', sortKey: "" },
        { title: "Rate For", activeClass: '', sortKey: "CustomerName" },
        { title: "Origin/Departure", activeClass: '', sortKey: "" },
        { title: "Cargo Type", activeClass: '', sortKey: "" },
        { title: "Rate", activeClass: '', sortKey: "" },
        { title: "Rate Validity", activeClass: '', sortKey: "" },
        { title: "Import Charges", activeClass: '', sortKey: "" },
        { title: "Export Charges", activeClass: '', sortKey: "" },
      ]
    } else if ((this.containerLoad === 'FCL' || this.containerLoad === 'FTL') && this.transMode === 'TRUCK') {
      this.thList = [
        { title: "", activeClass: '', sortKey: "" },
        { title: "Origin/Departure", activeClass: '', sortKey: "" },
        { title: "Cargo Type", activeClass: '', sortKey: "" },
        { title: "Size", activeClass: '', sortKey: "" },
        { title: "Rate", activeClass: '', sortKey: "" },
        { title: "Rate Validity", activeClass: '', sortKey: "" },
        { title: "Import Charges", activeClass: '', sortKey: "" },
        { title: "Export Charges", activeClass: '', sortKey: "" },
      ]
    }
    this.data = this.tableData
    console.log(this.data);

    this.data.forEach(e => {
      if (e.jsonCustomerDetail) {
        e.parsedjsonCustomerDetail = JSON.parse(e.jsonCustomerDetail)
      }
      if (e.publishStatus) {
        e.parsedpublishStatus = JSON.parse(e.publishStatus)
        if (e.parsedpublishStatus.Status === 'PENDING') {
          e.parsedpublishStatus.printStatus = 'Unpublished'
        } else if (e.parsedpublishStatus.Status === 'POSTED') {
          e.parsedpublishStatus.printStatus = 'Published on ' + moment(e.parsedpublishStatus.PublishDate).format('MMMM Do YYYY h:mm:ss A')
        }
      }
      e.isChecked = false
      let dateDiff = getDateDiff(moment(e.effectiveTo).format("L"), moment(new Date()).format("L"), 'days', "MM-DD-YYYY")
      if (dateDiff <= 15) {
        e.dateDiff = dateDiff
      } else {
        e.dateDiff = null
      }
    })
  }

  onPageChangeBootstrap(event) {
    this.page = event;
    this.pageEvent.emit(this.page)
  }

  onHeadClick($index: number, $activeClass: string, $fieldToSort: any) {
    const cloneThList: HMTableHead[] = cloneObject(this.thList)
    let direction: number
    if ($activeClass === 'sorting_asc') {
      cloneThList[$index].activeClass = 'sorting_desc'
      direction = -1
    } else {
      cloneThList[$index].activeClass = 'sorting_asc'
      direction = 1
    }
    const thLength = cloneThList.length
    for (let index = 0; index < thLength; index++) {
      if (index !== $index) {
        cloneThList[index].activeClass = 'none_sorting_asc'
      }
    }
    this.thList = cloneThList

    this.data.sort(
      firstBy($fieldToSort, { direction })
    );
  }

  onPageChange(number: any) {
    this.devicPageConfig.currentPage = number;
  }

  getUIImage($image: string, type) {
    if (type) {
      return baseExternalAssets + "/" + $image;
    }
    return getImagePath(ImageSource.FROM_SERVER, $image, ImageRequiredSize.original)
  }

  public checkList = [];
  onCheck(type, model) {
    console.log(type, model);
    if (type === 'all') {
      if (this.tableType === 'draftFCL') {
        this.checkAllDrafts = !this.checkAllDrafts
        if (this.checkAllDrafts) {
          this.data.forEach(e => {
            if (!this.validateRow(e)) {
              e.isChecked = true
              console.log(this.containerLoad);
              if (this.containerLoad === 'FCL' && this.transMode === 'SEA') {
                this.checkList.push(e.providerPricingDraftID)
              } else if (this.containerLoad === 'LCL' && this.transMode === 'SEA') {
                this.checkList.push(e.consolidatorPricingDraftID)
              } else if (this.transMode === 'TRUCK') {
                this.checkList.push(e.id)
              }
            }
          })
        } else if (!this.checkAllDrafts) {
          this.data.forEach(e => {
            e.isChecked = false
          })
          this.checkList = []
        }
      } else if (this.tableType === 'publishFCL') {
        this.checkAllPublish = !this.checkAllPublish
        if (this.checkAllPublish) {
          this.data.forEach(e => {
            e.isChecked = true
            if (this.containerLoad === 'FCL' && this.transMode === 'SEA') {
              this.checkList.push(e.carrierPricingID)
            } else if (this.containerLoad === 'LCL' && this.transMode === 'SEA') {
              this.checkList.push(e.consolidatorPricingID)
            } else if (this.transMode === 'TRUCK') {
              this.checkList.push(e.id)
            }
          })
        } else if (!this.checkAllPublish) {
          this.data.forEach(e => {
            e.isChecked = false
          })
          this.checkList = []
        }
      }
    } else {
      if (!model.isChecked) {
        this.checkList.forEach(e => {
          if (e === type) {
            let idx = this.checkList.indexOf(e)
            this.checkList.splice(idx, 1)
          }
        })
      } else if (model.isChecked) {
        this.checkList.push(type)
      }
    }
    let obj = {
      type: this.tableType,
      list: this.checkList
    }
    this.checkedRows.emit(obj)
  }

  draftAction(row, action) {
    console.log(row, action);
    if (this.tableType === 'publishFCL')
      return;

    let obj = {}
    if (action === 'delete') {
      obj = {
        type: 'delete',
        id: ((this.transMode === 'TRUCK') ? row.id : ((this.transMode === 'SEA' && row.containerLoadType === 'FCL') ? row.providerPricingDraftID : row.consolidatorPricingDraftID)),
        load: row.containerLoadType
      }
    } else if (action === 'edit') {
      obj = {
        type: 'edit',
        id: ((this.transMode === 'TRUCK') ? row.id : ((this.transMode === 'SEA' && row.containerLoadType === 'FCL') ? row.providerPricingDraftID : row.consolidatorPricingDraftID)),
        load: row.containerLoadType
      }
    }
    this.checkList.push(obj)
    const emitObj = {
      type: this.tableType,
      list: this.checkList
    }
    this.checkedRows.emit(emitObj)
    this.checkList = []
  }

  publishAction(row, action) {
    if (this.tableType === 'draftFCL')
      return;
    let obj = {}
    if (action === 'history') {
      console.log(row);
      obj = {
        type: 'history',
        id: ((this.transMode === 'TRUCK') ? row.id : ((this.transMode === 'SEA' && this.containerLoad === 'FCL') ? row.carrierPricingID : row.consolidatorPricingID)),
        load: this.containerLoad
      }
    }
    this.checkList.push(obj)
    const emitObj = {
      type: this.tableType,
      list: this.checkList
    }
    this.checkedRows.emit(emitObj)
    this.checkList = []
  }

  validateRow(row) {
    if (this.containerLoad === 'FCL' && this.transMode === 'SEA') {
      if (!row.polID ||
        !row.podID ||
        !row.price ||
        !row.totalExportCharges ||
        !row.totalImportCharges ||
        !row.shippingCatID ||
        !row.effectiveFrom ||
        !row.effectiveTo ||
        !row.containerSpecID ||
        !row.carrierID
      ) {
        return true;
      } else {
        return false;
      }
    } else if (this.containerLoad === 'LCL' && this.transMode === 'SEA') {
      if (!row.polID ||
        !row.podID ||
        !row.price ||
        !row.totalExportCharges ||
        !row.totalImportCharges ||
        !row.effectiveFrom ||
        !row.effectiveTo
      ) {
        return true;
      } else {
        return false;
      }
    } else if (this.transMode === 'TRUCK') {
      if (!row.polID ||
        !row.podID ||
        !row.price ||
        !row.effectiveFrom ||
        !row.effectiveTo
      ) {
        return true;
      } else {
        return false;
      }
    }
  }

  onSortClick(value, title, column) {
    this.selectedSort = {
      title: title,
      value: value,
      column: column
    }
    let sortObj = {
      direction: 'ASC',
      column: column
    }
    this.sorting.emit(sortObj)
  }

  ngOnChanges(changes) {
    console.log(changes);
    if (changes.totalRecords) {
      if (this.tableType === 'draftFCL') {
        this.totalCount = this.tableData.length
      } else if (this.tableType === 'publishFCL') {
        this.totalCount = changes.totalRecords.currentValue
      }
      // this.page = 1
      // this.onPageChangeBootstrap(1)
    }

    if (changes.hasOwnProperty('containerLoad')) {
      if (changes.containerLoad) {
        this.containerLoad = changes.containerLoad.currentValue
      }
    }

    if (changes.tableData) {
      console.log(changes.tableData);
      this.data = changeCase(changes.tableData.currentValue, 'camel')
      this.checkAllPublish = false;
      this.data.forEach(e => {
        if (e.jsonCustomerDetail) {
          e.parsedjsonCustomerDetail = JSON.parse(e.jsonCustomerDetail)
        }
        if (e.publishStatus) {
          e.parsedpublishStatus = JSON.parse(e.publishStatus)
          if (e.parsedpublishStatus.Status === 'PENDING') {
            e.parsedpublishStatus.printStatus = 'Unpublished'
          } else if (e.parsedpublishStatus.Status === 'POSTED') {
            e.parsedpublishStatus.printStatus = 'Published on ' + moment(e.parsedpublishStatus.PublishDate).format('MM/DD/YYYY h:mm:ss A')
          }
        }
        e.isChecked = false
        let dateDiff = getDateDiff(moment(e.effectiveTo).format("L"), moment(new Date()).format("L"), 'days', "MM-DD-YYYY")
        if (dateDiff <= 15) {
          e.dateDiff = dateDiff
        } else {
          e.dateDiff = null
        }
      })
      if (!changes.tableData.previousValue || !changes.tableData.currentValue || !changes.tableData.currentValue.length || !changes.tableData.previousValue.length) {
        this.onPageChangeBootstrap(1)
      }
    }
    this.checkList = []
  }
}

export interface HMTableHead {
  title: string;
  activeClass: string;
  sortKey: string;
}
