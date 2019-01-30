export interface BillingTile {
  currencyID: number;
  currencyCode: string;
  title: string;
  amount: number;
}

export interface PaymentDueTile {
  currencyID: number;
  currencyCode: string;
  title: string;
  amount: number;
  dueDate: Date;
}

export interface TotalBillingTile {
  currencyID: number;
  currencyCode: string;
  title: string;
  amount: number;
}

export interface GraphStatistic {
  keyYear: number;
  keyMonth: string;
  keyMode: string;
  amount: number;
  sortingOrder: number;
}

export interface ProviderBillingDashboard {
  billingTile: BillingTile;
  paymentDueTile: PaymentDueTile;
  totalBillingTile: TotalBillingTile;
  graphStatistics: GraphStatistic[];
  invoices: ProviderBillingDashboardInvoice[]
}

export interface ProviderBillingDashboardInvoice {
  invoiceID: number;
  invoiceNo: string;
  description: string;
  issuedDate: Date;
  dueDate: Date;
  billingCurID: number;
  billingCurCode: string;
  billingAmount: number;
  billingStatus: string;
  paymentCurID: number;
  paymentCurCode: string;
  paymentAmount: number;
  paymentStatus: string;
}

export interface UserInfo {
  UserID: number;
  CompanyID: number;
  ProviderID: number;
  CountryID: number;
  RegionID: number;
  RegionCode: string;
  FirstNameBL: string;
  LastNameBL: string;
  JobTitleBL: string;
  PrimaryPhoneBL: string;
  CountryPhoneCodeBL?: any;
  FirstNameOL: string;
  LastNameOL: string;
  JobTitleOL: string;
  PrimaryPhoneOL: string;
  CountryPhoneCodeOL: string;
  PrimaryEmail: string;
  PhoneCodeCountryID?: any;
  LanguageID: number;
  IsLogedOut: boolean;
  UserProfileStatus: string;
  PortalName: string;
  LoginID: string;
  CountryPhoneCode: string;
  UserType: string;
  WHID?: any;
  CurrencyID?: number;
}
