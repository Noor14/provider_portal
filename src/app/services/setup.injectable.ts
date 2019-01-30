import { Injectable } from '@angular/core';
import { CommonService } from './common.service';
import { CurrencyControl } from './currency.service';
import { CurrencyDetails, Rate } from '../interfaces/currency.interface';
import { removeDuplicateCurrencies } from '../components/pages/user-desk/billing/billing.component';
import { SharedService } from './shared.service';

@Injectable()
export class SetupService {

  constructor(
    private _commonService: CommonService,
    private _currencyControl: CurrencyControl,
    private _sharedService: SharedService
  ) { }


  async setBaseCurrencyConfig() {

    let res: any = await this._commonService.getCurrency().toPromise()
    let currencyList: CurrencyDetails[] = res

    currencyList = removeDuplicateCurrencies(currencyList)
    this._currencyControl.setCurrencyList(currencyList)

    let userData = JSON.parse(localStorage.getItem('loginUser'))

    if (userData && !userData.IsLogedOut && ((userData.CurrencyID && userData.CurrencyID > 0) && (userData.CurrencyOwnCountryID && userData.CurrencyOwnCountryID > 0))) {
      let currData: CurrencyDetails[]
      // currData = currencyList.filter(curr => curr.id === userData.CurrencyID && JSON.parse(curr.desc).CountryID === userData.CurrencyOwnCountryID)
      currData = currencyList.filter(curr => curr.id === userData.CurrencyID)
      this._currencyControl.setCurrencyID(userData.CurrencyID)
      this._currencyControl.setCurrencyCode(currData[0].code)
      this._currencyControl.setToCountryID(JSON.parse(currData[0].desc).CountryID)

      let exchangeRes: any = await this._commonService.getExchangeRateList(this._currencyControl.getBaseCurrencyID()).toPromise()
      this._currencyControl.setExchangeRateList(exchangeRes.returnObject)
      let exchnageRate: Rate = exchangeRes.returnObject.rates.filter(rate => rate.currencyID === this._currencyControl.getCurrencyID())[0]
      this._currencyControl.setExchangeRate(exchnageRate.rate)
      if (!localStorage.getItem('CURR_MASTER')) {
        localStorage.setItem('CURR_MASTER', JSON.stringify(this._currencyControl.getMasterCurrency()))
      }
      let masterCurrency = JSON.parse(localStorage.getItem('CURR_MASTER'))
      this._currencyControl.setMasterCurrency(masterCurrency)
    } else {
      let currData: CurrencyDetails[] = currencyList.filter(curr => JSON.parse(curr.desc).CountryCode.toLowerCase() === this._sharedService.getMapLocation().toLowerCase())
      this._currencyControl.setCurrencyID(currData[0].id)
      this._currencyControl.setCurrencyCode(currData[0].code)
      this._currencyControl.setToCountryID(JSON.parse(currData[0].desc).CountryID)

      let exchangeRes: any = await this._commonService.getExchangeRateList(this._currencyControl.getBaseCurrencyID()).toPromise()
      this._currencyControl.setExchangeRateList(exchangeRes.returnObject)
      let exchnageRate: Rate = exchangeRes.returnObject.rates.filter(rate => rate.currencyID === this._currencyControl.getCurrencyID())[0]
      this._currencyControl.setExchangeRate(exchnageRate.rate)
      if (!localStorage.getItem('CURR_MASTER')) {
        localStorage.setItem('CURR_MASTER', JSON.stringify(this._currencyControl.getMasterCurrency()))
      }

      let masterCurrency = JSON.parse(localStorage.getItem('CURR_MASTER'))
      this._currencyControl.setMasterCurrency(masterCurrency)
    }
    return 'done'
  }

}
