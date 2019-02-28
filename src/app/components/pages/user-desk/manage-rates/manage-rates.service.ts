import { Injectable } from '@angular/core';
import { baseApi } from '../../../../constants/base.url';
import { HttpClient, HttpParams } from "@angular/common/http";

@Injectable()
export class ManageRatesService {

  constructor(private _http: HttpClient) { }

  termNCondition(obj) {
    let url: string = "provider/SaveTermsAndConditions";
    return this._http.post(baseApi + url, obj);
  }

  getShippingData() {
    let url: string = "shippingModeCatMapping/GetShippingCriteria";
    return this._http.get(baseApi + url);
  }

  getPortsData($portType?: string) {
    let portType = $portType
    if (!portType) {
      portType = 'SEA'
    }
    let url: string = `Ports/GetPortsList/0/${portType}`;
    return this._http.get(baseApi + url);
  }

  getContainersMapping() {
    let url: string = "shippingModeCatMapping/GetContainerSpecMapping";
    return this._http.get(baseApi + url);
  }

  getAllCustomers(ProviderID) {
    let url: string = `provider/GetProviderCustomerMapping/${ProviderID}`;
    return this._http.get(baseApi + url);
  }

  getAllAdditionalCharges(ProviderID) {
    let url: string = `AdditionalCharge/GetAll/${ProviderID}`;
    return this._http.get(baseApi + url);
  }

  addCustomCharge(data) {
    let url: string = `AdditionalCharge/Post`;
    return this._http.post(baseApi + url, data);
  }

  getSurchargeBasis(ContainerLoadType) {
    let url: string = `AdditionalCharge/GetSurchargeBasis/${ContainerLoadType}`;
    return this._http.get(baseApi + url);
  }
}
