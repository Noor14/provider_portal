import { Component, OnInit, ViewChild, NgZone, ElementRef, ViewEncapsulation } from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';
import { FormControl, FormGroup, Validators, FormArray, AbstractControl } from '@angular/forms';
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
import { loading } from '../../../../../constants/globalFunctions';

@Component({
  selector: 'app-setup-warehouse',
  templateUrl: './setup-warehouse.component.html',
  styleUrls: ['./setup-warehouse.component.scss'],
  encapsulation: ViewEncapsulation.None,
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
  public wareHouseUsageType: any[] = [];
  public warehouseFacilities: any[] = [];
  public areaUnits: any[] = [];
  public weightUnits: any[] = [];
  public maxHeight: any[] = [];
  public maxRackWeight: any[] = [];
  public racking: any[] = [];
  public weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  private config: NgFilesConfig = {
    acceptExtensions: ['jpeg', 'jpg', 'png', 'bmp', 'mp4', 'avi'],
    maxFilesCount: 5,
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
  public docTypeId = undefined;
  public fileStatus = undefined;
  public selectedDocx: any[] = [];
  public locationForm;
  public rackStorageForm;
  public bulkStorageForm
  public generalForm;
  public wareHouseAvailableForm;

  public userProfile;
  public wareHouseType :any;
  public requiredFields: string = "This field is required";
  public dropdownSettings = {
    singleSelection: false,
    idField: 'item_id',
    textField: 'item_text',
    selectAllText: 'Every Day',
    unSelectAllText: 'Every Day',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };


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
      this.getWarehouseInfo(this.warehouseId, this.userProfile.UserID);
    }
    this.locationForm = new FormGroup({
      city: new FormControl(null, [Validators.required, Validators.maxLength(100), Validators.minLength(3), Validators.pattern(/^(?=.*?[a-zA-Z])[^%*$=+^<>}{]+$/)]),
      addressline1: new FormControl(null, [Validators.required, Validators.maxLength(200), Validators.minLength(10), Validators.pattern(/^(?=.*?[a-zA-Z])[^%*$=+^<>}{]+$/)]),
      addressline2: new FormControl(null, [Validators.maxLength(200), Validators.minLength(10), Validators.pattern(/^(?=.*?[a-zA-Z])[^%*$=+^<>}{]+$/)]),
      poBox: new FormControl(null, [Validators.required, Validators.maxLength(16), Validators.minLength(4)]),
    });
    this.rackStorageForm = new FormGroup({
      palletRack: new FormControl(null, [rackValidator.bind(this), Validators.maxLength(3), Validators.minLength(1), Validators.pattern(/^\d+$/)]),
      racking: new FormControl(null, [rackValidator.bind(this), Validators.maxLength(200), Validators.minLength(1)]),
      maxHeight: new FormControl(null, [Validators.maxLength(200), Validators.minLength(1)]),
      rackWeight: new FormControl(null, [rackValidator.bind(this), Validators.maxLength(100), Validators.minLength(1)]),
      rackWeightUnit: new FormControl(null, [rackValidator.bind(this), Validators.maxLength(5), Validators.minLength(2)]),
    });
    this.bulkStorageForm = new FormGroup({
      palletBulk: new FormControl(null, [bulkValidator.bind(this), Validators.maxLength(100), Validators.minLength(5), Validators.pattern(/^\d+$/)]),
    });
    this.generalForm = new FormGroup({
      whName: new FormControl(null, [Validators.required, Validators.maxLength(50), Validators.minLength(5), Validators.pattern(/^(?=.*?[a-zA-Z])[^.]+$/)]),
      whArea: new FormControl(null, [Validators.required, Validators.maxLength(6), Validators.minLength(3), Validators.pattern(/^\d+$/)]),
      whAreaUnit: new FormControl(null, [Validators.required, Validators.maxLength(5), Validators.minLength(2)]),
      whSchedule: new FormArray([this.createFields()]),
    });
    this.wareHouseAvailableForm = new FormGroup({
      fromdate: new FormControl(null, Validators.required),
      todate: new FormControl(null, Validators.required),
    });

    this._sharedService.getLocation.subscribe((state: any) => {
      if (state && state.country) {
        this.getMapLatlng(state.country);
        this.getplacemapLoc()
      }
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
      let autocomplete = new google.maps.places.Autocomplete(this.searchElement.nativeElement, );
      autocomplete.setComponentRestrictions({ 'country': [] });
      autocomplete.setTypes(['(cities)']);
      autocomplete.addListener("place_changed", () => {
        this.ngZone.run(() => {
          //get the place result
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();
          // console.log(place)
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
        this.maxRackWeight = res.returnObject.MaxRackWeight;
        this.uploadDocs = res.returnObject.documentType;

        this.setDefaultValue();
      }
    })
  }

  setDefaultValue(){
    this.generalForm.controls['whAreaUnit'].setValue(this.areaUnits.filter(elem => elem.UnitTypeCode == 'sqft')[0].UnitTypeCode);
    this.rackStorageForm.controls['racking'].setValue(this.racking.filter(elem => elem.UnitTypeCode == '2 High')[0].UnitTypeCode);
    this.rackStorageForm.controls['maxHeight'].setValue(this.maxHeight.filter(elem => elem.UnitTypeCode == '4ft or less')[0].UnitTypeCode);
    this.rackStorageForm.controls['rackWeight'].setValue(this.maxRackWeight.filter(elem => elem.UnitTypeCode == '1000 kg or less')[0].UnitTypeCode); 
    this.rackStorageForm.controls['rackWeightUnit'].setValue(this.weightUnits.filter(elem => elem.UnitTypeCode == 'kg')[0].UnitTypeCode); 
  }
  whType(type){
    this.wareHouseType = type;
    this.setWarehouseType();
  }

  setWarehouseType(){
    this.wareHouseUsageType.forEach(elem => {
      if (elem.UsageTypeID == this.wareHouseType.UsageTypeID){
        elem.IsAllowed = true;
      }
      else{
        elem.IsAllowed = false;
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
      this.categoryIds.push({ shippingCatID: obj.ShippingCatID });
    }

  }

  wareHouseFacilitation(service) {
    if (this.whFacilitation && this.whFacilitation.length) {
      for (var i = 0; i < this.whFacilitation.length; i++) {
        if (this.whFacilitation[i].FacilitiesTypeID == service.FacilitiesTypeID) {
          this.whFacilitation.splice(i, 1);
          this.setfacilitation()
          return;
        }
      }
    }
    if ((this.whFacilitation && !this.whFacilitation.length) || (i == this.whFacilitation.length)) {
      this.whFacilitation.push(service);
      this.setfacilitation()
    }
  }
  setfacilitation(){
    this.warehouseFacilities.forEach(elem => elem.IsAllowed = false);
    if (this.whFacilitation.length){
      for (let i = 0; i < this.warehouseFacilities.length; i++) {
        for (let y = 0; y < this.whFacilitation.length ; y++) {
        if (this.whFacilitation[y].FacilitiesTypeID == this.warehouseFacilities[i].FacilitiesTypeID){
          this.warehouseFacilities[i].IsAllowed = true;
        }
      }
    }
    }
  }

  addCategory() {
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
  putWarehouseInfo() {
    loading(true);
    let rackStorageObj = {
      IsAvailable: this.rackedStorage,
      Qty: this.rackStorageForm.value.palletRack,
      Racking: this.rackStorageForm.value.racking,
      MH: this.rackStorageForm.value.maxHeight,
      MW: this.rackStorageForm.value.rackWeight,
      MWUnit: this.rackStorageForm.value.rackWeightUnit
    };
    let bulkStorageObj = {
      isAvailable: this.bulkStorage,
      qty: this.rackStorageForm.value.palletBulk
    };
    let obj = {
      whid: this.warehouseId,
      providerID: this.userProfile.providerID,
      whName: this.generalForm.value.whName,
      whAddress: this.locationForm.value.addressline1,
      whAddress2: this.locationForm.value.addressline2,
      whPOBoxNo: this.locationForm.value.poBox,
      countryID: 100,
      cityID: 100,
      gLocID: null,
      latitude: this.location.lat,
      longitude: this.location.lng,
      createdBy: this.userProfile.PrimaryEmail,
      totalCoveredArea: this.generalForm.value.whArea,
      totalCoveredAreaUnit: this.generalForm.value.whAreaUnit,
      warehouseUsageType: this.wareHouseUsageType,
      warehouseFacilities: this.warehouseFacilities,
      warehouseTimings: [
        {
          DayName: "Monday",
          OpeningTime: "09:00 am",
          ClosingTime: "09:00 pm",
          IsClosed: true
        },
        {
          DayName: "Tuesday",
          OpeningTime: "09:00 am",
          ClosingTime: "09:00 pm",
          IsClosed: true
        },        {
          DayName: "Wednesday",
          OpeningTime: "09:00 am",
          ClosingTime: "09:00 pm",
          IsClosed: false
        },        {
          DayName: "Thursday",
          OpeningTime: "09:00 am",
          ClosingTime: "09:00 pm",
          IsClosed: false
        },        {
          DayName: "Friday",
          OpeningTime: "09:00 am",
          ClosingTime: "09:00 pm",
          IsClosed: true
        },
        {
          DayName: "Saturday",
          OpeningTime: "09:00 am",
          ClosingTime: "09:00 pm",
          IsClosed: false
        },
        {
          DayName: "Sunday",
          OpeningTime: "09:00 am",
          ClosingTime: "09:00 pm",
          IsClosed: false
        }
      ],
      warehouseRackedStorage: (this.rackedStorage) ? rackStorageObj : null,
      warehouseBulkStorage: (this.bulkStorage) ? bulkStorageObj : null,
      whAvailability: [
        {
          AvailableFromDate: this.wareHouseAvailableForm.value.fromdate.month + '/' + this.wareHouseAvailableForm.value.fromdate.day + '/' + this.wareHouseAvailableForm.value.fromdate.year,
          AvailableToDate: this.wareHouseAvailableForm.value.todate.month + '/' + this.wareHouseAvailableForm.value.todate.day + '/' + this.wareHouseAvailableForm.value.todate.year
        }
      ]

    }
    this.warehouseService.PutwarehouseInfo(obj).subscribe((res: any) => {
      if (res.returnStatus == 'Success') {
        console.log(res);
        loading(false);
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
              const docFile = JSON.parse(this.generateDocObject(selectedFile));
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
    let toUpload = this.uploadDocs
    toUpload.UserID = this.userProfile.UserID;
    toUpload.ProviderID = this.userProfile.ProviderID;
    toUpload.WHID = this.warehouseId;
    toUpload.DocumentID = this.docTypeId;
    toUpload.DocumentLastStatus = this.fileStatus;
    toUpload.DocumentFileContent = null;
    toUpload.DocumentName = null;
    toUpload.DocumentUploadedFileType = null;
    toUpload.FileContent = [{
      documentFileName: selectedFile.fileName,
      documentFile: selectedFile.fileBaseString,
      documentUploadedFileType: selectedFile.fileType.split('/').pop()
    }]
    return JSON.stringify(toUpload)
  }

  async uploadDocuments(docFiles: Array<any>) {
    const totalDocLenght: number = docFiles.length
    for (let index = 0; index < totalDocLenght; index++) {
      try {
        const resp: JsonResponse = await this.docSendService(docFiles[index])
        if (resp.returnStatus = 'Success') {
          let resObj = JSON.parse(resp.returnText);
          console.log(resObj)
          this.docTypeId = resObj.DocumentID;
          this.fileStatus = resObj.DocumentLastStaus;
          let fileObj = JSON.parse(resObj.DocumentFile);
          fileObj.forEach(element => {
            element.DocumentFile = baseApi.split("/api").shift() + element.DocumentFile;
          });
          if (index !== (totalDocLenght - 1)) {
            docFiles[index + 1].DocumentID = resObj.DocumentID
          }
          this.selectedDocx = fileObj;
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

  removeSelectedDocx(index, file) {
    this.removeDoc(file, index)
  }
  removeDoc(obj, index) {
    obj.DocumentFile = obj.DocumentFile.split(baseApi.split("/api").shift()).pop();
    obj.DocumentID = this.docTypeId;
    this._companyInfoService.removeDoc(obj).subscribe((res: any) => {
      if (res.returnStatus == 'Success') {
        this._toastr.success('Remove selected document succesfully', "");
        this.selectedDocx.splice(index, 1);
      }
      else {
        this._toastr.error('Error Occured', "");
      }
    }, (err: HttpErrorResponse) => {
      console.log(err);
    })
  }

  numberValid(evt) {
    let charCode = (evt.which) ? evt.which : evt.keyCode
    if (charCode > 31 && (charCode < 48 || charCode > 57))
      return false;
    return true;
  }


  backToCategory() {
    this.warehouseId = localStorage.getItem('warehouseId');
    this._stepper.prev();
  }



}


export function rackValidator(control: AbstractControl) {
  if (this.rackedStorage) {
    if (!control.value) {
      return {
        required: true
      }
    }
  }
};
export function bulkValidator(control: AbstractControl) {
  if (this.bulkStorage) {
    if (!control.value) {
      return {
        required: true
      }
    }
  }
};


