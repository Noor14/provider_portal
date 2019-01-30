import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import * as echarts from 'echarts'
import * as moment from 'moment';

@Component({
  selector: 'app-billing',
  templateUrl: './billing.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./billing.component.scss']
})
export class BillingComponent implements OnInit {


  @ViewChild('billing') tablebillingByInvoice;
  private dtOptionsByBilling: DataTables.Settings | any = {};
  private dataTableBybilling: any;
  private inVoiceList : any[] = [];

  public statistics = {
    // title: {
    //   text: '某地区蒸发量和降水量',
    //   subtext: '纯属虚构'
    // },
    tooltip: {
      trigger: 'axis'
    },
    // legend: {
    //   data: ['蒸发量', '降水量']
    // },
    toolbox: {
      show: true,
      feature: {
        dataView: { show: true, readOnly: false },
        magicType: { show: true, type: ['line', 'bar'] },
        restore: { show: true },
        saveAsImage: { show: true }
      }
    },
    calculable: true,
    xAxis: [
      {
        type: 'category',
        data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
      }
    ],
    yAxis: [
      {
        type: 'value'
      }
    ],
    series: [
      {
        // name: '蒸发量',
        type: 'bar',
        data: [2.0, 4.9, 7.0, 23.2, 25.6, 76.7, 135.6, 162.2, 32.6, 20.0, 6.4, 3.3],
        // markPoint: {
        //   data: [
        //     { type: 'max', name: '最大值' },
        //     { type: 'min', name: '最小值' }
        //   ]
        // },
        // markLine: {
        //   data: [
        //     { type: 'average', name: '平均值' }
        //   ]
        // }
      },
      {
        // name: '降水量',
        type: 'bar',
        data: [2.6, 5.9, 9.0, 26.4, 28.7, 70.7, 175.6, 182.2, 48.7, 18.8, 6.0, 2.3],
        // markPoint: {
        //   data: [
        //     { name: '年最高', value: 182.2, xAxis: 7, yAxis: 183 },
        //     { name: '年最低', value: 2.3, xAxis: 11, yAxis: 3 }
        //   ]
        // },
        // markLine: {
        //   data: [
        //     { type: 'average', name: '平均值' }
        //   ]
        // }
      }
    ]
  };

  private statisticsRate: any[] = [];
  constructor() { }

  ngOnInit() {
    this.inVoiceList = [
      {
      id :1,
      invoice_no: "HM123456",
      invoice_desc: "Satement of 26 Jan 2016",
      invoice_issueDate: "Jan 1, 2016",
      invoice_dueDate: "Jan 31, 2016",
      invoice_bill: "AED 12,500",
      invoice_paidAmount: "AED 10,500",
    },
          {
        id: 2,
        invoice_no: "HM123456567",
        invoice_desc: "Satement of 23 Jan 2016",
        invoice_issueDate: "Jan 1, 2015",
        invoice_dueDate: "Jan 2, 2016",
        invoice_bill: "AED 12,900",
        invoice_paidAmount: "AED 15,500",
      },
            {
        id: 3,
        invoice_no: "HM123459900",
        invoice_desc: "Satement of 12 Jan 2016",
        invoice_issueDate: "Jan 18, 2016",
        invoice_dueDate: "Jan 30, 2016",
        invoice_bill: "AED 9,500",
        invoice_paidAmount: "AED 9,500",
      }
  ]
    this.statisticsRate = [
      { month: 'Jan', statRate: 15 },
      { month: 'Feb', statRate: 25 },
      { month: 'Mar', statRate: 35 },
      { month: 'Apr', statRate: 45 },
      { month: 'May', statRate: 15 },
      {month:'Jun' , statRate:55 },
      { month: 'Jul', statRate: 65 },
      { month: 'Aug', statRate: 75 },
      { month: 'Sep', statRate: 85 },
      { month: 'Oct', statRate: 95 },
      { month: 'Nov', statRate: 105 },
      { month: 'Dec', statRate: 115 },
     ]
  
  this.generateInvoiceTable();
  }
  generateInvoiceTable() {
    this.dtOptionsByBilling = {
      data: this.inVoiceList,
      columns: [
        {
          title: 'INVOICE NO',
          data: function (data) {
            return data.invoice_no
          }
        },
        {
          title: 'DESCRIPTION',
          data: function (data) {
            return data.invoice_desc
          },
        },
        {
          title: 'ISSUED ON',
          data: function (data) {
            return data.invoice_issueDate
          },
        },
        {
          title: 'DUE ON',
          data: function (data) {
            return data.invoice_dueDate
          },
        },
        {
          title: 'BILLED',
          data: function (data) {
            return data.invoice_bill
          },
        },
        {
          title: 'PAID',
          data: function (data) {
            return data.invoice_paidAmount
          },
        },
        {
          title: '',
          data: function (data) {
            let url = '../../../../../../assets/images/icons/menu.svg';
            return "<img src='" + url + "' class='icon-size-16' />";
          },
          className: 'moreOption'
        }
      ],
      drawCallback: function () {
        let $api = this.api();
        let pages = $api.page.info().pages;
        if (pages === 1 || !pages) {
          $('.billingInvoices .dataTables_paginate').hide();
        } else {
          $('.billingInvoices .dataTables_paginate').show();
        }
      },
      destroy: true,
      pageLength: 5,
      scrollY: '60vh',
      scrollCollapse: true,
      searching: false,
      lengthChange: false,
      responsive: true,
      ordering: false,
      language: {
        paginate: {
          next: '<img src="../../../../../../assets/images/icons/icon_arrow_right.svg" class="icon-size-16">',
          previous: '<img src="../../../../../../assets/images/icons/icon_arrow_left.svg" class="icon-size-16">'
        }
      },
      columnDefs: [
        {
          targets: 1,
          width: '235'
        },
        {
          targets: -1,
          width: '12',
          orderable: false,
        },
        {
          targets: "_all",
          width: "150"
        }
      ]
    };
    this.setdataInTable();
  }

  setdataInTable() {
    setTimeout(() => {
      if (this.tablebillingByInvoice && this.tablebillingByInvoice.nativeElement) {
        this.dataTableBybilling = $(this.tablebillingByInvoice.nativeElement);
        let alltableOption = this.dataTableBybilling.DataTable(this.dtOptionsByBilling);
      }
    }, 0);
  }

}
