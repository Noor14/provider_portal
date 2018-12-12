import { Component, OnInit, ViewChild, NgZone, ElementRef } from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';
import { FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { WarehouseService } from './warehouse.service';
import { NgFilesService, NgFilesConfig, NgFilesStatus, NgFilesSelected } from '../../../../../directives/ng-files';
import { ToastrService } from 'ngx-toastr';
import { JsonResponse } from '../../../../../interfaces/JsonResponse';
import { DocumentFile, DocumentUpload } from '../../../../../interfaces/document.interface';
import { baseApi } from '../../../../../constants/base.url';
import { CompanyInfoService } from '../company-info.service';
import { SharedService } from '../../../../../services/shared.service';
import { HttpErrorResponse } from '@angular/common/http';
import { UserCreationService } from '../../user-creation.service';
import { MapsAPILoader } from '@agm/core';

@Component({
  selector: 'app-setup-warehouse',
  templateUrl: './setup-warehouse.component.html',
  styleUrls: ['./setup-warehouse.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [   // :enter is alias to 'void => *'
        style({ opacity: 0 }),
        animate(500, style({ opacity: 1 }))
      ]),
      transition(':leave', [   // :leave is alias to '* => void'
        animate(500, style({ opacity: 0 }))
      ])
    ])
  ]
})
export class SetupWarehouseComponent implements OnInit {
  @ViewChild('stepper') public _stepper: any;
  @ViewChild('searchCity') public searchElement: ElementRef;
  public wareHouseCat: any[];
  public categoryIds: any[] = [];  
  public whFacilitation: any[] = [];  
  public warehouseId;
  public wareHouseUsageType: any[] =[];
  public warehouseFacilities: any[] = [];
  public areaUnits: any[] = [];
  public weightUnits: any[] = [];
  public maxHeight: any[] = [];
  public racking: any[] = [];
  public weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  private config: NgFilesConfig = {
    acceptExtensions: ['jpeg', 'jpg', 'png', 'bmp','mp4', 'avi'],
    maxFilesCount: 1,
    maxFileSize: 4096000,
    totalFilesSize: 4096000
  };
  public location = {
    lat: undefined,
    lng: undefined
  };
  public geoCoder;
  public zoomlevel: number = 5;
  public draggable: boolean = true;

  public rackedStorage: boolean = false;
  public bulkStorage: boolean = false;
  public uploadDocs: any;
  public docTypeId= undefined;
  public selectedDocx:any[]=[];
  public locationForm;
  public capacityDetailForm;
  public generalForm;
  public wareHouseAvailableForm;

  public userProfile;

  public dropdownSettings = {
  singleSelection: false,
  idField: 'item_id',
  textField: 'item_text',
  selectAllText: 'Every Day',
  unSelectAllText: 'Every Day',
  itemsShowLimit: 3,
  allowSearchFilter: true
};
  public selectedDays:any[] = [];

  constructor(
    private warehouseService: WarehouseService,
    private ngFilesService: NgFilesService,
    private _toastr: ToastrService,
    private _companyInfoService: CompanyInfoService,
    private _sharedService: SharedService,
    private _userCreationService: UserCreationService,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    
  ) { }

  ngOnInit() {
    this.ngFilesService.addConfig(this.config, 'docConfig');
    let userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo && userInfo.returnText) {
      this.userProfile = JSON.parse(userInfo.returnText);
      this.warehouseId = localStorage.getItem('warehouseId');
      this.getDocType(this.userProfile.CountryID);
      this.getWarehouseInfo(this.warehouseId, this.userProfile.UserID);
    }
    this.locationForm = new FormGroup({
      city: new FormControl(null, [Validators.required, Validators.maxLength(100), Validators.minLength(3)]),
      addressline1: new FormControl(null, [Validators.required, Validators.maxLength(200), Validators.minLength(10)]),
      addressline2: new FormControl(null, [Validators.maxLength(200), Validators.minLength(10)]),
      poBox: new FormControl(null, [Validators.required, Validators.maxLength(16), Validators.minLength(4)]),
    });
    this.capacityDetailForm = new FormGroup({
      palletRack: new FormControl(null, [Validators.required, Validators.maxLength(100), Validators.minLength(1)]),
      palletBulk: new FormControl(null, [Validators.maxLength(100), Validators.minLength(1)]),
      racking: new FormControl(null, [Validators.required, Validators.maxLength(200), Validators.minLength(1)]),
      maxHeight: new FormControl(null, [Validators.maxLength(200), Validators.minLength(1)]),
      rackWeight: new FormControl(null, [Validators.required, Validators.maxLength(100), Validators.minLength(1)]),
      rackWeightUnit: new FormControl(null, [Validators.required, Validators.maxLength(5), Validators.minLength(2)]),
    });
    this.generalForm = new FormGroup({
      whName: new FormControl(null, [Validators.required, Validators.maxLength(100), Validators.minLength(3)]),
      whArea: new FormControl(null, [Validators.required, Validators.maxLength(200), Validators.minLength(1)]),
      whAreaUnit: new FormControl(null, [Validators.required, Validators.maxLength(5), Validators.minLength(2)]),
      // whUsageType: new FormControl(null, [Validators.required]),
      whSchedule: new FormArray([this.createFields()]),
      });
    this.wareHouseAvailableForm = new FormGroup({
      fromHour: new FormControl(null, Validators.required),
      fromHourFormat:new FormControl(null, Validators.required),
      toHour:new FormControl(null, Validators.required),
      toHourFormat:new FormControl(null, Validators.required)
    });

    this._sharedService.getLocation.subscribe((state: any) => {
      if (state && state.country) {
        this.getMapLatlng(state.country);
        this.getplacemapLoc()
      }
    })

  }
  getDocType(id) {
    this._companyInfoService.getDocByCountrytype('provider', 0, id).subscribe((res: any) => {
      if (res.returnStatus == 'Success') {
        this.uploadDocs = res.returnObject.filter(element => element.DocumentDesc == "Warehouse Gallery")
      }
    }, (err: HttpErrorResponse) => {
      console.log(err);
    })
  }
  createFields() {
    return new FormGroup({
      fromHour: new FormControl(null),
      toHour: new FormControl(null),
      days: new FormControl(null),
    })
  }
  addDays() {
    (this.generalForm.controls['whSchedule'] as FormArray).push(this.createFields())
  }

  removeRow(index: number) {
    const control = <FormArray>this.generalForm.controls['whSchedule'];
    control.removeAt(index);
  }
  onItemSelect(item: any) {
    console.log(item);
  }
  onSelectAll(items: any) {
    console.log(items);
  }
  getMapLatlng(region) {
    this._userCreationService.getLatlng(region).subscribe((res: any) => {
      if (res.status == "OK") {
        this.location = res.results[0].geometry.location;
      }
    }, (err: HttpErrorResponse) => {
      console.log(err);
    })
  }
    getplacemapLoc() {
    this.mapsAPILoader.load().then(() => {
      this.geoCoder = new google.maps.Geocoder;
      let autocomplete = new google.maps.places.Autocomplete(this.searchElement.nativeElement,);
      autocomplete.setComponentRestrictions({ 'country': []});
      autocomplete.setTypes(['(cities)']);
      autocomplete.addListener("place_changed", () => {
        this.ngZone.run(() => {
          //get the place result
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();
          console.log(place)
          this.locationForm.controls['city'].setValue(place.formatted_address);
          //verify result
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }
          //set latitude, longitude and zoom
          this.location.lat = place.geometry.location.lat();
          this.location.lng = place.geometry.location.lng();
          this.zoomlevel = 14;
        });
      });
    });

  }
  markerDragEnd($event) {
    // console.log($event);
    this.geoCoder.geocode({ 'location': { lat: $event.coords.lat, lng: $event.coords.lng } }, (results, status) => {
      console.log(results);
      console.log(status);
      if (status === 'OK') {
        if (results[0]) {
          // console.log('aaaa');
          console.log(results[0].formatted_address);
          this.locationForm.controls['city'].setValue(results[0].formatted_address);
          // infowindow.setContent(results[0].formatted_address);
        } else {
          this._toastr.error('No results found', '');
        }
      } else {
        this._toastr.error('Geocoder failed due to: ' + status, '');
      }

    });
  }
  getWarehouseInfo(warehouseId, userID) {
    this.warehouseService.getWarehouseData(warehouseId = 0, userID).subscribe((res: any) => {
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

  wareHouseFacilitation(service){
    if (this.whFacilitation && this.whFacilitation.length) {
      for (var i = 0; i < this.whFacilitation.length; i++) {
        if (this.whFacilitation[i].FacilitiesTypeID == service.FacilitiesTypeID) {
          this.whFacilitation.splice(i, 1);
          return;
        }
      }
    }
    if ((this.whFacilitation && !this.whFacilitation.length) || (i == this.whFacilitation.length)) {
      this.whFacilitation.push(service)
    }
    console.log(this.whFacilitation)
  }

  addCategory(){
    let obj = {
      whid: (this.warehouseId != "null" && this.warehouseId) ? this.warehouseId : -1,
      whCategories: this.categoryIds
    };
    this.warehouseService.addWarehouse(obj).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        this._stepper.next();
        localStorage.setItem('warehouseId', res.returnId);
      }
    })
  }
  putWarehouseInfo(){
    let obj={

    }
    this.warehouseService.PutwarehouseInfo(obj).subscribe((res:any)=>{
      if(res.returnStatus=='Success'){
        console.log(res);
        this._stepper.next();
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
             if (event.files.length <= 4) {
              const docFile = this.generateDocObject(selectedFile);
              allDocsArr.push(docFile);
              flag++
              if (flag === fileLenght) {
                this.uploadDocuments(allDocsArr)
              }
            }
            else {
              this._toastr.error('Please select only four file to upload', '');
            }
          }
        }
      }
      catch (err) {
        console.log(err);
      }
    }

  }
  generateDocObject(selectedFile): any {
    let object = this.uploadDocs;
    object.UserID = this.userProfile.UserID;
    object.ProviderID = this.userProfile.ProviderID;
    object.DocumentFileContent = null;
    object.DocumentName = null;
    object.DocumentUploadedFileType = null;
    object.DocumentID = this.docTypeId;
    object.FileContent = [{
      documentFileName: selectedFile.fileName,
      documentFile: selectedFile.fileBaseString,
      documentUploadedFileType: selectedFile.fileType.split('/').pop()
    }]
    return object;
  }

  async uploadDocuments(docFiles: Array<any>) {
    const totalDocLenght: number = docFiles.length
    for (let index = 0; index < totalDocLenght; index++) {
      try {
        const resp: JsonResponse = await this.docSendService(docFiles[index])
        if (resp.returnStatus = 'Success') {
          let resObj = JSON.parse(resp.returnText);
          this.docTypeId = resObj.DocumentID;
          let fileObj = JSON.parse(resObj.DocumentFile);
          fileObj.forEach(element => {
            element.DocumentFile = baseApi.split("/api").shift() + element.DocumentFile;
          });
          if (index !== (totalDocLenght - 1)) {
            docFiles[index + 1].DocumentID = resObj.DocumentID
          }
          this.selectedDocx = fileObj;
          console.log(this.selectedDocx, 'njo')
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
    const resp: JsonResponse = await this._companyInfoService.docUpload(doc).toPromise()
    return resp
  }


  backToCategory(){
    this.warehouseId = localStorage.getItem('warehouseId');
    this._stepper.prev();
  }
}
