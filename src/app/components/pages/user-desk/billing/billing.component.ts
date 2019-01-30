import { Component, OnInit, ViewChild, ViewEncapsulation, ElementRef, OnDestroy } from '@angular/core';
import * as echarts from 'echarts'
import * as moment from 'moment';
import { DashboardService } from '../dashboard/dashboard.service';
import { HttpErrorResponse } from '@angular/common/http';
import { JsonResponse } from '../../../../interfaces/JsonResponse';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from '../../../../services/common.service';
import { UserInfo, ProviderBillingDashboard, ProviderBillingDashboardInvoice, GraphStatistic } from '../../../../interfaces/billing.interface';
import { ExchangeRate, Rate, CurrencyDetails, SelectedCurrency } from '../../../../interfaces/currency.interface';
import { CurrencyControl } from '../../../../services/currency.service';
import { firstBy } from 'thenby';
import { applyRoundByDecimal, cloneObject, extractColumn, removeDuplicates } from '../reports/reports.component';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';

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
    color: ['#02bdb6', '#8472d5'],
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
      data: ['BILLED', 'PAID']
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

  public providerBillingDashboard: ProviderBillingDashboard
  public providerBillingDashboardInvoice: ProviderBillingDashboardInvoice[] = []
  public viewBillingInvoice: ProviderBillingDashboardInvoice[] = []
  public isBarGraph: boolean

  currencyList: any
  currCurrency: SelectedCurrency
  exchangeData: ExchangeRate
  exchangeRate: Rate
  tableSearch: string


  constructor(
    private _dashboardService: DashboardService,
    private _toastr: ToastrService,
    private _commonService: CommonService,
    private _currencyControl: CurrencyControl

  ) { }


  async ngOnInit() {
    // (HassanSJ) work start
    let userInfo = JSON.parse(localStorage.getItem('userInfo'));
    this.userProfile = JSON.parse(userInfo.returnText);

    const { ProviderID } = this.userProfile

    await this.setCurrencyList()

    this._dashboardService.getProviderBillingDashboard(ProviderID, 'YEARLY').subscribe((res: JsonResponse) => {

      const { returnId, returnObject, returnText } = res
      if (returnId > 0) {
        this.providerBillingDashboard = returnObject
        this.setBillingDashboardData()

        this.providerBillingDashboardInvoice = cloneObject(this.providerBillingDashboard.invoices)
        this.viewBillingInvoice = cloneObject(this.providerBillingDashboard.invoices)
        setTimeout(() => {
          this.dtTrigger.next()
        }, 0);
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

  onInvoiceCatClick($selectedCat: string, $status:string) {
    this.selectedCat = $status

    this.viewBillingInvoice = cloneObject([])
    const { providerBillingDashboardInvoice } = this
    if ($selectedCat.toLowerCase() === 'all') {
      this.viewBillingInvoice = cloneObject(providerBillingDashboardInvoice)
    } else {
      this.viewBillingInvoice = cloneObject(providerBillingDashboardInvoice.filter(invoice => invoice.billingStatus.toLowerCase() === $selectedCat.toLowerCase()))
    }
    console.log(this.viewBillingInvoice);


    if (this.datatableElement && this.datatableElement.dtInstance) {
      this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
        setTimeout(() => {
          this.dtTrigger.next()
          this.tableSearch = ''
        }, 10);
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

    const { userProfile } = this

    let CurrencyID = (userProfile.CurrencyID && userProfile.CurrencyID > 0) ? userProfile.CurrencyID : 101

    const seletedCurrency: CurrencyDetails = this.currencyList.find(obj => obj.id == CurrencyID)

    let currentCurrency: SelectedCurrency = {
      sortedCurrencyID: seletedCurrency.id,
      sortedCountryFlag: seletedCurrency.imageName.toLowerCase(),
      sortedCountryName: seletedCurrency.code,
      sortedCountryId: JSON.parse(seletedCurrency.desc).CountryID
    }

    this.currCurrency = currentCurrency
    const { currCurrency } = this
    const baseCurrencyID = this._currencyControl.getBaseCurrencyID();
    const res2: JsonResponse = await this._commonService.getExchangeRateList(baseCurrencyID).toPromise()
    this.exchangeData = res2.returnObject
    this.exchangeRate = this.exchangeData.rates.filter(rate => rate.currencyID === currCurrency.sortedCurrencyID)[0]
  }

  async setBarGraphData() {

    setTimeout(() => {
      this.isBarGraph = false
    }, 20);

    const { providerBillingDashboard, exchangeRate } = this

    if (!providerBillingDashboard.graphStatistics || providerBillingDashboard.graphStatistics.length === 0) {
      this.statistics.title = { text: 'No Data to Show', x: 'center', y: 'center' }
      this.statistics.color = []
      this.statistics.legend.data = []
      this.statistics.xAxis[0].data = []
      this.statistics.series = []
      setTimeout(() => {
        this.isBarGraph = true
      }, 20);
      return
    }

    const { graphStatistics } = providerBillingDashboard

    this.statistics.title = {}

    try {
      graphStatistics.forEach(bar => {
        const { amount } = bar
        bar.amount = getNewPrice(amount, exchangeRate.rate)
      })

    } catch (err) { }



    const legendsList = this.getLegendsBilling(graphStatistics)
    console.log('legendsList:', legendsList)
    const colorList = this.getColorListBilling(legendsList)
    console.log('colorList:', colorList)
    const axisData = this.getAxisDataBilling(graphStatistics)
    console.log('axisData:', axisData)
    const seriesList = this.getSerieDataBilling(legendsList, graphStatistics)
    console.log('seriesList:', seriesList)

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
