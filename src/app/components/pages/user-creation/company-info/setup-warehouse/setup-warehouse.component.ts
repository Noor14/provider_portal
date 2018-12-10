import { Component, OnInit, ViewChild } from '@angular/core';
import { WarehouseService } from './warehouse.service';
import { NgFilesService, NgFilesConfig, NgFilesStatus, NgFilesSelected } from '../../../../../directives/ng-files';
import { ToastrService } from 'ngx-toastr';
import { JsonResponse } from '../../../../../interfaces/JsonResponse';
import { DocumentFile } from '../../../../../interfaces/document.interface';
import { baseApi } from '../../../../../constants/base.url';
import { CompanyInfoService } from '../company-info.service';

@Component({
  selector: 'app-setup-warehouse',
  templateUrl: './setup-warehouse.component.html',
  styleUrls: ['./setup-warehouse.component.scss']
})
export class SetupWarehouseComponent implements OnInit {
  @ViewChild('stepper') public _stepper: any;
  public wareHouseCat: any[];
  public categoryIds: any[] = [];  
  public warehouseId;
  public wareHouseUsageType: any[] =[];
  public warehouseFacilities: any[] = [];
  public areaUnits: any[] = [];
  public weightUnits: any[] = [];
  public maxHeight: any[] = [];
  public racking: any[] = [];
  public weekDays=['Monday, Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  private config: NgFilesConfig = {
    acceptExtensions: ['jpeg', 'jpg', 'png', 'pdf', 'bmp'],
    maxFilesCount: 1,
    maxFileSize: 4096000,
    totalFilesSize: 4096000
  };
  public location = {
    lat: undefined,
    lng: undefined
  }
  public zoomlevel: number = 5;
  
  constructor(
    private warehouseService: WarehouseService,
    private ngFilesService: NgFilesService,
    private _toastr: ToastrService,
    private _companyInfoService: CompanyInfoService
    
  ) { }

  ngOnInit() {
    this.ngFilesService.addConfig(this.config, 'docConfig');
    this.getWarehouseInfo();
  }

  getWarehouseInfo() {
    this.warehouseService.getWarehouseData(this.warehouseId = 0).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        this.wareHouseCat = res.returnObject.WHCategories;
        this.wareHouseUsageType = res.returnObject.WarehouseUsageType; 
        this.warehouseFacilities = res.returnObject.WarehouseFacilities;
        this.areaUnits = res.returnObject.AreaUnit;
        this.weightUnits = res.returnObject.WeightUnit;
        this.maxHeight = res.returnObject.MaxHeight;
        this.racking = res.returnObject.Racking;
      }
    })
  }

  categorySelection(obj, selectedCategory) {
    let selectedItem = selectedCategory.classList;
    if (this.categoryIds && this.categoryIds.length) {
      for (var i = 0; i < this.categoryIds.length; i++) {
        if (this.categoryIds[i].shippingCatID == obj.ShippingCatID) {
          this.categoryIds.splice(i, 1);
          selectedItem.remove('active');
          return;
        }
      }

    }
    if ((this.categoryIds && !this.categoryIds.length) || (i == this.categoryIds.length)) {
      selectedItem.add('active');
      this.categoryIds.push({shippingCatID: obj.ShippingCatID});
    }

  }


  addCategory(){
    let obj = {
      whid: (this.warehouseId) ? this.warehouseId : -1,
      whCategories: this.categoryIds
    };
    this.warehouseService.addWarehouse(obj).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        this._stepper.next();
        localStorage.setItem('warehouseId', res.returnObject);
      }
    })
  }

  SelectDocx(selectedFiles: NgFilesSelected, type): void {

      if (selectedFiles.status !== NgFilesStatus.STATUS_SUCCESS) {
        if (selectedFiles.status == 1) this._toastr.error('Please select only one (1) file to upload.', '')
        else if (selectedFiles.status == 2) this._toastr.error('File size should not exceed 4 MB. Please upload smaller file.', '')
        else if (selectedFiles.status == 4) this._toastr.error('File format is not supported. Please upload supported format file.', '')
        return;
      } else {
        try {
          this.onFileChange(selectedFiles);
        } catch (error) {
          console.log(error);
        }
      }

  }
  onFileChange(event) {

    let flag = 0

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
            console.log('you file content:', selectedFile);

            // if (this.selectedDocx && this.selectedDocx.length && event.files.length > 1 && index == 0) {
            //   this._toastr.error('Please select only two file to upload', '');
            //   return;
            // } else if (this.selectedDocx && this.selectedDocx.length < 2) {
            //   const docFile = this.generateDocObject(selectedFile);
            //   allDocsArr.push(docFile);
            //   flag++
            //   if (flag === fileLenght) {
            //     this.uploadDocuments(allDocsArr)
            //   }
            // }
            // else {
            //   this._toastr.error('Please select only two file to upload', '');
            // }
          }
        }
      }
      catch (err) {
        console.log(err);
      }
    }

  }
  // generateDocObject(selectedFile): any {
  //   let object = this.docTypes.find(Obj => Obj.DocumentTypeID == this.docxId);
  //   object.UserID = this.userProfile.UserID;
  //   object.ProviderID = this.userProfile.ProviderID;
  //   object.DocumentFileContent = null;
  //   object.DocumentName = null;
  //   object.DocumentUploadedFileType = null;
  //   object.DocumentID = this.docTypeId;
  //   object.FileContent = [{
  //     documentFileName: selectedFile.fileName,
  //     documentFile: selectedFile.fileBaseString,
  //     documentUploadedFileType: selectedFile.fileType.split('/').pop()
  //   }]
  //   return object;
  // }

  // async uploadDocuments(docFiles: Array<any>) {
  //   const totalDocLenght: number = docFiles.length
  //   for (let index = 0; index < totalDocLenght; index++) {
  //     try {
  //       const resp: JsonResponse = await this.docSendService(docFiles[index])
  //       if (resp.returnStatus = 'Success') {
  //         let resObj = JSON.parse(resp.returnText);
  //         this.docTypeId = resObj.DocumentID;
  //         let fileObj = JSON.parse(resObj.DocumentFile);
  //         fileObj.forEach(element => {
  //           element.DocumentFile = baseApi.split("/api").shift() + element.DocumentFile;
  //         });
  //         if (index !== (totalDocLenght - 1)) {
  //           docFiles[index + 1].DocumentID = resObj.DocumentID
  //         }
  //         this.selectedDocx = fileObj;
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
  //   const resp: JsonResponse = await this._companyInfoService.docUpload(doc).toPromise()
  //   return resp
  // }


  backToCategory(){
    this.warehouseId = localStorage.getItem('warehouseId');
    this._stepper.prev();
    
  }
}
