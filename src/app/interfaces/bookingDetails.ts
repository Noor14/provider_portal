export interface ContainerDetail {
  ContainerSpecID: number;
  ContainerSpecCode: string;
  ContainerSpecDesc: string;
  BookingContTypeQty: number;
}

export interface RouteDetail {
  PolPodCode: string;
  EtdUtc: string;
  EtdLcl: string;
  EtaUtc: string;
  EtaLcl: string;
}

export interface PriceDetail {
  SurchargeType: string;
  SurchargeID: number;
  SurchargeCode: string;
  SurchargeName: string;
  ContainerSpecID?: number;
  CurrencyID: number;
  CurrencyCode: string;
  BaseCurrencyID: number;
  BaseCurrencyCode: string;
  TotalAmount: number;
  BaseCurrTotalAmount: number;
  IndividualPrice?: number;
  SortingOrder: number;
  TransMode: string;
  BaseCurrIndividualPrice: number;
  ExchangeRate?: number;
  ActualIndividualPrice?: number;
  ActualTotalAmount?: number;
  LogServShortName?: any;
  IsChecked?: boolean;
  ShowInsurance?: boolean;
}

export interface EnquiryDetail {
  BookingEnquiryID: number;
  BookingEnquiryType: string;
  BookingEnquiryDate: Date;
  BookingID: number;
  BookingEnquiryAckDate?: Date;
  BookingEnquiryPrice?: number;
  CurrencyID?: number;
  CurrencyCode?: string;
  BookingEnquiryAckRemarks?: string;
  ProviderID: number;
  ProviderCode: string;
  ProviderName: string;
  ProviderShortName: string;
  ProviderImage: string;
  ProviderEmail: string;
}

export interface BookingDetails {
  BookingID: number;
  HashMoveBookingNum: string;
  HashMoveBookingDate: string;
  ShippingCatID: number;
  ShippingSubCatID: number;
  ShippingModeID: number;
  ShippingModeName: string;
  ShippingModeCode: string;
  ShippingCatName: string;
  ShippingSubCatName: string;
  PolID: number
  PolCode: string;
  PolName: string;
  PolCountry: string;
  PodID: number
  PodCode: string;
  PodName: string;
  PodCountry: string;
  PolModeOfTrans: string;
  PodModeOfTrans: string;
  ContainerLoad: string;
  ContainerCount: number;
  EtdUtc: string;
  EtdLcl: string;
  EtaUtc: string;
  EtaLcl: string;
  EtaInDays?: number;
  TransitTime: number;
  PortCutOffUtc: string;
  PortCutOffLcl: string;
  FreeTimeAtPort: number;
  ProviderID: number;
  ProviderName: string;
  ProviderImage: string;
  ProviderEmail: string;
  ProviderPhone: string;   
  CarrierID: number;
  CarrierName: string;
  CarrierImage: string;
  VesselCode: string;
  VesselName: string;
  VoyageRefNum: string;
  IsInsured: boolean;
  ProviderInsurancePercent: number,
  InsuredGoodsPrice: number;
  InsuredGoodsCurrencyID: number;
  InsuredGoodsCurrencyCode: string;
  IsInsuredGoodsBrandNew: boolean;
  InsuredGoodsProviderID: number;
  InsuredStatus: string;
  IsInsuranceProvider: boolean,
  IsAnyRestriction: boolean;
  CurrencyID: number;
  CurrencyCode: string;
  BookingTotalAmount: number;
  BookingContainerDetail: ContainerDetail[];
  BookingRouteDetail: RouteDetail[];
  BookingPriceDetail: PriceDetail[];
  BookingEnquiryDetail: EnquiryDetail[];
  BookingStatus:string;
  DiscountPrice?: number;
  DiscountPercent?: number;
  IDlist?: string;
  InsuredGoodsBaseCurrPrice: number;
  InsuredGoodsBaseCurrencyID: number;
  InsuredGoodsBaseCurrencyCode: string;
  InsuredGoodsActualPrice: number;
  InsuredGoodsExchangeRate: number;
  BaseCurrencyID: number;
  BaseCurrencyCode: string;
  BaseCurrTotalAmount: number;
  ExchangeRate: number;
  ProviderDisplayImage?:string;
  CarrierDisplayImage?:string;
  UserName:string;
  UserCountryName:string;
  UserCityName:string;
}




export interface BookingPriceDetail {
  SurchargeType: string;
  SurchargeID: number;
  SurchargeCode: string;
  SurchargeName: string;
  ContainerSpecID?: number;
  CurrencyID: number;
  CurrencyCode: string;
  BaseCurrencyID: number;
  BaseCurrencyCode: string;
  TotalAmount: number;
  BaseCurrencyPrice: number;
  IndividualPrice: number;
  SortingOrder: number;
  SortOrder: number;
  TransMode: string;
  BaseCurrTotalAmount: number;
  BaseCurrIndividualPrice?: number;
  ActualTotalAmount: number;
  ActualIndividualPrice: number;
  ExchangeRate: number;
}

export interface BookingContainerTypeDetail {
  BookingContTypeQty: number;
  ContainerSpecID: number;
  ContainerSpecCode?: any;
  ContainerSpecDesc?: any;
}

export interface BookingSurChargeDetail {
  SurchargeType: string;
  SurchargeID: number;
  SurchargeCode: string;
  SurchargeName: string;
  ContainerSpecID: number;
  CurrencyID: number;
  CurrencyCode: string;
  BaseCurrencyID: number;
  BaseCurrencyCode: string;
  TotalAmount: number;
  BaseCurrencyPrice: number;
  IndividualPrice: number;
  SortingOrder: number;
  SortOrder: number;
  TransMode: string;
  BaseCurrTotalAmount: number;
  BaseCurrIndividualPrice: number;
  ActualTotalAmount: number;
  ActualIndividualPrice: number;
  ExchangeRate: number;
}

export interface SaveBookingObject {
  BookingID: number;
  UserID: number;
  BookingSource: string;
  BookingStatus: string;
  MovementType: string;
  ShippingSubCatID: number;
  ShippingModeID: number;
  CarrierID: number;
  CarrierImage: string;
  CarrierName: string;
  ProviderID: number;
  ProviderImage: string;
  ProviderName: string;
  PolID: number;
  PodID: number;
  PolName: string;
  PodName: string;
  EtdUtc: Date;
  EtdLcl: Date;
  EtaUtc: Date;
  EtaLcl: Date;
  PortCutOffUtc: Date;
  PortCutOffLcl: Date;
  TransitTime: number;
  ContainerLoad: string;
  FreeTimeAtPort: number;
  IsInsured: boolean;
  IsInsuranceProvider: boolean;
  InsuredGoodsPrice?: any;
  InsuredGoodsCurrencyID: number;
  InsuredGoodsCurrencyCode: string;
  IsInsuredGoodsBrandNew: boolean;
  InsuredGoodsProviderID: number;
  InsuredStatus: string;
  IsAnyRestriction: boolean;
  PolModeOfTrans: string;
  PodModeOfTrans: string;
  VesselCode: string;
  VesselName: string;
  VoyageRefNum: string;
  CreatedBy: string;
  ModifiedBy: string;
  IDlist: string;
  InsuredGoodsBaseCurrPrice: number;
  InsuredGoodsBaseCurrencyID: number;
  InsuredGoodsBaseCurrencyCode: string;
  InsuredGoodsActualPrice: number;
  InsuredGoodsExchangeRate: number;
  BookingPriceDetail: BookingPriceDetail[];
  BookingContainerTypeDetail: BookingContainerTypeDetail[];
  BookingSurChargeDetail: BookingSurChargeDetail[];
  BookingEnquiryDetail: any[];
}

export interface InsuranceProvider {
  ProviderID: number;
  ProviderCode: string;
  ProviderName: string;
  ProviderShortName: string;
  ProviderImage: string;
  ProviderEmail: string;
  isChecked: boolean;
}


export interface AdditionalOptions {
  VASID: number;
  VASCode: string;
  VASName: string;
  VASDesc?: any;
  ModeOfTrans: string;
  VASBasis: string;
  LogServID: number;
  LogServName: string;
  LogServShortName: string;
  SurchargeType: string;
  SurchargeID: number;
  SurchargeName: string;
  SurchargeCode: string;
  ProviderID: number;
  PortID: number;
  ImpExpFlag: string;
  CurrencyID: number;
  VASChargeType: string;
  VASCharges: number;
  ProviderCode: string;
  ProviderName: string;
  ProviderImage: string;
  PortCode: string;
  PortName: string;
  CountryID: number;
  CountryCode: string;
  CountryName: string;
  CurrencyCode: string;
  CurrencyName: string;
  BaseCurrencyID: number;
  BaseCurrencyCode: string;
  ExchangeRate: number;
  BaseCurrVASCharges: number;
  IsChecked: boolean;
  TotalAmount: number;
}