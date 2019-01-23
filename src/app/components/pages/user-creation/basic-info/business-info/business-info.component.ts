import { Component, OnInit, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { NgFilesService, NgFilesConfig, NgFilesStatus, NgFilesSelected } from '../../../../../directives/ng-files';
import { DocumentFile } from '../../../../../interfaces/document.interface';
import { JsonResponse } from '../../../../../interfaces/JsonResponse';
import { baseExternalAssets } from '../../../../../constants/base.url';
import { BasicInfoService } from '../basic-info.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-business-info',
  templateUrl: './business-info.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./business-info.component.scss']
})
export class BusinessInfoComponent implements OnInit {
  public baseExternalAssets: string = baseExternalAssets;
  public frtService: any[] = [];
  public valueService: any[] = [];
  public assocService: any[] = [];
  public allAssociations: any[] = [];
  public freightServices: any[] = [];
  public valAddedServices: any[] = [];
  public docTypes: any[] = [];
  public selectedDocx: any[] = [];
  public selectedDocxlogo: any[] = [];
  public selectedGalleryDocx: any[] = [];
  public selectedCertificateDocx: any[] = [];
  public userProfile: any;
  private docTypeId = null;
  public docxId: any;
  private fileStatus = undefined;
  public selectedFiles: any;
  public selectedLogo: any;
  private config: NgFilesConfig = {
    acceptExtensions: ['jpg', 'png', , 'pdf', 'bmp'],
    maxFilesCount: 2,
    maxFileSize: 4096000,
    totalFilesSize: 8192000
  };
  public aboutUs;
  public companyLogoDocx: any;
  public certficateDocx: any;
  public galleriesDocx:any;
  constructor(
    private _toastr: ToastrService,
    private _basicInfoService: BasicInfoService,
    private cdRef: ChangeDetectorRef,
    private ngFilesService: NgFilesService,
    
  ) {
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ngOnInit() {
    this.ngFilesService.addConfig(this.config, 'config');
    // this.ngFilesService.addConfig(this.namedConfig);
    let userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo && userInfo.returnText) {
      this.userProfile = JSON.parse(userInfo.returnText);
    }
    this.getbusinessServices();
  }

  freightService(obj, selectedService) {
    let selectedItem = selectedService.classList;
    if (this.frtService && this.frtService.length) {
      for (var i = 0; i < this.frtService.length; i++) {
        if (this.frtService[i] == obj.logServID) {
          this.frtService.splice(i, 1);
          selectedItem.remove('active');
          return;
        }
      }
    }
    if ((this.frtService && !this.frtService.length) || (i == this.frtService.length)) {
      selectedItem.add('active');
      this.frtService.push(obj.logServID);
    }
  }

  valAdded(obj, selectedService) {
    let selectedItem = selectedService.classList;
    if (this.valueService && this.valueService.length) {
      for (var i = 0; i < this.valueService.length; i++) {
        if (this.valueService[i] == obj.logServID) {
          this.valueService.splice(i, 1);
          selectedItem.remove('active');
          return;
        }
      }
    }
    if ((this.valueService && !this.valueService.length) || (i == this.valueService.length)) {
      selectedItem.add('active');
      this.valueService.push(obj.logServID);
    }
  }


  selectAssociation(obj, selectedService) {
    let selectedItem = selectedService.classList;
    if (this.assocService && this.assocService.length) {
      for (var i = 0; i < this.assocService.length; i++) {
        if (this.assocService[i] == obj.assnWithID) {
          this.assocService.splice(i, 1);
          selectedItem.remove('active');
          return;
        }
      }
    }
    if ((this.assocService && !this.assocService.length) || (i == this.assocService.length)) {
      selectedItem.add('active');
      this.assocService.push(obj.assnWithID);
    }
  }
  getbusinessServices(){
    this._basicInfoService.getbusinessServices(913).subscribe((res:any)=>{
      if (res && res.returnStatus == "Success"){
        this.allAssociations = res.returnObject.associations;
        this.freightServices = res.returnObject.services.logisticServices;
        this.valAddedServices = res.returnObject.services.valueAddedServices;
        if (res.returnObject && res.returnObject.documentType && res.returnObject.documentType.length){
        this.companyLogoDocx = res.returnObject.documentType.find(obj => obj.businessLogic == 'COMPANY_LOGO');
        this.certficateDocx = res.returnObject.documentType.find(obj => obj.businessLogic == 'PRO_AWD_CRTF_GLRY');
        this.galleriesDocx = res.returnObject.documentType.find(obj => obj.businessLogic == 'PROVIDER_GALLERY');
        }
      }
    })
  }
removeSelectedDocx(index,  obj, type) {
  obj.DocumentFile  =  obj.DocumentFile.split(baseExternalAssets).pop();
  obj.DocumentID  =  this.docTypeId;
  this._basicInfoService.removeDoc(obj).subscribe((res:  any)  =>  {
    if  (res.returnStatus  ==  'Success') {
      this._toastr.success('Remove selected document succesfully',  "");
      if(type == 'logo'){
        this.selectedDocxlogo.splice(index, 1);
      }
      else if (type == 'gallery') {
        this.selectedGalleryDocx.splice(index, 1);
      }
      else if (type == 'certificate') {
        this.selectedCertificateDocx.splice(index, 1);
      }
    }
    else  {
      this._toastr.error('Error Occured',  "");
    }
  }, (err:  HttpErrorResponse)  =>  {
    console.log(err);
  })
}

  selectDocx(selectedFiles: NgFilesSelected, type): void {
    if (selectedFiles.status !== NgFilesStatus.STATUS_SUCCESS) {
      if (selectedFiles.status == 1) this._toastr.error('Please select two or less file(s) to upload.', '')
      else if (selectedFiles.status == 2) this._toastr.error('File size should not exceed 4 MB. Please upload smaller file.', '')
      else if (selectedFiles.status == 4) this._toastr.error('File format is not supported. Please upload supported format file.', '')
      return;
    }
    else {
      try {
        this.onFileChange(selectedFiles, type)
      } catch (error) {
        console.log(error);
      }

    }
  }

  onFileChange(event, type) {
    let flag = 0;
    if (event) {
      try {
        const allDocsArr = []
        const fileLenght: number = event.files.length
        for (let index = 0; index < fileLenght; index++) {
          let reader = new FileReader();
          const element = event.files[index];
          let file = element
          reader.readAsDataURL(file);
          reader.onload = () => {
            const selectedFile: DocumentFile = {
              fileName: file.name,
              fileType: file.type,
              fileUrl: reader.result,
              fileBaseString: reader.result.split(',')[1]
            }
              if (type == 'logo') {
               if (event.files.length <= this.config.maxFilesCount) {
                  const docFile = JSON.parse(this.generateDocObject(selectedFile, type));
                  allDocsArr.push(docFile);
                  flag++
                  if (flag === fileLenght) {
                    this.uploadDocuments(allDocsArr, type)
                  }
                }
                else {
                  this._toastr.error('Please select only two file to upload', '');
                }
              }
              else if (type == 'gallery') {
                if (event.files.length <= this.config.maxFilesCount) {
                  const docFile = JSON.parse(this.generateDocObject(selectedFile, type));
                  allDocsArr.push(docFile);
                  flag++
                  if (flag === fileLenght) {
                    this.uploadDocuments(allDocsArr, type)
                  }
                }
                else {
                  this._toastr.error('Please select only two file to upload', '');
                }
              }
              else if (type == 'certificate') {
                if (event.files.length <= this.config.maxFilesCount) {
                  const docFile = JSON.parse(this.generateDocObject(selectedFile, type));
                  allDocsArr.push(docFile);
                  flag++
                  if (flag === fileLenght) {
                    this.uploadDocuments(allDocsArr, type)
                  }
                }
                else {
                  this._toastr.error('Please select only two file to upload', '');
                }
              }
            }
        }
      }
      catch (err) {
        console.log(err);
      }
    }

  }
  
  generateDocObject(selectedFile, type): any {
    let object
    if(type == 'logo'){
      object = this.companyLogoDocx;
    }
    else if (type == 'gallery'){
      object = this.galleriesDocx;
    }
    else if (type == 'certificate'){
      object = this.certficateDocx;
    }
    object.UserID = this.userProfile.UserID;
    object.ProviderID = this.userProfile.ProviderID;
    object.DocumentFileContent = null;
    object.DocumentName = null;
    object.DocumentUploadedFileType = null;
    object.DocumentID = this.docTypeId;
    object.DocumentLastStatus = this.fileStatus;
    object.FileContent = [{
      documentFileName: selectedFile.fileName,
      documentFile: selectedFile.fileBaseString,
      documentUploadedFileType: selectedFile.fileType.split('/').pop()
    }]
    return JSON.stringify(object);
  }

  async uploadDocuments(docFiles: Array<any>, type) {
    const totalDocLenght: number = docFiles.length
    for (let index = 0; index < totalDocLenght; index++) {
      try {
        const resp: JsonResponse = await this.docSendService(docFiles[index])
        if (resp.returnStatus = 'Success') {
          let resObj = JSON.parse(resp.returnText);
          this.docTypeId = resObj.DocumentID;
          this.fileStatus = resObj.DocumentLastStaus;
          let fileObj = JSON.parse(resObj.DocumentFile);
          fileObj.forEach(element => {
            element.DocumentFile = baseExternalAssets + element.DocumentFile;
          });
          if (index !== (totalDocLenght - 1)) {
            docFiles[index + 1].DocumentID = resObj.DocumentID;
            docFiles[index + 1].DocumentLastStatus = resObj.DocumentLastStaus;
          }
          // this.selectedDocx = fileObj;
          if(type == 'logo'){
            this.selectedDocxlogo = fileObj;
          }
          else if (type == 'gallery') {
            this.selectedGalleryDocx = fileObj;
          }
          else if (type == 'certificate') {
            this.selectedCertificateDocx = fileObj;
          }
          this._toastr.success("File upload successfully", "");
        }
        else {
          this._toastr.error("Error occured on upload", "");
        }
      } catch (error) {
        this._toastr.error("Error occured on upload", "");
      }
    }
  }

  async docSendService(doc: any) {
    const resp: JsonResponse = await this._basicInfoService.docUpload(doc).toPromise()
    return resp
  }


  createProfile(){
    let obj = {
      associationIds: this.assocService,
      logisticServiceIds: this.frtService,
      vasServiceIds: this.valueService,
      providerID: this.userProfile.ProviderID,
      aboutUs: this.aboutUs,
    }
    this._basicInfoService.addBusinessInfo(obj).subscribe((res:any)=>{
      if(res && res.returnStatus == 'Success'){

      }
    })
  }



}
