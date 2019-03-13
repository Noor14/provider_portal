import { Component, OnInit, OnDestroy, ViewChild, NgZone, ViewEncapsulation } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MapsAPILoader } from '@agm/core';
import { } from 'googlemaps';
import { loading } from '../../../../constants/globalFunctions';
import { Observable, Subject } from 'rxjs';
import { WarehouseService } from '../manage-rates/warehouse-list/warehouse.service';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, Validators, FormArray, AbstractControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { UserCreationService } from '../../user-creation/user-creation.service';
import { SharedService } from '../../../../services/shared.service';
import { NgFilesService, NgFilesConfig, NgFilesStatus, NgFilesSelected } from '../../../../directives/ng-files';
import { DocumentFile } from '../../../../interfaces/document.interface';
import { JsonResponse } from '../../../../interfaces/JsonResponse';
import { BasicInfoService } from '../../user-creation/basic-info/basic-info.service';
import { baseExternalAssets } from '../../../../constants/base.url';

@Component({
  selector: 'app-warehouse',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './warehouse.component.html',
  styleUrls: ['./warehouse.component.scss']
})
export class WarehouseComponent implements OnInit, OnDestroy {

  @ViewChild('stepper') public _stepper: any;
  @ViewChild('searchElement') public searchElement: any;
  public zoomlevel: number = 5;
  private whID: any;
  private userProfile: any
  public warehouseTypeFull: boolean = true;
  public leaseTerm: any[] = [];
  public units: any[] = [];
  public facilities: any[] = [];
  public warehouseUsageType: any[] = [];
  public ceilingsHeight: any[] = [];
  public cityList: any[] = [];
  public currencyList: any[] = [];
  public selectedMiniLeaseTerm: any;
  private paramSubscriber: any;
  public isRealEstate:boolean = false;
  public fixedAmount = true

  //generalForm
  public generalForm: any;

  // locationForm
  public locationForm: any;

  // propertyDetailForm
  public propertyDetailForm: any;

  //commisionForm
  public commisionForm:any

  //map working
  public location: any = { lat: undefined, lng: undefined };
  public draggable: boolean = true;

  public geoCoder: any;


  // gallery
  private fileStatus = undefined;
  private docTypeId = null;
  public uploadedGalleries: any[] = [];
  public warehouseDocx: any;

  public config: NgFilesConfig = {
    acceptExtensions: ['jpg', 'png', 'bmp'],
    maxFilesCount: 12,
    maxFileSize: 12 * 1024 * 1000,
    totalFilesSize: 12 * 12 * 1024 * 1000
  };

  constructor(
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    private _router: ActivatedRoute,
    private _warehouseService: WarehouseService,
    private _toastr: ToastrService,
    private _sharedService: SharedService,
    private _userCreationService: UserCreationService,
    private _basicInfoService: BasicInfoService,
    private ngFilesService: NgFilesService,

  ) { }

  ngOnInit() {
    this.ngFilesService.addConfig(this.config, 'config');
    let userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo && userInfo.returnText) {
      this.userProfile = JSON.parse(userInfo.returnText);
    }
    this.paramSubscriber = this._router.params.subscribe(params => {
      this.whID = params['id'];
      // (+) converts string 'id' to a number
      if (this.whID) {
        this.getWareHouseDetail(this.userProfile.ProviderID, this.whID);
      }
    });

    this.generalForm = new FormGroup({
      whName: new FormControl(null, [Validators.required, Validators.maxLength(100), Validators.minLength(5), Validators.pattern(/^(?=.*?[a-zA-Z])[^.]+$/)]),
      whDetail: new FormControl(null, [Validators.required, Validators.maxLength(1000), Validators.minLength(10), Validators.pattern(/^\d+$/)]),
    });
    this.locationForm = new FormGroup({
      city: new FormControl(null, [Validators.required, Validators.maxLength(50), Validators.minLength(5)]),
      address: new FormControl(null, [Validators.required, Validators.maxLength(1000), Validators.minLength(10), Validators.pattern(/^\d+$/)]),
      poBox: new FormControl(null, [Validators.required, Validators.maxLength(1000), Validators.minLength(10), Validators.pattern(/^\d+$/)]),
    });
    this.propertyDetailForm = new FormGroup({
      warehouseSpace: new FormControl(null, [Validators.required, Validators.maxLength(50), Validators.minLength(5), Validators.pattern(/^(?=.*?[a-zA-Z])[^.]+$/)]),
      warehouseSpaceUnit: new FormControl(null, [Validators.required]),
      hashmoveSpace: new FormControl(null, [warehouseValidator.bind(this), Validators.maxLength(4), Validators.minLength(1)]),
      ceilingHeight: new FormControl(null, [warehouseValidator.bind(this)]),
      ceilingUnit: new FormControl(null, [warehouseValidator.bind(this)]),
      minLeaseValueOne: new FormControl(null, [warehouseValidator.bind(this), Validators.maxLength(4), Validators.minLength(1)]),
      minLeaseValueTwo: new FormControl(null, [warehouseValidator.bind(this), Validators.maxLength(4), Validators.minLength(1)]),
    });

    this.commisionForm = new FormGroup({
      commisionCurrency: new FormControl(null, [Validators.required, Validators.maxLength(5)]),
      comissionValue: new FormControl(null, [Validators.maxLength(4), Validators.minLength(1)]),
      minComissionValue: new FormControl(null, [Validators.required, Validators.maxLength(4), Validators.minLength(1)]),
    });
    this._sharedService.currencyList.subscribe((state: any) => {
      if (state) {
        this.currencyList = state;
      }
    });
    this._sharedService.getLocation.subscribe((state: any) => {
      if (state && state.country) {
        this.getMapLatlng(state.country);
      }
    })
    this._sharedService.cityList.subscribe((state: any) => {
      if (state) {
        this.cityList = state;
      }
    })
    this.getplacemapLoc();
  }
  ngOnDestroy() {
    this.paramSubscriber.unsubscribe();
  }
  getplacemapLoc() {
    this.mapsAPILoader.load().then(() => {
      this.geoCoder = new google.maps.Geocoder;
      let autocomplete = new google.maps.places.Autocomplete(this.searchElement.nativeElement);
      // autocomplete.setComponentRestrictions(
      //   { 'country': [countryBound] });
      autocomplete.addListener("place_changed", () => {
        this.ngZone.run(() => {
          //get the place result
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();
          // console.log(place)
          // this.locationForm.controls['address'].setValue(place.formatted_address);
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
  getMapLatlng(region) {
    this._userCreationService.getLatlng(region).subscribe((res: any) => {
      if (res.status == "OK") {
        this.location = res.results[0].geometry.location;
      }
    })
  }
  markerDragEnd($event) {
    // console.log($event);
    this.geoCoder.geocode({ 'location': { lat: $event.coords.lat, lng: $event.coords.lng } }, (results, status) => {
      // console.log(results);
      // console.log(status);
      if (status === 'OK') {
        if (results[0]) {
          // console.log(results[0].formatted_address);
          // this.locationForm.controls['address'].setValue(results[0].formatted_address);
          // this.searchElement.nativeElement.value = results[0].formatted_address;
          // console.log(this.searchElementRef.nativeElement.value);
          // infowindow.setContent(results[0].formatted_address);
        } else {
          this._toastr.error('No results found', '');
        }
      } else {
        this._toastr.error('Geocoder failed due to: ' + status, '');
      }

    });
  }


  getWareHouseDetail(providerId, id) {
    loading(true)
    this._warehouseService.getWarehouseList(providerId, id).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        loading(false);
        if (res.returnObject) {
          let leaseTerm = res.returnObject.MstLeaseTerm;
          let unitLength = res.returnObject.MstUnitLength;
          let unitArea = res.returnObject.MstUnitArea;
          let unitVolume = res.returnObject.MstUnitVolume;
          this.facilities = res.returnObject.WHFacilitiesProviding;
          this.warehouseUsageType = res.returnObject.WHUsageType;
          this.ceilingsHeight = res.returnObject.CeilingDesc;
          this.warehouseDocx = res.returnObject.documentType;
          this.isRealEstate = res.returnObject.IsRealEstate
          if (this.ceilingsHeight) {
            this.propertyDetailForm.controls['ceilingHeight'].setValue(this.ceilingsHeight[0].CeilingID);
          }
          this.getvaluesDropDown(leaseTerm, unitLength, unitArea, unitVolume);
        }

      }
    }, (err: HttpErrorResponse) => {
      console.log(err);
      loading(false);
    })
  }
  addFacilities(obj, $event) {
    this.facilities.map((elem) => {
      if (obj.BusinessLogic == elem.BusinessLogic) {
        elem.IsAllowed = $event.target.checked;
      }
    })
  }

  addMinimumLeaseTerm(obj) {
    this.selectedMiniLeaseTerm = obj;
  }
  numberValid(evt) {
    let charCode = (evt.which) ? evt.which : evt.keyCode
    if (charCode > 31 && (charCode < 48 || charCode > 57))
      return false;
    return true;
  }
  oneSpaceHandler(event) {
    if (event.target.value) {
      var end = event.target.selectionEnd;
      if (event.keyCode == 32 && (event.target.value[end - 1] == " " || event.target.value[end] == " ")) {
        event.preventDefault();
        return false;
      }
    }
    else if (event.target.selectionEnd == 0 && event.keyCode == 32) {
      return false;
    }
  }
  spaceHandler(event) {
    if (event.charCode == 32) {
      event.preventDefault();
      return false;
    }
  }

  getvaluesDropDown(leaseTerm, unitLength, unitArea, unitVolume) {
    loading(true)
    this._warehouseService.getDropDownValuesWarehouse(leaseTerm, unitLength, unitArea, unitVolume).subscribe((res: any) => {
      loading(false);
      if (res && res.length) {
        this.leaseTerm = res.filter(obj => obj.codeType == 'WH_MIN_LEASE_TERM')
        this.units = res.filter(obj => obj.codeType != 'WH_MIN_LEASE_TERM');
        this.propertyDetailForm.patchValue({
          warehouseSpaceUnit: this.units[0].codeValDesc,
          ceilingUnit: this.units[0].codeValDesc,
        });
      }
    }, (err: HttpErrorResponse) => {
      console.log(err);
      loading(false);
    })
  }

  selectDocx(selectedFiles: NgFilesSelected): void {
    if (selectedFiles.status !== NgFilesStatus.STATUS_SUCCESS) {
      if (selectedFiles.status == 1) this._toastr.error('Please select 12 or less file(s) to upload.', '')
      else if (selectedFiles.status == 2) this._toastr.error('File size should not exceed 5 MB. Please upload smaller file.', '')
      else if (selectedFiles.status == 4) this._toastr.error('File format is not supported. Please upload supported format file.', '')
      return;
    }
    else {
      try {
        if (this.uploadedGalleries.length + selectedFiles.files.length > this.config.maxFilesCount) {
          this._toastr.error('Please select 12 or less file(s) to upload.', '');
          return;
        }
        this.onFileChange(selectedFiles)
      } catch (error) {
        console.log(error);
      }

    }
  }

  onFileChange(event) {
    let flag = 0;
    if (event) {
      try {
        const allDocsArr = []
        const fileLength: number = event.files.length
        for (let index = 0; index < fileLength; index++) {
          let reader = new FileReader();
          const element = event.files[index];
          let file = element
          reader.readAsDataURL(file);
          reader.onload = () => {
            const selectedFile: DocumentFile = {
              fileName: file.name,
              fileType: file.type,
              fileUrl: reader.result,
              fileBaseString: (reader as any).result.split(',').pop()
            }
            if (event.files.length <= this.config.maxFilesCount) {
              const docFile = JSON.parse(this.generateDocObject(selectedFile));
              allDocsArr.push(docFile);
              flag++
              if (flag === fileLength) {
                this.uploadedGalleries = this.uploadedGalleries.concat(allDocsArr);
              }
            }
            else {
              this._toastr.error('Please select only ' + this.config.maxFilesCount + 'file to upload', '');
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
    let object = this.warehouseDocx;
    object.DocumentID = this.docTypeId;
    object.DocumentLastStatus = this.fileStatus;
    object.UserID = this.userProfile.UserID;
    object.ProviderID = this.userProfile.ProviderID;
    object.WHID = this.whID;
    object.DocumentFileContent = null;
    object.DocumentName = null;
    object.DocumentUploadedFileType = null;
    object.FileContent = [{
      documentFileName: selectedFile.fileName,
      documentFile: selectedFile.fileBaseString,
      docUrl: selectedFile.fileUrl,
      documentUploadedFileType: selectedFile.fileType.split('/').pop()
    }]
    return JSON.stringify(object);
  }
  async uploadDocuments(docFiles: Array<any>) {
    const totalDocLenght: number = docFiles.length
    for (let index = 0; index < totalDocLenght; index++) {
      try {
        docFiles[index].WHID = this.whID;
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

            this.uploadedGalleries = fileObj;
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

  removeSelectedDocx(index, obj) {
    if (obj && obj.DocumentFile){
    obj.DocumentFile = obj.DocumentFile.split(baseExternalAssets).pop();
    obj.DocumentID = this.docTypeId;
    this._basicInfoService.removeDoc(obj).subscribe((res: any) => {
      if (res.returnStatus == 'Success') {
        this._toastr.success('Remove selected document succesfully', "");
        this.uploadedGalleries.splice(index, 1);
        if (!this.uploadedGalleries || (this.uploadedGalleries && !this.uploadedGalleries.length)) {
          this.docTypeId = null;
        }
      }
      else {
        this._toastr.error('Error Occured', "");
      }
    }, (err: HttpErrorResponse) => {
      console.log(err);
    })
  }
  else{
      this.uploadedGalleries.splice(index, 1);
  }
  }

  addwareHouse() {
    let obj = {
      whid: this.whID,
      providerID: this.userProfile.ProviderID,
      whName: this.generalForm.value.whName,
      whDesc: this.generalForm.value.whDetail,
      countryID: this.locationForm.value.city.desc[0].CountryID,
      cityID: this.locationForm.value.city.id,
      cityName: this.locationForm.value.city.title,
      // countryName: "string",
      whpoBoxNo: this.locationForm.value.poBox,
      whAddress: this.locationForm.value.address,
      // gLocID: 0,
      latitude: this.location.lat,
      longitude: this.location.lng,
      totalCoveredArea: this.propertyDetailForm.value.warehouseSpace,
      totalCoveredAreaUnit: this.propertyDetailForm.value.warehouseSpaceUnit,
      usageType: (this.warehouseTypeFull)? 'FULL' : 'SHARED',
      whFacilitiesProviding: this.facilities,
      isBlocked: true,
      offeredHashMoveArea: (!this.warehouseTypeFull) ? this.propertyDetailForm.value.hashmoveSpace : null,
      offeredHashMoveAreaUnit: (!this.warehouseTypeFull) ? this.propertyDetailForm.value.warehouseSpaceUnit : null,
      ceilingHeight: (!this.warehouseTypeFull) ? this.propertyDetailForm.value.ceilingHeight : null,
      ceilingLenght : (!this.warehouseTypeFull) ? 0 : null,
      ceilingWidth : (!this.warehouseTypeFull) ? 0 : null,
      ceilingUnit: (!this.warehouseTypeFull) ? this.propertyDetailForm.value.ceilingUnit : null,
      minLeaseTermValue: this.selectedMiniLeaseTerm.codeVal,
      minLeaseTermUnit: this.selectedMiniLeaseTerm.codeValShortDesc,
      WHMinSQFT: (!this.warehouseTypeFull) ? this.propertyDetailForm.value.minLeaseValueOne : null,
      WHMinCBM: (!this.warehouseTypeFull) ? this.propertyDetailForm.value.minLeaseValueTwo : null,
      comissionType: (this.isRealEstate) ? ((this.fixedAmount) ? 'Fixed_Amount' : 'Fixed_Percent') : null,
      comissionCurrencyID: (this.isRealEstate) ? this.commisionForm.value.commisionCurrency.id : null,
      comissionValue: (this.isRealEstate) ? ((!this.fixedAmount) ? this.commisionForm.value.commisionValue : null) : null,
      minComissionValue: (this.isRealEstate) ? this.commisionForm.value.minCommisionValue: null,
      createdBy: this.userProfile.LoginID,
      modifiedBy: this.userProfile.LoginID,
    }
    this._warehouseService.addWarehouseDetail(obj).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        this.whID = res.returnObject[0].WHID;
        if (JSON.parse(this.whID) > 0) {
          this.uploadDocuments(this.uploadedGalleries);
        }
        this._toastr.success('Warehouse detail saved', '')
        this._stepper.next();
      }
    }, (err: HttpErrorResponse) => {
      console.log(err);
    })
  }

  searchCity = (text$: Observable<string>) =>
    text$
      .debounceTime(200)
      .map(term => (!term || term.length < 3) ? []
        : this.cityList.filter(v => v.title.toLowerCase().indexOf(term.toLowerCase()) > -1));
  formatterCity = (x: { title: string }) => x.title;

  currency = (text$: Observable<string>) =>
    text$
      .debounceTime(200)
      .map(term => (!term || term.length < 3) ? []
        : this.currencyList.filter(v => v.shortName.toLowerCase().indexOf(term.toLowerCase()) > -1));
  formatterCurrency = (x: { shortName: string }) => x.shortName;

}
export function warehouseValidator(control: AbstractControl) {
  if (!this.warehouseTypeFull) {
    if (!control.value) {
      return {
        required: true
      }
    }
  }

};