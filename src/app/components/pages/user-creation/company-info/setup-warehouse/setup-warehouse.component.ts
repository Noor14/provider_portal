import { Component, OnInit, ViewChild, NgZone, ElementRef, ViewEncapsulation, ChangeDetectorRef, AfterViewChecked } from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, FormGroup, Validators, FormArray, AbstractControl } from '@angular/forms';
import { WarehouseService } from './warehouse.service';
import { NgFilesService, NgFilesConfig, NgFilesStatus, NgFilesSelected } from '../../../../../directives/ng-files';
import { ToastrService } from 'ngx-toastr';
import { JsonResponse } from '../../../../../interfaces/JsonResponse';
import { DocumentFile, DocumentUpload } from '../../../../../interfaces/document.interface';
import { baseApi, baseExternalAssets } from '../../../../../constants/base.url';
import { CompanyInfoService } from '../company-info.service';
import { SharedService } from '../../../../../services/shared.service';
import { HttpErrorResponse } from '@angular/common/http';
import { UserCreationService } from '../../user-creation.service';
import { MapsAPILoader } from '@agm/core';
import { loading } from '../../../../../constants/globalFunctions';
import { NgbDateFRParserFormatter } from "../../../../../constants/ngb-date-parser-formatter";
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-setup-warehouse',
  templateUrl: './setup-warehouse.component.html',
  styleUrls: ['./setup-warehouse.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [{provide: NgbDateParserFormatter, useClass: NgbDateFRParserFormatter}],
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
export class SetupWarehouseComponent implements OnInit, AfterViewChecked {
  @ViewChild('stepper') public _stepper: any;
  @ViewChild('searchCity') public searchElement: ElementRef;

  public activeStep = 0;
  public cityList: any[] = [];
  public wareHouseCat: any[];
  public categoryIds: any[] = [];
  public whFacilitation: any[] = [];
  public warehouseId;
  public wareHouseUsageType: any[] = [];
  public warehouseFacilities: any[] = [];
  private seasonAvaiablility: any[] = [];
  public areaUnits: any[] = [];
  public weightUnits: any[] = [];
  public maxHeight: any[] = [];
  public maxRackWeight: any[] = [];
  public racking: any[] = [];
  public selectedDays: any[] = [];
  public weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  public config: NgFilesConfig = {
    acceptExtensions: ['jpeg', 'jpg', 'png', 'bmp', 'mp4', 'avi'],
    maxFilesCount: 5,
    maxFileSize: 4096000,
    totalFilesSize: 4096000
  };
  public location = {
    lat: undefined,
    lng: undefined
  };
  public selectedCity = {
    id: undefined,
    imageName: undefined,
    title: undefined,
  }
  public geoCoder;
  public zoomlevel: number = 5;
  public draggable: boolean = false;

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
  public wareHouseType: any;
  public requiredFields: string = "This field is required";
  public dropdownSettings = {
    singleSelection: false,
    idField: 'item_id',
    textField: 'item_text',
    selectAllText: 'Every Day',
    unSelectAllText: 'Every Day',
    itemsShowLimit: 3,
    allowSearchFilter: false
  };

  public minDate: any;






  //  errorFields

  public whnameError: boolean = false;
  public whAreaError: boolean = false;
  public palletRackError: boolean = false;
  public palletBulkError: boolean = false;
  public cityError: boolean = false;
  public addressline1Error: boolean = false;
  public addressline2Error: boolean = false;
  public poBoxError: boolean = false;

  constructor(
    private warehouseService: WarehouseService,
    private ngFilesService: NgFilesService,
    private _toastr: ToastrService,
    private _companyInfoService: CompanyInfoService,
    private _sharedService: SharedService,
    private _userCreationService: UserCreationService,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    private cdRef: ChangeDetectorRef,
    private _router: Router,

  ) { }
  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }
  ngOnInit() {
    let date = new Date();
    this.minDate = {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate()
    };
    this.ngFilesService.addConfig(this.config, 'docConfig');
    let userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo && userInfo.returnText) {
      this.userProfile = JSON.parse(userInfo.returnText);
      this.warehouseId = (localStorage.getItem('warehouseId')) ? localStorage.getItem('warehouseId') : 0
      this.getWarehouseInfo(this.userProfile.UserID, this.warehouseId);
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
      whavailable: new FormArray([this.createFieldsSeason()]),
    });

    this._sharedService.getLocation.subscribe((state: any) => {
      if (state && state.country) {
        this.getMapLatlng(state.country);
        // this.getplacemapLoc()
      }
    })

    this._sharedService.cityList.subscribe((state: any) => {
      this.cityList = state;
    });

  }

  errorValidate() {
    if (this.generalForm.controls.whName.status == "INVALID" && this.generalForm.controls.whName.touched) {
      this.whnameError = true;
    }
    if (this.generalForm.controls.whArea.status == "INVALID" && this.generalForm.controls.whArea.touched) {
      this.whAreaError = true;
    }
    if (this.rackStorageForm.controls.palletRack.status == "INVALID" && this.rackStorageForm.controls.palletRack.touched) {
      this.palletRackError = true;
    }
    if (this.bulkStorageForm.controls.palletBulk.status == "INVALID" && this.bulkStorageForm.controls.palletBulk.touched) {
      this.palletBulkError = true;
    }
    if (this.locationForm.controls.city.status == "INVALID" && this.locationForm.controls.city.touched) {
      this.cityError = true;
    }
    if (this.locationForm.controls.addressline1.status == "INVALID" && this.locationForm.controls.addressline1.touched) {
      this.addressline1Error = true;
    }
    if (this.locationForm.controls.addressline2.status == "INVALID" && this.locationForm.controls.addressline2.touched) {
      this.addressline2Error = true;
    }
    if (this.locationForm.controls.poBox.status == "INVALID" && this.locationForm.controls.poBox.touched) {
      this.poBoxError = true;
    }
  }


  createFields() {
    return new FormGroup({
      fromHour: new FormControl(null, Validators.required),
      toHour: new FormControl(null, Validators.required),
      days: new FormControl(null, Validators.required),
    })
  }
  createFieldsSeason() {
    return new FormGroup({
      fromdate: new FormControl(null, Validators.required),
      todate: new FormControl(null, Validators.required),
    })
  }

  addDays() {
    (this.generalForm.controls['whSchedule'] as FormArray).push(this.createFields())
  }

  addSeasons() {
    (this.wareHouseAvailableForm.controls['whavailable'] as FormArray).push(this.createFieldsSeason());
  }

  removeRow(index: number) {
    const control = <FormArray>this.generalForm.controls['whSchedule'];
    control.removeAt(index);
  }
  removeSeason(index: number) {
    const control = <FormArray>this.wareHouseAvailableForm.controls['whavailable'];
    control.removeAt(index);
  }

  onItemSelect(item: any, index, action) {
    let arrDays = this.generalForm.controls['whSchedule'].controls[index].controls['days'].value
    if (action === 'select') {
      if (arrDays) {
        arrDays.push(item)
      } else {
        arrDays = []
        arrDays.push(item)
      }
    } else if (action === 'all') {
      if (item && item.length > 0) {
        if (arrDays) {
          arrDays = item
        } else {
          arrDays = []
          arrDays = item
        }
      } else {
        arrDays = []
      }
    }
    else {
      if (arrDays) {
        const newArr = arrDays.filter(day => day !== item)
        arrDays = newArr
      }
    }
    this.generalForm.controls['whSchedule'].controls[index].controls['days'].setValue(arrDays)
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
  getmapPlace(obj) {
    this._userCreationService.getLatlng(obj.title).subscribe((res: any) => {
      if (res.status == "OK") {
        this.location = res.results[0].geometry.location;
      }
    }, (err: HttpErrorResponse) => {
      console.log(err);
    })
  }
  // getplacemapLoc() {
  //   this.mapsAPILoader.load().then(() => {
  //     this.geoCoder = new google.maps.Geocoder;
  //     let autocomplete = new google.maps.places.Autocomplete(this.searchElement.nativeElement, );
  //     autocomplete.setComponentRestrictions({ 'country': [] });
  //     autocomplete.setTypes(['(cities)']);
  //     autocomplete.addListener("place_changed", () => {
  //       this.ngZone.run(() => {
  //         //get the place result
  //         let place: google.maps.places.PlaceResult = autocomplete.getPlace();
  //         // console.log(place)
  //         this.locationForm.controls['city'].setValue(place.formatted_address);
  //         //verify result
  //         if (place.geometry === undefined || place.geometry === null) {
  //           return;
  //         }
  //         //set latitude, longitude and zoom
  //         this.location.lat = place.geometry.location.lat();
  //         this.location.lng = place.geometry.location.lng();
  //         this.zoomlevel = 14;
  //       });
  //     });
  //   });

  // }
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

  getWarehouseInfo(userID, warehouseId) {
    loading(true);
    this.warehouseService.getWarehouseData(userID, warehouseId).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        loading(false);
        this.wareHouseCat = res.returnObject.WHCategories;
        this.wareHouseUsageType = res.returnObject.WarehouseUsageType;
        this.warehouseFacilities = res.returnObject.WarehouseFacilities;
        this.areaUnits = res.returnObject.AreaUnit;
        this.weightUnits = res.returnObject.WeightUnit;
        this.maxHeight = res.returnObject.MaxHeight;
        this.racking = res.returnObject.Racking;
        this.maxRackWeight = res.returnObject.MaxRackWeight;
        this.uploadDocs = res.returnObject.documentType;
        this.activeStep = (res.returnObject.UserProfileStatus == 'Warehouse Pending') ? 1 : 0;
        this.setDefaultValue();
        if (Array.isArray(res.returnObject.UploadedGalleries) && res.returnObject.UploadedGalleries.length){
          let galleryFiles = res.returnObject.UploadedGalleries;
          if (galleryFiles[0].DocumentID && galleryFiles[0].DocumentFile){
          this.setGalleries(galleryFiles);
          }
          else{
            this.docTypeId = galleryFiles[0].DocumentID;
            this.fileStatus = "APPROVED";
          }
        }
      }
    }, (err: HttpErrorResponse) => {
      console.log(err);
      loading(false);

    })
  }
  setGalleries(galleryFiles) {
    this.selectedDocx = galleryFiles;
    this.selectedDocx.map(element => {
      element.DocumentFile = baseExternalAssets + element.DocumentFile;
    });
    this.docTypeId = this.selectedDocx[0].DocumentID;
    this.fileStatus = "APPROVED";
  }

  setDefaultValue() {
    this.categoryIds = this.wareHouseCat.filter(elem => elem.IsSelected);
    this.generalForm.controls['whAreaUnit'].setValue(this.areaUnits.filter(elem => elem.UnitTypeCode == 'sqft')[0].UnitTypeCode);
    this.rackStorageForm.controls['racking'].setValue(this.racking.filter(elem => elem.UnitTypeCode == '2 High')[0].UnitTypeCode);
    this.rackStorageForm.controls['maxHeight'].setValue(this.maxHeight.filter(elem => elem.UnitTypeCode == '4ft or less')[0].UnitTypeCode);
    this.rackStorageForm.controls['rackWeight'].setValue(this.maxRackWeight.filter(elem => elem.UnitTypeCode == '1000 kg or less')[0].UnitTypeCode);
    this.rackStorageForm.controls['rackWeightUnit'].setValue(this.weightUnits.filter(elem => elem.UnitTypeCode == 'kg')[0].UnitTypeCode);
  }
  whType(type) {
    this.wareHouseType = type;
    this.setWarehouseType();
  }

  setWarehouseType() {
    this.wareHouseUsageType.forEach(elem => {
      if (elem.UsageTypeID == this.wareHouseType.UsageTypeID) {
        elem.IsAllowed = true;
      }
      else {
        elem.IsAllowed = false;
      }
    })
  }

  categorySelection(obj, selectedCategory) {
    let selectedItem = selectedCategory.classList;
    if (this.categoryIds && this.categoryIds.length) {
      for (var i = 0; i < this.categoryIds.length; i++) {
        if (this.categoryIds[i].ShippingCatID == obj.ShippingCatID) {
          this.categoryIds.splice(i, 1);
          selectedItem.remove('active');
          return;
        }
      }

    }
    if ((this.categoryIds && !this.categoryIds.length) || (i == this.categoryIds.length)) {
      selectedItem.add('active');
      this.categoryIds.push(obj);
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
  setfacilitation() {
    this.warehouseFacilities.forEach(elem => elem.IsAllowed = false);
    if (this.whFacilitation.length) {
      for (let i = 0; i < this.warehouseFacilities.length; i++) {
        for (let y = 0; y < this.whFacilitation.length; y++) {
          if (this.whFacilitation[y].FacilitiesTypeID == this.warehouseFacilities[i].FacilitiesTypeID) {
            this.warehouseFacilities[i].IsAllowed = true;
          }
        }
      }
    }
  }

  mindate() {
    if (this.wareHouseAvailableForm.value.whavailable.length == 1) {
      return this.minDate;
    }
    else {
      let index = this.wareHouseAvailableForm.value.whavailable.length - 2;
      return this.minDate = this.wareHouseAvailableForm.value.whavailable[index].todate;
    }
  }



  addCategory() {
    let obj = {
      whid: (this.warehouseId != "null" && this.warehouseId) ? this.warehouseId : -1,
      providerID: this.userProfile.ProviderID,
      whCategories: this.categoryIds
    };
    this.warehouseService.addWarehouse(obj).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        this._stepper.next();
        this.warehouseId = res.returnId;
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
    this.wareHouseAvailableForm.value.whavailable.forEach(elem => {
      if ((elem.fromdate && Object.keys(elem.fromdate).length) && (elem.todate && Object.keys(elem.todate).length)) {
        let obj = {
          AvailableFromDate: elem.fromdate.month + '/' + elem.fromdate.day + '/' + elem.fromdate.year,
          AvailableToDate: elem.todate.month + '/' + elem.todate.day + '/' + elem.todate.year
        }
        this.seasonAvaiablility.push(obj);
      }
    });
    let obj = {
      whid: this.warehouseId,
      providerID: this.userProfile.ProviderID,
      whName: this.generalForm.value.whName,
      whAddress: this.locationForm.value.addressline1,
      whAddress2: this.locationForm.value.addressline2,
      whPOBoxNo: this.locationForm.value.poBox,
      countryID: this.locationForm.value.city.desc[0].CountryID,
      cityID: this.locationForm.value.city.id,
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
        }, {
          DayName: "Wednesday",
          OpeningTime: "09:00 am",
          ClosingTime: "09:00 pm",
          IsClosed: false
        }, {
          DayName: "Thursday",
          OpeningTime: "09:00 am",
          ClosingTime: "09:00 pm",
          IsClosed: false
        }, {
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
      whAvailability: this.seasonAvaiablility

    }
    this.warehouseService.putWarehouseInfo(obj).subscribe((res: any) => {
      if (res.returnStatus == 'Success') {
        console.log(res);
        loading(false);
        this._router.navigate(['warehouse-list'])
        // this._stepper.next();
      }
    })
  }
  selectDocx(selectedFiles: NgFilesSelected): void {
    if (selectedFiles.status !== NgFilesStatus.STATUS_SUCCESS) {
      if (selectedFiles.status == 1) this._toastr.error('Please select only five files to upload.', '')
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
            if (event.files.length <= this.config.maxFilesCount) {
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
          this.docTypeId = resObj.DocumentID;
          this.fileStatus = resObj.DocumentLastStaus;
          let fileObj = JSON.parse(resObj.DocumentFile);
          fileObj.forEach(element => {
            element.DocumentFile = baseExternalAssets + element.DocumentFile;
          });
          if (index !== (totalDocLenght - 1)) {
            docFiles[index + 1].DocumentID = resObj.DocumentID
            docFiles[index + 1].DocumentLastStatus = resObj.DocumentLastStaus
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

  removeSelectedDocx(index, obj) {
    obj.DocumentFile = obj.DocumentFile.split(baseExternalAssets).pop();
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

  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      map(term => (!term || term.length < 3) ? []
        : this.cityList.filter(v => v.title.toLowerCase().indexOf(term.toLowerCase()) > -1))
    )
  formatter = (x: { title: string }) => x.title;

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


