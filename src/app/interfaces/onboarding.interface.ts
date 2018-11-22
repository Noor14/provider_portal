export interface objectBaseLang{
    org_name: string;
    telephone: string;
    social_account?: number;
    addressline1: string;
    addressline2?: string;
    city: string;
    poBox: string;
    firstName: string;
    lastName: string;
    jobTitle?: string;
    mob_number?: string;
    email: string
}
export interface objectotherLang {
    org_name_Ol: string;
    telephone_Ol: string;
    social_account_Ol?: number;
    addressline1_Ol: string;
    addressline2_Ol?: string;
    city_Ol: string;
    poBox_Ol: string;
    firstName_Ol: string;
    lastName_Ol: string;
    jobTitle_Ol?: string;
    mob_number_Ol?: string;
    email_Ol: string
}
export interface AccountCreation{
    company_activities: any[];
    detail_BL: objectBaseLang;
    detail_OL: objectotherLang;
}
