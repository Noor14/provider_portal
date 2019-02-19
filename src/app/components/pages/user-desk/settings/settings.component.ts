import { Component, OnInit } from '@angular/core';
import { JsonResponse } from '../../../../interfaces/JsonResponse';
import { BasicInfoService } from '../../user-creation/basic-info/basic-info.service';
import { NgFilesSelected, NgFilesStatus } from '../../../../directives/ng-files';
import { ToastrService } from 'ngx-toastr';
import { DocumentFile } from '../../../../interfaces/document.interface';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  constructor(
    private _basicInfoService: BasicInfoService,
    private _toastr: ToastrService
    ) { }

  ngOnInit() {
  }
  // selectDocx(selectedFiles: NgFilesSelected, type): void {
  //   if (selectedFiles.status !== NgFilesStatus.STATUS_SUCCESS) {
  //     if (selectedFiles.status == 1) this._toastr.error('Please select twelve or less file(s) to upload.', '')
  //     else if (selectedFiles.status == 2) this._toastr.error('File size should not exceed 5 MB. Please upload smaller file.', '')
  //     else if (selectedFiles.status == 4) this._toastr.error('File format is not supported. Please upload supported format file.', '')
  //     return;
  //   }
  //   else {
  //     try {
  //       this.onFileChange(selectedFiles, type)
  //     } catch (error) {
  //       console.log(error);
  //     }

  //   }
  // }

  // onFileChange(event, type) {
  //   let flag = 0;
  //   if (event) {
  //     try {
  //       const allDocsArr = []
  //       const fileLenght: number = event.files.length
  //       for (let index = 0; index < fileLenght; index++) {
  //         let reader = new FileReader();
  //         const element = event.files[index];
  //         let file = element
  //         reader.readAsDataURL(file);
  //         reader.onload = () => {
  //           const selectedFile: DocumentFile = {
  //             fileName: file.name,
  //             fileType: file.type,
  //             fileUrl: reader.result,
  //             fileBaseString: (reader as any).result.split(',').pop()
  //           }
  //           if (event.files.length <= this.config.maxFilesCount) {
  //             const docFile = JSON.parse(this.generateDocObject(selectedFile, type));
  //             allDocsArr.push(docFile);
  //             flag++
  //             if (flag === fileLenght) {
  //               this.uploadDocuments(allDocsArr, type)
  //             }
  //           }
  //           else {
  //             this._toastr.error('Please select only ' + this.config.maxFilesCount + 'file to upload', '');
  //           }
  //         }
  //       }
  //     }
  //     catch (err) {
  //       console.log(err);
  //     }
  //   }

  // }

  // generateDocObject(selectedFile, type): any {
  //   let object
  //   if (type == 'logo') {
  //     object = this.companyLogoDocx;
  //     object.DocumentID = this.docTypeIdLogo;
  //     object.DocumentLastStatus = this.fileStatusLogo;

  //   }
  //   else if (type == 'gallery') {
  //     object = this.galleriesDocx;
  //     object.DocumentID = this.docTypeIdGallery;
  //     object.DocumentLastStatus = this.fileStatusGallery;

  //   }
  //   else if (type == 'certificate') {
  //     object = this.certficateDocx;
  //     object.DocumentID = this.docTypeIdCert;
  //     object.DocumentLastStatus = this.fileStatusCert;

  //   }
  //   object.UserID = this.userProfile.UserID;
  //   object.ProviderID = this.userProfile.ProviderID;
  //   object.DocumentFileContent = null;
  //   object.DocumentName = null;
  //   object.DocumentUploadedFileType = null;
  //   object.FileContent = [{
  //     documentFileName: selectedFile.fileName,
  //     documentFile: selectedFile.fileBaseString,
  //     documentUploadedFileType: selectedFile.fileType.split('/').pop()
  //   }]
  //   return JSON.stringify(object);
  // }

  // async uploadDocuments(docFiles: Array<any>, type) {
  //   const totalDocLenght: number = docFiles.length
  //   for (let index = 0; index < totalDocLenght; index++) {
  //     try {
  //       const resp: JsonResponse = await this.docSendService(docFiles[index])
  //       if (resp.returnStatus = 'Success') {
  //         let resObj = JSON.parse(resp.returnText);
  //         if (type == 'logo') {
  //           this.docTypeIdLogo = resObj.DocumentID;
  //           this.fileStatusLogo = resObj.DocumentLastStaus;
  //         }
  //         else if (type == 'gallery') {
  //           this.docTypeIdGallery = resObj.DocumentID;
  //           this.fileStatusGallery = resObj.DocumentLastStaus;
  //         }
  //         else if (type == 'certificate') {
  //           this.docTypeIdCert = resObj.DocumentID;
  //           this.fileStatusCert = resObj.DocumentLastStaus;

  //         }
  //         // this.docTypeId = resObj.DocumentID;
  //         // this.fileStatus = resObj.DocumentLastStaus;
  //         let fileObj = JSON.parse(resObj.DocumentFile);
  //         fileObj.forEach(element => {
  //           element.DocumentFile = baseExternalAssets + element.DocumentFile;
  //         });
  //         if (index !== (totalDocLenght - 1)) {
  //           docFiles[index + 1].DocumentID = resObj.DocumentID;
  //           docFiles[index + 1].DocumentLastStatus = resObj.DocumentLastStaus;
  //         }
  //         // this.selectedDocx = fileObj;
  //         if (type == 'logo') {
  //           this.selectedDocxlogo = fileObj[0];
  //         }
  //         else if (type == 'gallery') {
  //           this.selectedGalleryDocx = fileObj;
  //         }
  //         else if (type == 'certificate') {
  //           this.selectedCertificateDocx = fileObj;
  //         }
  //         this._toastr.success("File upload successfully", "");
  //       }
  //       else {
  //         this._toastr.error("Error occured on upload", "");
  //       }
  //     } catch (error) {
  //       this._toastr.error("Error occured on upload", "");
  //     }
  //   }
  // }

  // async docSendService(doc: any) {
  //   const resp: JsonResponse = await this._basicInfoService.docUpload(doc).toPromise()
  //   return resp
  // }
}
