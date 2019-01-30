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
    color: ['#02bdb6', '#8472d5'],
    title: {
      text: 'Statistics',
      // subtext: 'Bar Stats'
      textStyle: {
        color: '#000000',
        fontFamily: 'Proxima Nova, sans-serif',
        //fontStyle: 'italic',
        fontWeight: 'normal'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      backgroundColor: ['rgba(255,255,255,1)'],
      padding: [20, 24],
      extraCssText: 'box-shadow: 0px 2px 20px 0px rgba(0, 0, 0, 0.2);',
      textStyle: {
        color: '#2b2b2b',
        decoration: 'none',
        fontFamily: 'Proxima Nova, sans-serif',
        fontSize: 16,
        //fontStyle: 'italic',
        //fontWeight: 'bold'
      }
    },
    legend: {
      data: ['BILLED', 'PAID']
    },
    grid: {
      left: '0%',
      right: '0%',
      bottom: '0%',
      containLabel: true
    },
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
        data: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
      }
    ],
    yAxis: [
      {
        type: 'value'
      }
    ],
    series: [
      {
        name: 'BILLED',
        type: 'bar',
        data: [2.0, 4.9, 7.0, 23.2, 25.6, 76.7, 135.6, 162.2, 32.6, 20.0, 6.4, 3.3],
        barWidth: '10%',
        barGap: 0.1,
        itemStyle: {
          normal: {
            barBorderRadius: 15,
          }}
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
        name: 'PAID',
        type: 'bar',
        barWidth: '10%',
        barGap: 0.1,
        itemStyle: {
          normal: {
            barBorderRadius: 15,
          }
        },
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

  private statisticsData: any[] = []
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
    this.statisticsData = [
      { month: 'Jan', statData: 15 },
      { month: 'Feb', statData: 25 },
      { month: 'Mar', statData: 35 },
      { month: 'Apr', statData: 45 },
      { month: 'May', statData: 15 },
      {month:'Jun' , statData:55 },
      { month: 'Jul', statData: 65 },
      { month: 'Aug', statData: 75 },
      { month: 'Sep', statData: 85 },
      { month: 'Oct', statData: 95 },
      { month: 'Nov', statData: 105 },
      { month: 'Dec', statData: 115 },
    
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
