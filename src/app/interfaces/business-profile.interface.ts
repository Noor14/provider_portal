
    export interface ManagementInfo {
        jobTitleID: number;
        firstName: string;
        lastName: string;
    }

    export interface DirectorInfo {
        jobTitleID: number;
        firstName: string;
        lastName: string;
        email: string;
        mobileNo: string;
    }

    export interface BusinessProfileBL {
        licenseNo: string;
        issueDate: Date;
        expiryDate: Date;
        vatNo: string;
        organizationTypeID: number;
        organizationName: string;
        addressLine1: string;
        addressLine2: string;
        city: string;
        poBox: string;
        telephone: string;
        faxNo: string;
        managementInfo: ManagementInfo[];
        directorInfo: DirectorInfo[];
    }

    export interface ManagementInfo2 {
        jobTitleID: number;
        firstName: string;
        lastName: string;
    }

    export interface DirectorInfo2 {
        jobTitleID: number;
        firstName: string;
        lastName: string;
        email: string;
        mobileNo: string;
    }

    export interface BusinessProfileOL {
        licenseNo: string;
        issueDate: Date;
        expiryDate: Date;
        vatNo: string;
        organizationTypeID: number;
        organizationName: string;
        addressLine1: string;
        addressLine2: string;
        city: string;
        poBox: string;
        telephone: string;
        faxNo: string;
        managementInfo: ManagementInfo2[];
        directorInfo: DirectorInfo2[];
    }

    export interface SocialAccount {
        providerSocialMediaAccountsID: number;
        providerSocialMediaCode: string;
        shortName: string;
        providerID: number;
        socialMediaPortalsID: number;
        carrierID: number;
        companyID: number;
        userID: number;
        linkURL: string;
        isDelete: boolean;
        isActive: boolean;
        createdBy: string;
        createdDateTime: Date;
        modifiedBy: string;
        modifiedDateTime: Date;
    }

    export interface ProviderLogisticServiceList {
        serviceID: number;
        serviceNameBaseLang: string;
        serviceNameOtherLang: string;
    }

    export interface BusinessLocation {
        latitude: string;
        longitude: string;
        addressLine1: string;
        addressLine2: string;
        city: string;
    }

    export interface KeyValue {
    }

    export interface MetaInfoKeysDetail {
        documentMetaInfoKeyID: number;
        keyName: string;
        keyNameDesc: string;
        keyValue: KeyValue;
        isMandatory: boolean;
        dataType: string;
        sortingOrder: number;
        fieldLength: number;
        documentTypeID: number;
        documentID: number;
    }

    export interface FileContent {
        documentID: number;
        documentFileID: number;
        documentFileName: string;
        documentFile: string;
        documentUploadedFileType: string;
    }

    export interface Doc {
        documentTypeID: number;
        documentTypeCode: string;
        documentTypeName: string;
        documentTypeNameOL: string;
        documentTypeDesc: string;
        sortingOrder: number;
        documentNature: string;
        documentSubProcess: string;
        documentID: number;
        userID: number;
        bookingID: number;
        companyID: number;
        providerID: number;
        documentName: string;
        documentDesc: string;
        documentFileName: string;
        documentFileContent: string;
        documentUploadedFileType: string;
        documentLastStatus: string;
        expiryStatusCode: string;
        expiryStatusMessage: string;
        documentUploadDate: Date;
        isDownloadable: boolean;
        isUploadable: boolean;
        isApprovalRequired: boolean;
        businessLogic: string;
        copyOfDocTypeID: number;
        metaInfoKeysDetail: MetaInfoKeysDetail[];
        fileContent: FileContent[];
    }

    export interface RootObject {
        userID: number;
        providerID: number;
        companyID: number;
        businessProfileBL: BusinessProfileBL;
        businessProfileOL: BusinessProfileOL;
        socialAccount: SocialAccount[];
        providerLogisticServiceList: ProviderLogisticServiceList[];
        businessLocation: BusinessLocation;
        doc: Doc[];
    }


