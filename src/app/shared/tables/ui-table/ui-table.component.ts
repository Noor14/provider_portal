import {
  Component,
  OnInit,
  Input,
  Output,
  OnChanges,
  EventEmitter,
  SimpleChange
} from "@angular/core";
import {
  getImagePath,
  ImageSource,
  ImageRequiredSize,
  getDateDiff,
  changeCase
} from "../../../constants/globalFunctions";
import { baseExternalAssets } from "../../../constants/base.url";
import * as moment from "moment";
import { PaginationInstance } from "ngx-pagination";
import { cloneObject } from "../../../components/pages/user-desk/reports/reports.component";
import { firstBy } from "thenby";

@Component({
  selector: "app-ui-table",
  templateUrl: "./ui-table.component.html",
  styleUrls: ["./ui-table.component.scss"]
})
export class UiTableComponent implements OnInit, OnChanges {
  @Input() tableData: any;
  @Input() transMode: string;
  @Input() tableType: string; //draftFCL; publishFCL
  @Input() totalRecords: number;
  @Input() containerLoad: string;
  @Input() incomingPage: number
  @Output() checkedRows = new EventEmitter<any>();
  @Output() sorting = new EventEmitter<any>();
  @Output() pageEvent = new EventEmitter<any>();

  public selectedSort: any = {
    title: "Rate For",
    value: "CustomerName",
    column: "CustomerID"
  };
  public data: Array<any> = [];
  public maxSize: number = 7;
  public directionLinks: boolean = true;
  public autoHide: boolean = false;
  public checkAllPublish: boolean = false;
  public checkAllDrafts: boolean = false;
  public LCLRecords: number;
  public FCLRecords: number;

  // pagination vars
  // public pageSize: number = 5;
  public page: number = 1;
  // collectionSize = this.totalRecords

  public thList: Array<HMTableHead> = [
    { title: "", activeClass: "", sortKey: "" },
    { title: "Rate For", activeClass: "", sortKey: "CustomerName" },
    { title: "Shipping Line", activeClass: "", sortKey: "" },
    { title: "Origin/Destination", activeClass: "", sortKey: "" },
    { title: "Cargo Type", activeClass: "", sortKey: "" },
    { title: "Container", activeClass: "", sortKey: "" },
    { title: "Rate", activeClass: "", sortKey: "" },
    { title: "Rate Validity", activeClass: "", sortKey: "" },
    { title: "Import Charges", activeClass: "", sortKey: "" },
    { title: "Export Charges", activeClass: "", sortKey: "" }
  ];

  public devicPageConfig: PaginationInstance = {
    id: "some_unq_publish",
    itemsPerPage: 5,
    currentPage: 1
  };

  public labels: any = {
    previousLabel: "",
    nextLabel: "",
    screenReaderPaginationLabel: "Pagination",
    screenReaderPageLabel: "page",
    screenReaderCurrentLabel: `You're on page`
  };

  public totalCount: number;

  constructor() { }

  ngOnInit() {
    if (this.tableType === "draftFCL") {
      this.tableData = changeCase(this.tableData, "camel");
      this.totalCount = this.tableData.length;
    } else if (this.tableType === "publishFCL") {
      this.totalCount = this.totalRecords;
      if (this.incomingPage) {
        this.page = this.incomingPage
      }
    }
    this.data = this.tableData;
    this.generateTableHeaders();
    this.setPublishedRatesStatus();
  }

  /**
   * [GENERATE TABLE HEADERS]
   * @param  event [description]
   * @return       [description]
   */
  generateTableHeaders() {
    if (this.containerLoad === "LCL" && this.transMode === "SEA") {
      this.thList = [
        { title: "", activeClass: "", sortKey: "" },
        { title: "Rate For", activeClass: "", sortKey: "CustomerName" },
        { title: "Origin/Destination", activeClass: "", sortKey: "" },
        { title: "Cargo Type", activeClass: "", sortKey: "" },
        { title: "Rate", activeClass: "", sortKey: "" },
        { title: "Rate Validity", activeClass: "", sortKey: "" },
        { title: "Import Charges", activeClass: "", sortKey: "" },
        { title: "Export Charges", activeClass: "", sortKey: "" }
      ];
    } else if (
      (this.containerLoad === "FCL" || this.containerLoad === "FTL") &&
      this.transMode === "GROUND"
    ) {
      this.thList = [
        { title: "", activeClass: "", sortKey: "" },
        { title: "Rate for", activeClass: "", sortKey: "" },
        { title: "Origin/Destination", activeClass: "", sortKey: "" },
        { title: "Cargo Type", activeClass: "", sortKey: "" },
        { title: "Size", activeClass: "", sortKey: "" },
        { title: "Rate", activeClass: "", sortKey: "" },
        { title: "Rate Validity", activeClass: "", sortKey: "" },
        { title: "Import Charges", activeClass: "", sortKey: "" },
        { title: "Export Charges", activeClass: "", sortKey: "" }
      ];
    } else if (
      this.containerLoad === "WAREHOUSE" &&
      this.transMode === "WAREHOUSE"
    ) {
      let title1 = "";
      let title2 = "";
      if (this.data.length) {
        title1 =
          this.data[0].usageType === "SHARED"
            ? "Rate / CBM / Day"
            : "Rent Per Month";
        title2 =
          this.data[0].usageType === "SHARED"
            ? "Rate / SQFT / Day"
            : "Rent Per Year";
      }
      if (this.data[0].usageType === "SHARED") {
        this.thList = [
          { title: "", activeClass: "", sortKey: "" },
          { title: "Rate for", activeClass: "", sortKey: "" },
          { title: "Warehouse Type", activeClass: "", sortKey: "" },
          { title: "Rate Validity", activeClass: "", sortKey: "" },
          { title: title1, activeClass: "", sortKey: "" },
          { title: title2, activeClass: "", sortKey: "" },
          { title: "Addtional CHarges", activeClass: "", sortKey: "" }
        ];
      } else {
        this.thList = [
          { title: "", activeClass: "", sortKey: "" },
          { title: "Rate for", activeClass: "", sortKey: "" },
          { title: "Warehouse Type", activeClass: "", sortKey: "" },
          { title: "Rate Validity", activeClass: "", sortKey: "" },
          { title: title1, activeClass: "", sortKey: "" },
          { title: title2, activeClass: "", sortKey: "" }
        ];
      }
    }
  }

  /**
   * [SET STATUS FOR PUBLISHED RECORD]
   * @return [description]
   */
  setPublishedRatesStatus() {
    this.data.forEach(e => {
      if (e.jsonCustomerDetail) {
        e.parsedjsonCustomerDetail = JSON.parse(e.jsonCustomerDetail);
      }
      if (e.publishStatus) {
        e.parsedpublishStatus = JSON.parse(e.publishStatus);
        if (e.parsedpublishStatus.Status === "PENDING") {
          e.parsedpublishStatus.printStatus = "Unpublished";
        } else if (e.parsedpublishStatus.Status === "POSTED") {
          e.parsedpublishStatus.printStatus =
            "Published on " +
            moment(e.parsedpublishStatus.PublishDate).format("L h:mm:ss A");
        }
      }
      e.isChecked = false;
      let dateDiff = getDateDiff(
        moment(e.effectiveTo).format("L"),
        moment(new Date()).format("L"),
        "days",
        "MM-DD-YYYY"
      );
      if (dateDiff <= 15) {
        e.dateDiff = dateDiff;
      } else {
        e.dateDiff = null;
      }
    });
  }

  /**
   * [ON DRAFTS GRID PAGE CHANGE ACTION]
   * @param  {number} event [page number]
   * @return       [description]
   */
  onPageChangeBootstrap(event) {
    if (this.transMode === "WAREHOUSE") {
      let obj = {
        page: event,
        whid: this.tableData[0].whid
      };
      this.pageEvent.emit(obj);
    } else {
      this.page = event;
      this.pageEvent.emit(this.page);
    }
  }

  onHeadClick($index: number, $activeClass: string, $fieldToSort: any) {
    const cloneThList: HMTableHead[] = cloneObject(this.thList);
    let direction: number;
    if ($activeClass === "sorting_asc") {
      cloneThList[$index].activeClass = "sorting_desc";
      direction = -1;
    } else {
      cloneThList[$index].activeClass = "sorting_asc";
      direction = 1;
    }
    const thLength = cloneThList.length;
    for (let index = 0; index < thLength; index++) {
      if (index !== $index) {
        cloneThList[index].activeClass = "none_sorting_asc";
      }
    }
    this.thList = cloneThList;

    this.data.sort(firstBy($fieldToSort, { direction }));
  }

  /**
   * [On Published Grid Page Change Action]
   * @param  {number} number [page number]
   * @return        [description]
   */
  onPageChange(number: any) {
    this.devicPageConfig.currentPage = number;
  }

  /**
   * [Get UI image path from server]
   * @param  $image [description]
   * @param  type   [description]
   * @return        [description]
   */
  getUIImage($image: string, type) {
    if (type) {
      return baseExternalAssets + "/" + $image;
    }
    return getImagePath(
      ImageSource.FROM_SERVER,
      $image,
      ImageRequiredSize.original
    );
  }

  public checkList = [];
  /**
   * [ACTION ON CHECKBOX SELECTION IN TABLE]
   * @param  {string} type [all/ row id]
   * @param  {object} model [selected row]
   * @return       [description]
   */
  onCheck(type, model) {
    if (type === "all") {
      if (this.tableType === "draftFCL") {
        this.checkAllDrafts = !this.checkAllDrafts;
        if (this.checkAllDrafts) {
          this.data.forEach(e => {
            if (!this.validateRow(e)) {
              e.isChecked = true;
              if (this.containerLoad === "FCL" && this.transMode === "SEA") {
                this.checkList.push(e.providerPricingDraftID);
              } else if (
                this.containerLoad === "LCL" &&
                this.transMode === "SEA"
              ) {
                this.checkList.push(e.consolidatorPricingDraftID);
              } else if (this.transMode === "GROUND") {
                this.checkList.push(e.id);
              }
            }
          });
        } else if (!this.checkAllDrafts) {
          this.data.forEach(e => {
            e.isChecked = false;
          });
          this.checkList = [];
        }
      } else if (this.tableType === "publishFCL") {
        this.checkAllPublish = !this.checkAllPublish;
        if (this.checkAllPublish) {
          this.data.forEach(e => {
            e.isChecked = true;
            if (this.containerLoad === "FCL" && this.transMode === "SEA") {
              this.checkList.push(e.carrierPricingID);
            } else if (
              this.containerLoad === "LCL" &&
              this.transMode === "SEA"
            ) {
              this.checkList.push(e.consolidatorPricingID);
            } else if (this.transMode === "GROUND") {
              this.checkList.push(e.id);
            } else if (this.transMode === "WAREHOUSE") {
              this.checkList.push(e.whPricingID);
            }
          });
        } else if (!this.checkAllPublish) {
          this.data.forEach(e => {
            e.isChecked = false;
          });
          this.checkList = [];
        }
      }
    } else {
      if (!model.isChecked) {
        this.checkList.forEach(e => {
          if (e === type) {
            let idx = this.checkList.indexOf(e);
            this.checkList.splice(idx, 1);
          }
        });
      } else if (model.isChecked) {
        this.checkList.push(type);
      }
    }
    let obj = {
      type: this.tableType,
      list: this.checkList
    };
    this.checkedRows.emit(obj);
  }

  /**
   * [Action on Draft Grid Row]
   * @param  {object} row [selected table row]
   * @param  action [delete/edit]
   * @return        [description]
   */
  draftAction(row, action) {
    if (this.tableType === "publishFCL") return;

    let obj = {};
    if (action === "delete") {
      obj = {
        type: "delete",
        id:
          this.transMode === "GROUND"
            ? row.id
            : this.transMode === "SEA" && row.containerLoadType === "FCL"
              ? row.providerPricingDraftID
              : row.consolidatorPricingDraftID,
        load: row.containerLoadType
      };
    } else if (action === "edit") {
      obj = {
        type: "edit",
        id:
          this.transMode === "GROUND"
            ? row.id
            : this.transMode === "SEA" && row.containerLoadType === "FCL"
              ? row.providerPricingDraftID
              : row.consolidatorPricingDraftID,
        load: row.containerLoadType
      };
    }
    this.checkList.push(obj);
    const emitObj = {
      type: this.tableType,
      list: this.checkList
    };
    this.checkedRows.emit(emitObj);
    this.checkList = [];
  }

  /**
   * [Action on Publish Grid Row]
   * @param  {object} row [selected table row]
   * @param  {string} action [history]
   * @return        [description]
   */
  publishAction(row, action) {
    if (this.tableType === "draftFCL") return;
    let obj = {};
    if (action === "history") {
      obj = {
        type: "history",
        id:
          this.transMode === "GROUND"
            ? row.id
            : this.transMode === "SEA" && this.containerLoad === "FCL"
              ? row.carrierPricingID
              : row.consolidatorPricingID,
        load: this.containerLoad
      };
    }
    this.checkList.push(obj);
    const emitObj = {
      type: this.tableType,
      list: this.checkList
    };
    this.checkedRows.emit(emitObj);
    this.checkList = [];
  }

  /**
   * [Validation on row selection via checkboxes]
   * @param {object} row [table row]
   * @return     [description]
   */
  validateRow(row) {
    if (this.containerLoad === "FCL" && this.transMode === "SEA") {
      if (
        !row.polID ||
        !row.podID ||
        !row.price ||
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
    } else if (this.containerLoad === "LCL" && this.transMode === "SEA") {
      if (
        !row.polID ||
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
    } else if (this.transMode === "GROUND") {
      if (
        !row.polID ||
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

  /**
   * [Sorting dropdown selection]
   * @param  value  [string]
   * @param  title  [string]
   * @param  column [number]
   * @return        [description]
   */
  onSortClick(value, title, column) {
    this.selectedSort = {
      title: title,
      value: value,
      column: column
    };
    let sortObj = {
      direction: "ASC",
      column: column
    };
    this.sorting.emit(sortObj);
  }

  /**
   * [Change Detedction of Input in the Component]
   * @param  changes [object]
   * @return         [description]
   */
  ngOnChanges(changes) {
    console.log(changes);
    if (changes.totalRecords) {
      if (this.tableType === "draftFCL") {
        this.totalCount = this.tableData.length;
      } else if (this.tableType === "publishFCL") {
        this.totalCount = changes.totalRecords.currentValue;
      }
    }

    if (changes.incomingPage) {
      this.page = this.incomingPage
    }

    if (changes.hasOwnProperty("containerLoad")) {
      if (changes.containerLoad) {
        this.containerLoad = changes.containerLoad.currentValue;
      }
    }

    if (changes.tableData) {
      this.data = changeCase(changes.tableData.currentValue, "camel");
      this.data.forEach(e => {
        if (e.jsonCustomerDetail) {
          e.parsedjsonCustomerDetail = JSON.parse(e.jsonCustomerDetail);
        }
        if (e.publishStatus) {
          e.parsedpublishStatus = JSON.parse(e.publishStatus);
          if (e.parsedpublishStatus.Status === "PENDING") {
            e.parsedpublishStatus.printStatus = "Unpublished";
          } else if (e.parsedpublishStatus.Status === "POSTED") {
            e.parsedpublishStatus.printStatus =
              "Published on " +
              moment(e.parsedpublishStatus.PublishDate).format(
                "MM/DD/YYYY h:mm:ss A"
              );
          }
        }
        e.isChecked = this.checkAllPublish ? true : false;
        if (this.containerLoad === "FCL" && this.transMode === "SEA") {
          this.checkList.push(e.carrierPricingID);
        } else if (this.containerLoad === "LCL" && this.transMode === "SEA") {
          this.checkList.push(e.consolidatorPricingID);
        } else if (this.transMode === "GROUND") {
          this.checkList.push(e.id);
        } else if (this.transMode === "WAREHOUSE") {
          this.checkList.push(e.whPricingID);
        }
        let dateDiff = getDateDiff(
          moment(e.effectiveTo).format("L"),
          moment(new Date()).format("L"),
          "days",
          "MM-DD-YYYY"
        );
        if (dateDiff <= 15) {
          e.dateDiff = dateDiff;
        } else {
          e.dateDiff = null;
        }
      });
      console.log(this.data);

      if (this.data.length && this.data[0].usageType) {
        this.generateTableHeaders();
      }
    }
    this.checkList = [];
  }
}

export interface HMTableHead {
  title: string;
  activeClass: string;
  sortKey: string;
}
