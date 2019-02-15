import { Component, OnInit, ViewChild, ViewEncapsulation, ElementRef, OnDestroy } from '@angular/core';
import * as echarts from 'echarts'
import * as moment from 'moment';
import { DashboardService } from '../dashboard/dashboard.service';
import { HttpErrorResponse } from '@angular/common/http';
import { JsonResponse } from '../../../../interfaces/JsonResponse';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from '../../../../services/common.service';
import { UserInfo, ProviderBillingDashboard, ProviderBillingDashboardInvoice, GraphStatistic, CodeValMst } from '../../../../interfaces/billing.interface';
import { ExchangeRate, Rate, CurrencyDetails, SelectedCurrency } from '../../../../interfaces/currency.interface';
import { CurrencyControl } from '../../../../services/currency.service';
import { firstBy } from 'thenby';
import { applyRoundByDecimal, cloneObject, extractColumn, removeDuplicates } from '../reports/reports.component';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { BillingService } from './billing.service';
@Component({
  selector: 'app-billing',
  templateUrl: './billing.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./billing.component.scss']
})
export class BillingComponent implements OnInit, OnDestroy {


  @ViewChild('billing') tablebillingByInvoice: ElementRef;
  @ViewChild(DataTableDirective) datatableElement: DataTableDirective;


  dtTrigger = new Subject();
  public userProfile: UserInfo
  public selectedCat: string = 'All'
  dtOptionsByBilling2: DataTables.Settings = {
    destroy: true,
    pageLength: 5,
    scrollY: '60vh',
    scrollCollapse: true,
    searching: true,
    lengthChange: false,
    responsive: true,
    ordering: true,
    language: {
      paginate: {
        next: '<img src="../../../../../../assets/images/icons/icon_arrow_right.svg" class="icon-size-16">',
        last: '<img src="../../../../../../assets/images/icons/icon_arrow_right.svg" class="icon-size-16">',
        previous: '<img src="../../../../../../assets/images/icons/icon_arrow_left.svg" class="icon-size-16">',
        first: '<img src="../../../../../../assets/images/icons/icon_arrow_left.svg" class="icon-size-16">'
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


  public statistics: any = {
    color: [],
    // title: {
    //   text: 'Statistics',
    //   subtext: 'Bar Stats'
    // },
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
      data: []
    },
    grid: {
      left: '0%',
      right: '0%',
      bottom: '0%',
      containLabel: true
    },
    toolbox: {
      show: false,
      feature: {
        dataView: { show: false, readOnly: false },
        magicType: {
          show: true,
          title: {
            line: 'Change to Line',
            bar: 'Change to BarGraphh'
          },
          type: ['line', 'bar']
        },
        restore: {
          show: true,
          title: 'Restore',
        },
        saveAsImage: {
          show: true,
          title: 'Download',
        }
      }
    },
    calculable: true,
    xAxis: [
      {
        type: 'category',
        data: []
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
        data: [],
        barWidth: '10%',
        barGap: 0.1,
        itemStyle: {
          normal: {
            barBorderRadius: 15,
          }
        }
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
        data: [],
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

  public emptybar = {
    color: ['#02bdb6', '#8472d5'],
    tooltip: {
      trigger: 'axis',
      // formatter: '{b} <br> {c} ({d}%)',
      axisPointer: {
        type: 'shadow'
      },
      backgroundColor: ['rgba(255,255,255,1)'],
      padding: [20, 24],
      extraCssText: 'box-shadow: 0px 2px 20px 0px rgba(0, 0, 0, 0.2);',
      textStyle: {
        color: '#2b2b2b', //#738593
        decoration: 'none',
        fontFamily: 'Proxima Nova, sans-serif',
        fontSize: 16,
        //fontStyle: 'italic',
        //fontWeight: 'bold'
      }
    },
    legend: {
      data: [] //Hamza
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: [], //Hamza
        axisTick: {
          alignWithLabel: true
        }
      }
    ],
    yAxis: [
      {
        type: 'value',
        // type: 'category',
        // data: ['0', '1k', '2M', '4M', '10M']
      }
    ],
    series: [
      {
        name: '',
        type: 'bar',
        barGap: 0.1,
        barWidth: 10,
        itemStyle: {
          normal: {
            barBorderRadius: 15,
          }
        },
        data: [] //Hamza
      },
    ]
  }

  public providerBillingDashboard: ProviderBillingDashboard
  public providerBillingDashboardInvoice: ProviderBillingDashboardInvoice[] = []
  public viewBillingInvoice: ProviderBillingDashboardInvoice[] = []
  public isBarGraph: boolean

  public currencyList: any
  public currCurrency: SelectedCurrency
  public exchangeData: ExchangeRate
  public exchangeRate: Rate
  public tableSearch: string
  public isTableLoaded: boolean = false

  public billingStatusList: CodeValMst[] = []
  userCurrencyCode


  constructor(
    private _billingService: BillingService,
    private _dashboardService: DashboardService,
    private _toastr: ToastrService,
    private _commonService: CommonService,
    private _currencyControl: CurrencyControl

  ) { }


  async ngOnInit() {
    // (HassanSJ) work start

    this._commonService.getMstCodeVal('BILLING_STATUS').subscribe((res: any) => {
      this.billingStatusList = res
    }, (error: HttpErrorResponse) => {
      console.log(error);
    })

    let userInfo = JSON.parse(localStorage.getItem('userInfo'));
    this.userProfile = JSON.parse(userInfo.returnText);

    const { ProviderID, CurrencyID } = this.userProfile

    if (CurrencyID && CurrencyID > 0) {
      await this.setCurrencyList()
    }

    this._dashboardService.getProviderBillingDashboard(ProviderID, 'MONTHLY').subscribe((res: JsonResponse) => {

      const { returnId, returnObject, returnText } = res
      if (returnId > 0) {
        this.providerBillingDashboard = returnObject
        this.setBillingDashboardData()

        this.providerBillingDashboardInvoice = cloneObject(this.providerBillingDashboard.invoices)
        this.viewBillingInvoice = cloneObject(this.providerBillingDashboard.invoices)
        setTimeout(() => {
          this.dtTrigger.next()
        }, 0);

        setTimeout(() => {
          this.isTableLoaded = true
        }, 10);

      } else {
        this._toastr.error(returnText, 'Failed')
      }

    }, (err: HttpErrorResponse) => {
      const { message } = err
      console.log('ProviderBillingDashboard', message);
    })


  }

  setBillingDashboardData() {
    this.setBarGraphData()
  }

  onInvoiceCatClick($selectedCat: string) {
    const { providerBillingDashboardInvoice } = this

    if (!providerBillingDashboardInvoice || providerBillingDashboardInvoice.length === 0) {
      return
    }

    setTimeout(() => {
      this.isTableLoaded = false
    }, 0);
    this.selectedCat = $selectedCat

    this.viewBillingInvoice = cloneObject([])

    if ($selectedCat.toLowerCase() === 'all') {
      this.viewBillingInvoice = cloneObject(providerBillingDashboardInvoice)
    } else {
      this.viewBillingInvoice = cloneObject(providerBillingDashboardInvoice.filter(invoice => invoice.paymentStatus.toLowerCase() === $selectedCat.toLowerCase()))
    }

    if (this.datatableElement && this.datatableElement.dtInstance) {
      this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
        setTimeout(() => {
          this.dtTrigger.next()
          this.tableSearch = ''
          this.isTableLoaded = true
        }, 0);
      });
    }
  }

  async setCurrencyList() {
    const res: any = await this._commonService.getCurrency().toPromise()
    let currencyList = res;
    currencyList = removeDuplicateCurrencies(currencyList)
    currencyList.sort(compareValues('title', "asc"));
    this.currencyList = currencyList;
    await this.selectedCurrency();
  }

  async selectedCurrency() {

    const { CurrencyID } = this.userProfile

    const seletedCurrency: CurrencyDetails = this.currencyList.find(obj => obj.id == CurrencyID)

    if (seletedCurrency && seletedCurrency.id && seletedCurrency.id > 0) {
      let currentCurrency: SelectedCurrency = {
        sortedCurrencyID: seletedCurrency.id,
        sortedCountryFlag: seletedCurrency.imageName.toLowerCase(),
        sortedCountryName: seletedCurrency.code,
        sortedCountryId: JSON.parse(seletedCurrency.desc).CountryID
      }

      this.currCurrency = currentCurrency

      const { currCurrency } = this
      this.userCurrencyCode = currentCurrency.sortedCountryName
      const baseCurrencyID = this._currencyControl.getBaseCurrencyID();
      const res2: JsonResponse = await this._commonService.getExchangeRateList(baseCurrencyID).toPromise()
      this.exchangeData = res2.returnObject
      this.exchangeRate = this.exchangeData.rates.filter(rate => rate.currencyID === currCurrency.sortedCurrencyID)[0]
    } else {
      return
    }

  }

  async setBarGraphData() {

    setTimeout(() => {
      this.isBarGraph = false
    }, 20);

    const { providerBillingDashboard, exchangeRate } = this

    if (!providerBillingDashboard.graphStatistics || providerBillingDashboard.graphStatistics.length === 0) {
      let copyOfBarGraph = cloneObject(this.emptybar)

      copyOfBarGraph.title = { text: 'No Data to Show', x: 'center', y: 'center' }
      copyOfBarGraph.color = []
      copyOfBarGraph.legend.data = []
      copyOfBarGraph.xAxis[0].data = []
      copyOfBarGraph.series = []
      this.statistics = copyOfBarGraph
      setTimeout(() => {
        this.isBarGraph = true
      }, 20);
      return
    }

    const { graphStatistics } = providerBillingDashboard

    this.statistics.title = {}

    if (exchangeRate && exchangeRate.rate > 0) {
      try {
        graphStatistics.forEach(bar => {
          const { amount } = bar
          bar.amount = getNewPrice(amount, exchangeRate.rate)
        })

      } catch (err) { }
    }



    const legendsList = this.getLegendsBilling(graphStatistics)
    const colorList = this.getColorListBilling(legendsList)
    const axisData = this.getAxisDataBilling(graphStatistics)
    const seriesList = this.getSerieDataBilling(legendsList, graphStatistics)

    let copyOfBarGraph = cloneObject(this.statistics)
    copyOfBarGraph.color = colorList
    copyOfBarGraph.legend.data = legendsList
    copyOfBarGraph.xAxis[0].data = axisData
    copyOfBarGraph.series = seriesList
    this.statistics = copyOfBarGraph
    setTimeout(() => {
      // this.isBarGraph = true
    }, 20);
  }

  getLegendsBilling(list: GraphStatistic[]) {
    const data = removeDuplicates(list, "keyMode")
    const legends = extractColumn(data, 'keyMode')
    return legends
  }

  getColorListBilling(legends) {
    const arrColor = legends.map(legend => this.getColorByTypeBilling(legend.toLowerCase()))
    return arrColor
  }

  getAxisDataBilling(list: GraphStatistic[]) {
    const sorted = list.sort(
      firstBy(function (v1, v2) { return v1.sortingOrder - v2.sortingOrder; })
    );
    const data = removeDuplicates(sorted, "keyMonth")
    const axisData = extractColumn(data, 'keyMonth')
    return axisData
  }

  getColorByTypeBilling(type: string) {
    const colors = [
      { type: 'bill', color: '#02bdb6' },
      { type: 'payment', color: '#8472d5' },
    ]

    return colors.find(color => color.type === type).color
  }

  getSerieDataBilling(legendsList, barGraph: GraphStatistic[]) {

    const series = []
    legendsList.forEach(legend => {

      const sortedMode = barGraph.sort(
        firstBy(function (v1, v2) { return v1.sortingOrder - v2.sortingOrder; })
      );
      // const currencyControl = new CurrencyControl()
      const filteredMode: Array<any> = sortedMode.filter(mode => mode.keyMode.toLowerCase() === legend.toLowerCase())
      // filteredMode.forEach(mode => mode.totalCount = currencyControl.applyRoundByDecimal(mode.totalCount, 1))
      const dataObject = extractColumn(filteredMode, 'amount')

      const serie = {
        name: legend,
        type: 'bar',
        barGap: 0.1,
        barWidth: 10,
        itemStyle: {
          normal: {
            barBorderRadius: 15,
          }
        },
        data: dataObject
      }
      series.push(serie)
    })
    return series
  }

  onSearchChange($type: string) {
    if ($type) {
      setTimeout(() => {
        this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.search($type)
          dtInstance.search($type).draw();
        });
      }, 0);
    } else {
      setTimeout(() => {
        this.dtTrigger.next()
      }, 0);
    }
  }

  ngOnDestroy() {
    this.dtTrigger.unsubscribe();
  }

  payment() {
    let obj = {
      merchant_email: "abdur@hashmove.com",
      secret_key: "ekQNVlcQwtHZv93SClVAqo9euW1k1cKgxA4sVgjrJ1qfat8NO3ofsxtXuviwH2MeCRHx81YS3o7dSf1HjpWMXqJrV1XC3KRFCzdK",
      currency: "AED",
      amount: "10",
      site_url: "http://localhost:4200/provider/billing",
      title: "test",
      quantity: "1",
      unit_price: "10",
      other_charges: "0",
      discount: "0",
      products_per_title: "test product 1",
      return_url: "http://localhost:58418/Home/Success",
      cc_first_name: "rizwan",
      cc_last_name: "haq",
      cc_phone_number: "111000101",
      phone_number: "111000101",
      billing_address: "test billing",
      city: "Karachi",
      state: "Sindh",
      postal_code: "75000",
      country: "ARE",
      email: "rizwan@texpo.com",
      address_shipping: "test shipping addres",
      city_shipping: "Karachi",
      state_shipping: "Sindh",
      postal_code_shipping: "75000",
      country_shipping: "ARE",
      reference_no: "1286",
      msg_lang: "Engish",
      ip_merchant: "100.100.100.100",
      ip_customer: "Texpo-khi-26",
      cms_with_version: "API"
    };
    // var formdata = "merchant_email=" + "abdur@hashmove.com"
    //   + "&secret_key=" + "ekQNVlcQwtHZv93SClVAqo9euW1k1cKgxA4sVgjrJ1qfat8NO3ofsxtXuviwH2MeCRHx81YS3o7dSf1HjpWMXqJrV1XC3KRFCzdK"
    //   + "&currency=" + "AED"
    //   + "&amount=" + "10"
    //   + "&site_url=" + "http://localhost:4200/provider/billing"
    //   + "&title=" + "test"
    //   + "&quantity=" + "1"
    //   + "&unit_price=" + "10"
    //   + "&other_charges=0"
    //   + "&discount=0"
    //   + "&products_per_title=" + "test product 1"
    //   + "&return_url=" + "http://localhost:58418/Home/Success"
    //   + "&cc_first_name=" + "rizwan"
    //   + "&cc_last_name=" + "haq"
    //   + "&cc_phone_number=" + "111000101"
    //   + "&phone_number=" + "111000101"
    //   + "&billing_address=" + "test billing"
    //   + "&city=" + "karachi"
    //   + "&state=" + "sindh"
    //   + "&postal_code=" + "75000"
    //   + "&country=" + "ARE"
    //   + "&email=" + "rizwan@texpo.com"
    //   + "&ip_customer=" + "Texpo-khi-26"
    //   + "&ip_merchant=100.100.100.100"
    //   + "&address_shipping=" + "test shipping address"
    //   + "&city_shipping=" + "karachi"
    //   + "&state_shipping=" + "sindh"
    //   + "&postal_code_shipping=" + "75000"
    //   + "&country_shipping=" + "ARE"
    //   + "&reference_no=" + "1286"
    //   + "&msg_lang=English"
    //   + "&cms_with_version=API"

    // let bytes = []; // char codes

    // for (var i = 0; i < formdata.length; ++i) {
    //   var code = formdata.charCodeAt(i);
    //   bytes = bytes.concat([code & 0xff, code / 256 >>> 0]);
    // }

    // this._billingService.makePayment(obj).subscribe((res: any) => {
    //   if (res.returnStatus == "Success") {
    //     console.log(res)
    //   }
    // })

  }



}


export function getNewPrice(basePrice: number, exchangeRate: number) {
  let newRate = basePrice * exchangeRate;
  return newRate
}

export const removeDuplicateCurrencies = (currencyFlags: CurrencyDetails[]) => {

  let euros = currencyFlags.filter(element => element.code === 'EUR')
  let franc = currencyFlags.filter(element => element.code === 'XOF')
  let franc2 = currencyFlags.filter(element => element.code === 'XAF')
  let restCurr = currencyFlags.filter(element => element.code !== 'EUR' && element.code !== 'XOF' && element.code !== 'XAF')

  let newCurrencyList = restCurr.concat(euros[0], franc[0], franc2[0]);

  return newCurrencyList
}

export const compareValues = (key: string, order = 'asc') => {
  return function (a: any, b: any) {
    if (!a.hasOwnProperty(key) ||
      !b.hasOwnProperty(key)) {
      return 0;
    }

    const varA = (typeof a[key] === 'string') ?
      a[key].toUpperCase() : a[key];
    const varB = (typeof b[key] === 'string') ?
      b[key].toUpperCase() : b[key];

    let comparison = 0;
    if (varA > varB) {
      comparison = 1;
    } else if (varA < varB) {
      comparison = -1;
    }
    return (
      (order == 'desc') ?
        (comparison * -1) : comparison
    );
  };
}
