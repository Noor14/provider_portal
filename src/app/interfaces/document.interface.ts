export interface DocumentUpload {
    DocumentTypeID: number;
    DocumentTypeCode: string;
    DocumentTypeName: string;
    DocumentTypeNameOL: string;
    DocumentTypeDesc: string;
    SortingOrder: number;
    DocumentNature: string;
    DocumentSubProcess: string;
    DocumentID?: any;
    UserID?: any;
    BookingID?: any;
    CompanyID?: any;
    ProviderID?: any;
    DocumentName: string;
    DocumentDesc: string;
    DocumentFileName?: any;
    DocumentFileContent: string;
    DocumentUploadedFileType?: any;
    DocumentLastStatus?: any;
    ExpiryStatusCode: string;
    ExpiryStatusMessage: string;
    DocumentUploadDate?: any;
    IsDownloadable: boolean;
    IsUploadable?: any;
    IsApprovalRequired: boolean;
    BusinessLogic?: any;
    CopyOfDocTypeID?: any;
    MetaInfoKeysDetail?: any;
    FileContent:fileContent[]
}
export interface fileContent{
    documentFileName: string,
    documentFile: string,
    documentUploadedFileType: string
}
export interface DocumentFile {
    fileBaseString: string
    fileName: string
    fileType: string
    fileUrl: string | ArrayBuffer
}