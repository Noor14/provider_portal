import { Injectable } from "@angular/core";
import { MasterCurrency, CurrencyDetails, ExchangeRate, Rate } from "../interfaces/currency.interface";


@Injectable()
export class CurrencyControl {


  private MASTER_CURRENCY: MasterCurrency = {
    fromCurrencyCode: 'AED',
    fromCurrencyID: 101,
    rate: 0,
    toCurrencyCode: 'AED',
    toCurrencyID: 101,
    toCountryID: 101
  }

  private GLOBAL_DECIMAL_PLACES: number = 2
  private CURRENCY_LIST: CurrencyDetails[]
  private EXCHANGE_RATE_LIST: ExchangeRate

  setCurrencyList(currencyList: CurrencyDetails[]) {
    this.CURRENCY_LIST = currencyList
  }

  getCurrencyList(): CurrencyDetails[] {
    return this.CURRENCY_LIST
  }

  setCurrencyID(currencyId: number) {
    this.MASTER_CURRENCY.toCurrencyID = currencyId
  }

  getCurrencyID(): number {
    return this.MASTER_CURRENCY.toCurrencyID
  }
  setBaseCurrencyID(currencyId: number) {
    this.MASTER_CURRENCY.fromCurrencyID = currencyId
  }

  getBaseCurrencyID(): number {
    return this.MASTER_CURRENCY.fromCurrencyID
  }
  setBaseCurrencyCode(currencyCode: string) {
    this.MASTER_CURRENCY.fromCurrencyCode = currencyCode
  }

  getBaseCurrencyCode(): string {
    return this.MASTER_CURRENCY.fromCurrencyCode
  }
  setCurrencyCode(currencyCode: string) {
    this.MASTER_CURRENCY.toCurrencyCode = currencyCode
  }

  getCurrencyCode(): string {
    return this.MASTER_CURRENCY.toCurrencyCode
  }
  setExchangeRate(exRate: number) {
    this.MASTER_CURRENCY.rate = exRate
  }

  getExchangeRate(): number {
    return this.MASTER_CURRENCY.rate
  }
  setToCountryID(countryID: number) {
    this.MASTER_CURRENCY.toCountryID = countryID
  }

  getToCountryID(): number {
    return this.MASTER_CURRENCY.toCountryID
  }

  setExchangeRateList(rateList: ExchangeRate) {
    this.EXCHANGE_RATE_LIST = rateList
  }

  getExchangeRateList(): ExchangeRate {
    return this.EXCHANGE_RATE_LIST
  }

  setMasterCurrency(masterCurr: MasterCurrency) {
    this.MASTER_CURRENCY = masterCurr
  }

  getMasterCurrency(): MasterCurrency {
    return this.MASTER_CURRENCY
  }


  getGlobalDecimal(): number {
    return this.GLOBAL_DECIMAL_PLACES
  }


  getPriceToBase(amount: number, isRoudningTrue): number {
    let newAmount: number = 0
    if (isRoudningTrue) {
      newAmount = amount / this.MASTER_CURRENCY.rate;
      newAmount = this.applyRoundByDecimal(newAmount, this.GLOBAL_DECIMAL_PLACES);
    } else {
      newAmount = amount / this.MASTER_CURRENCY.rate;
    }
    return newAmount
  }



  applyRoundByDecimal(amount: number, decimalPlaces: number): number {
    let newAmount = Number(parseFloat(amount + '').toFixed(decimalPlaces));
    return newAmount
  }


  getNewPrice(basePrice: number, exchangeRate: number) {
    let newRate = basePrice * exchangeRate;
    return newRate
  }
}
