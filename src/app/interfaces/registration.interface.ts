
    export interface UserBaseLanguageData {
        userID: number;
        firstName: string;
        lastName: string;
        primaryPhone: string;
        countryPhoneCode: string;
        phoneCodeCountryID: number;
        jobTitle: string;
        languageID: number;
        createdBy: string;
        createdDateTime: Date;
        modifiedBy: string;
        modifiedDateTime: Date;
    }

    export interface UserOtherLanguageData {
        userID: number;
        firstName: string;
        lastName: string;
        primaryPhone: string;
        countryPhoneCode: string;
        phoneCodeCountryID: number;
        jobTitle: string;
        languageID: number;
        createdBy: string;
        createdDateTime: Date;
        modifiedBy: string;
        modifiedDateTime: Date;
    }

    export interface Company {
        companyID: number;
        companyCode: string;
        companyName: string;
        companyShortName: string;
        cityID: number;
        stateID: number;
        countryID: number;
        companyAddress: string;
        companyBillingAddress: string;
        companyPhone: string;
        companyWebAdd: string;
        companyZipCode: string;
        companyImage: string;
        taxPayerNum: string;
        tradeLicenseNum: string;
        faxNo: string;
        poBox: string;
        isDelete: boolean;
        isActive: boolean;
        createdBy: string;
        createdDateTime: Date;
        modifiedBy: string;
        modifiedDateTime: Date;
        companyEmail: string;
        companyTypeID: number;
        companySizeID: number;
    }

    export interface CompanyOL {
        companyOLID: number;
        companyID: number;
        companyNatureOLID: number;
        companyNameOL: string;
        tradeLicenseNum: string;
        companyPhone: string;
        faxNo: string;
        companyOLCode: string;
        shortName: string;
        isDelete: boolean;
        isActive: boolean;
        createdBy: string;
        createdDateTime: Date;
        modifiedBy: string;
        modifiedDateTime: Date;
        languageID: number;
    }

    export interface User {
        userID: number;
        userCode: string;
        loginID: string;
        password: string;
        primaryEmail: string;
        secondaryEmail: string;
        firstName: string;
        middleName: string;
        lastName: string;
        primaryPhone: string;
        secondaryPhone: string;
        countryID: number;
        cityID: number;
        companyID: number;
        roleID: number;
        isDelete: boolean;
        isActive: boolean;
        createdBy: string;
        createdDateTime: Date;
        modifiedBy: string;
        modifiedDateTime: Date;
        userImage: string;
        howHearAboutUs: string;
        howHearOthers: string;
        isCorporateUser: boolean;
        isAgreeTermsCond: boolean;
        isMediaContact: boolean;
        isVerified: boolean;
        isAdmin: boolean;
        departmentID: number;
        regionID: number;
        currencyID: number;
        shippingFreqCode: string;
        isInternationalShip: boolean;
        isLocalShip: boolean;
        countryPhoneCode: string;
        phoneCodeCountryID: number;
        isNotifyAllDeals: boolean;
        userStatus: string;
        userType: string;
        tokenLife: number;
        currencyOwnCountryID: number;
        companyName: string;
        companyTradeLicenseNum: string;
        portalName: string;
        jobTitle: string;
    }

    export interface UserOL {
        userOLID: number;
        userOLCode: string;
        userID: number;
        languageID: number;
        shortName: string;
        firstName: string;
        lastName: string;
        jobTitle: string;
        primaryPhone: string;
        isDelete: boolean;
        isActive: boolean;
        createdBy: string;
        createdDateTime: Date;
        modifiedBy: string;
        modifiedDateTime: Date;
    }

    export interface Provider {
        providerID: number;
        providerCode: string;
        providerName: string;
        providerShortName: string;
        companyID: number;
        providerAddress: string;
        providerPhone: string;
        providerRating: number;
        providerVerified: boolean;
        providerImage: string;
        isDelete: boolean;
        isActive: boolean;
        createdBy: string;
        createdDateTime: Date;
        modifiedBy: string;
        modifiedDateTime: Date;
        isNAFLProvider: boolean;
        providerBusinessStartDate: Date;
        providerWebAdd: string;
        providerEmail: string;
        licenseNo: string;
        issueDate: Date;
        vatNo: string;
        faxNo: string;
        poBox: string;
        expiryDate: Date;
        tradeLicenseDocPath: string;
    }

    export interface ProviderOL {
        providerOLID: number;
        providerID: number;
        languageID: number;
        providerName: string;
        licenseNo: string;
        issueDate: Date;
        expiryDate: Date;
        vatNo: string;
        isDelete: boolean;
        isActive: boolean;
        createdBy: string;
        createdDateTime: Date;
        modifiedBy: string;
        modifiedDateTime: Date;
    }

    export interface UserAccountFor {
        userAccountForID: number;
        userID: number;
        accountForID: number;
        isDelete: boolean;
        isActive: boolean;
        createdBy: string;
        createdDateTime: Date;
        modifiedBy: string;
        modifiedDateTime: Date;
    }

    export interface ProviderUsersMapping {
        providerUsersMappingID: number;
        providerID: number;
        userID: number;
        providerUsersCode: string;
        shortName: string;
        isDelete: boolean;
        isActive: boolean;
        createdBy: string;
        createdDateTime: Date;
        modifiedBy: string;
        modifiedDateTime: Date;
    }

    export interface RootObject {
        userTempID: number;
        accountSetupID: number;
        countryID: number;
        primaryEmail: string;
        otpKey: string;
        otpExpiry: Date;
        redirectUrl: string;
        userBaseLanguageData: UserBaseLanguageData;
        userOtherLanguageData: UserOtherLanguageData;
        company: Company;
        companyOL: CompanyOL;
        user: User;
        userOL: UserOL;
        provider: Provider;
        providerOL: ProviderOL;
        userAccountFor: UserAccountFor;
        providerUsersMapping: ProviderUsersMapping;
        createdBy: string;
        createdDateTime: Date;
        modifiedBy: string;
        modifiedDateTime: Date;
    }


