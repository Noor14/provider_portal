import { Component, OnInit, OnDestroy, ViewChild, NgZone, ViewEncapsulation } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MapsAPILoader } from '@agm/core';
import { } from 'googlemaps';
import { loading, isJSON } from '../../../../constants/globalFunctions';
import { Observable, Subject } from 'rxjs';
import { WarehouseService } from '../manage-rates/warehouse-list/warehouse.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, Validators, FormArray, AbstractControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { UserCreationService } from '../../user-creation/user-creation.service';
import { SharedService } from '../../../../services/shared.service';
import { NgFilesService, NgFilesConfig, NgFilesStatus, NgFilesSelected } from '../../../../directives/ng-files';
import { DocumentFile } from '../../../../interfaces/document.interface';
import { JsonResponse } from '../../../../interfaces/JsonResponse';
import { BasicInfoService } from '../../user-creation/basic-info/basic-info.service';
import { baseExternalAssets } from '../../../../constants/base.url';
import { ConfirmDeleteDialogComponent } from '../../../../shared/dialogues/confirm-delete-dialog/confirm-delete-dialog.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-warehouse',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './warehouse.component.html',
  styleUrls: ['./warehouse.component.scss']
})
export class WarehouseComponent implements OnInit, OnDestroy {

  @ViewChild('stepper') public _stepper: any;
  @ViewChild('searchElement') public searchElement: any;

  public requiredFields: string = "This field is required";

  public baseExternalAssets: string = baseExternalAssets;
  public zoomlevel: number = 5;
  public whID: any;
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
  public commissionForm:any

  //map working
  public location: any = { lat: undefined, lng: undefined };
  public draggable: boolean = true;

  public geoCoder: any;


  // form Errors
  public whNameError: boolean= false;
  public whDetailError: boolean= false;
  public cityError: boolean= false;
  public addressError: boolean= false;
  public poBoxError: boolean= false;
  public warehouseSpaceError:boolean= false;
  public hashmoveSpaceError: boolean= false;
  public minLeaseValueOneError: boolean= false;
  public minLeaseValueTwoError: boolean= false;
  public commissionValueError:boolean= false;
  public percentValueError: boolean= false;


  // space validation
  public hashmovespaceMsg: string = undefined;


  //facilities
  public checkedFacilities: boolean = false;


  // gallery
  private fileStatus = undefined;
  private docTypeId = null;
  public uploadedGalleries: any[] = [];
  public warehouseDocx: any;


// edit warehouse detail

  public warehouseDetail:any;



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
    private _redirect: Router,
    private _warehouseService: WarehouseService,
    private _toastr: ToastrService,
    private _sharedService: SharedService,
    private _userCreationService: UserCreationService,
    private _basicInfoService: BasicInfoService,
    private ngFilesService: NgFilesService,
    private _modalService: NgbModal,

  ) { }

  ngOnInit() {
    this.ngFilesService.addConfig(this.config, 'config');
    let userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo && userInfo.returnText) {
      this.userProfile = JSON.parse(userInfo.returnText);
    }
    this._sharedService.getLocation.subscribe((state: any) => {
      if (state && state.country) {
        this.getMapLatlng(state.country);
      }
    })
    this._sharedService.currencyList.subscribe((state: any) => {
      if (state) {
        this.currencyList = state;
      }
    });
    this._sharedService.cityList.subscribe((state: any) => {
      if (state) {
        this.cityList = state;
        let countryBound = this.cityList.find(obj => obj.desc[0].CountryID == this.userProfile.CountryID).desc[0].CountryCode;
        this.getplacemapLoc(countryBound);
        this.getDetail();
      }
    });
    this.generalForm = new FormGroup({
      whName: new FormControl(null, [Validators.required, Validators.maxLength(100), Validators.minLength(5), Validators.pattern(/^(?=.*?[a-zA-Z])[^.]+$/)]),
      whDetail: new FormControl(null, [Validators.required, Validators.maxLength(1000), Validators.minLength(10)]),
    });
    this.locationForm = new FormGroup({
      city: new FormControl(null, [Validators.required, Validators.maxLength(50), Validators.minLength(5), Validators.pattern(/^(?=.*?[a-zA-Z])[^%*$=+^<>}{]+$/)]),
      address: new FormControl(null, [Validators.required, Validators.maxLength(200), Validators.minLength(1), Validators.pattern(/^(?=.*?[a-zA-Z])[^%*$=+^<>}{]+$/)]),
      poBox: new FormControl(null, [Validators.required, Validators.maxLength(16), Validators.minLength(4)]),
    });
    this.propertyDetailForm = new FormGroup({
      warehouseSpace: new FormControl(null, [Validators.required, Validators.maxLength(5), Validators.minLength(3), Validators.pattern(/^[0-9]*$/)]),
      warehouseSpaceUnit: new FormControl(null, [Validators.required]),
      hashmoveSpace: new FormControl(null, [warehouseValidator.bind(this)]),
      ceilingHeight: new FormControl(null),
      // ceilingUnit: new FormControl(null),
      minLeaseValueOne: new FormControl(null, [warehouseValidator.bind(this)]),
      minLeaseValueTwo: new FormControl(null, [warehouseValidator.bind(this)]),
    });

    this.commissionForm = new FormGroup({
      commissionCurrency: new FormControl(null, [warehouseValidatorCommissionCurr.bind(this)]),
      commissionValue: new FormControl(null, [warehouseValidatorCommissionVal.bind(this)]),
      percentValue: new FormControl(null, [warehouseValidatorCommission.bind(this)]),
    });

  }

  getDetail(){
    this.paramSubscriber = this._router.params.subscribe(params => {
      this.whID = params['id'];
      // (+) converts string 'id' to a number
      if (this.whID) {
        this.getWareHouseDetail(this.userProfile.ProviderID, this.whID);
      }
    });
  }

  ngOnDestroy() {
    this.paramSubscriber.unsubscribe();
  }

  errorValidate() {
    if (this.generalForm.controls.whName.status == "INVALID" && this.generalForm.controls.whName.touched) {
      this.whNameError = true;
    }
    if (this.generalForm.controls.whDetail.status == "INVALID" && this.generalForm.controls.whDetail.touched) {
      this.whDetailError = true;
    }
    if (this.locationForm.controls.city.status == "INVALID" && this.locationForm.controls.city.touched) {
      this.cityError = true;
    }
    if (this.locationForm.controls.address.status == "INVALID" && this.locationForm.controls.address.touched) {
      this.addressError = true;
    }
    if (this.locationForm.controls.poBox.status == "INVALID" && this.locationForm.controls.poBox.touched) {
      this.poBoxError = true;
    }
    if (this.propertyDetailForm.controls.warehouseSpace.status == "INVALID" && this.propertyDetailForm.controls.warehouseSpace.touched) {
      this.warehouseSpaceError = true;
    }
    if (this.propertyDetailForm.controls.hashmoveSpace.status == "INVALID" && this.propertyDetailForm.controls.hashmoveSpace.touched) {
      this.hashmoveSpaceError = true;
    }
    if (this.propertyDetailForm.controls.minLeaseValueOne.status == "INVALID" && this.propertyDetailForm.controls.minLeaseValueOne.touched) {
      this.minLeaseValueOneError = true;
    }
    if (this.propertyDetailForm.controls.minLeaseValueTwo.status == "INVALID" && this.propertyDetailForm.controls.minLeaseValueTwo.touched) {
      this.minLeaseValueTwoError = true;
    }
    if (this.commissionForm.controls.commissionValue.status == "INVALID" && this.commissionForm.controls.commissionValue.touched) {
      this.commissionValueError = true;
    }
    if (this.commissionForm.controls.percentValue.status == "INVALID" && this.commissionForm.controls.percentValue.touched) {
      this.percentValueError = true;
    }
  }
  spaceValidate(){
    if(this.warehouseTypeFull) return;
      if (Number(this.propertyDetailForm.controls.warehouseSpace.value) && Number(this.propertyDetailForm.controls.warehouseSpace.value) < Number(this.propertyDetailForm.controls.hashmoveSpace.value)) {
        this.propertyDetailForm.controls.hashmoveSpace.status = 'INVALID';
        this.hashmoveSpaceError = true;
        this.hashmovespaceMsg = "Offered space should be less than or equal to Total warehouse Space";
      }
      else if (Number(this.propertyDetailForm.controls.hashmoveSpace.value) && Number(this.propertyDetailForm.controls.hashmoveSpace.value) > Number(this.propertyDetailForm.controls.warehouseSpace.value)) {
        this.propertyDetailForm.controls.hashmoveSpace.status = 'INVALID';
        this.hashmoveSpaceError = true;
        this.hashmovespaceMsg = "Total warehouse Space should be greater than offered space";

      }
      else{
        this.hashmovespaceMsg = undefined;
      }
  }
  getplacemapLoc(countryBound) {
    this.mapsAPILoader.load().then(() => {
      this.geoCoder = new google.maps.Geocoder;
      let autocomplete = new google.maps.places.Autocomplete(this.searchElement.nativeElement);
      autocomplete.setComponentRestrictions(
      { 'country': [countryBound] });
      autocomplete.addListener("place_changed", () => {
        this.ngZone.run(() => {
          //get the place result
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();
          // console.log(place)
          this.locationForm.controls['address'].setValue(this.searchElement.nativeElement.value);
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
      if (res.returnStatus == "Success" && res.returnObject) {
        loading(false);
        this.isRealEstate = res.returnObject.IsRealEstate;
        const data = [
          'WH_MIN_LEASE_TERM',
          'UNIT_AREA',
          'WH_USAGE_TYPE',
          'UNIT_VOLUME',
          'WH_CEILING_HEIGHT'
        ]
        this.warehouseDocx = res.returnObject.documentType;
        if (res.returnObject && !Number(id)) {
          this.facilities = res.returnObject.WHFacilitiesProviding;
        }
        else if(Number(id)){
          this.warehouseDetail = res.returnObject.WHModel[0];
          this.setData(this.warehouseDetail);
        }
        this.getvaluesDropDown(data);
      }
    }, (err: HttpErrorResponse) => {
      console.log(err);
      loading(false);
    })
  }
  setData(obj:any){
    if(obj.latitude){
      this.location.lat = Number(obj.latitude);
    }
    if(obj.longitude){
      this.location.lng = Number(obj.longitude);
    }
    this.warehouseTypeFull = (obj.UsageType.toUpperCase() == 'SHARED')? false : true;
    this.fixedAmount = (obj.ComissionType == 'Fixed_Amount')? true :false;
    if (obj.FacilitiesProviding && isJSON(obj.FacilitiesProviding)) {
      this.facilities = JSON.parse(obj.FacilitiesProviding);
      this.checkedFacilities = this.facilities.some(obj => obj.IsAllowed == true);
    }
    if (obj.WHName){
      this.generalForm.controls['whName'].setValue(obj.WHName);
    }
    if (obj.WHDesc){
      this.generalForm.controls['whDetail'].setValue(obj.WHDesc);
    }
    if (obj.WHGallery && obj.WHGallery != "[]" && isJSON(obj.WHGallery)){
      this.uploadedGalleries = JSON.parse(obj.WHGallery);
      this.docTypeId = this.uploadedGalleries[0].DocumentID;
    }
    if (obj.WHAddress) {
      this.locationForm.controls['address'].setValue(obj.WHAddress);
    }
    if (obj.WHPOBoxNo) {
      this.locationForm.controls['poBox'].setValue(obj.WHPOBoxNo);
    }
    if (obj.CityID) {
      let object = this.cityList.find(elem => elem.id == obj.CityID)
      this.locationForm.controls['city'].setValue(object);
    }
    if (obj.TotalCoveredArea){
      this.propertyDetailForm.controls['warehouseSpace'].setValue(obj.TotalCoveredArea);
    }
    if(!this.warehouseTypeFull && obj.CeilingHeight){
      this.propertyDetailForm.controls['ceilingHeight'].setValue(obj.CeilingHeight);
    }
    if(!this.warehouseTypeFull && obj.OfferedHashMoveArea){
      this.propertyDetailForm.controls['hashmoveSpace'].setValue(obj.OfferedHashMoveArea);
    }
    if(!this.warehouseTypeFull && obj.WHMinSQFT){
      this.propertyDetailForm.controls['minLeaseValueOne'].setValue(obj.WHMinSQFT);
    }
    if(!this.warehouseTypeFull && obj.WHMinCBM){
      this.propertyDetailForm.controls['minLeaseValueTwo'].setValue(obj.WHMinCBM);
    }

    if (this.isRealEstate && obj.ComissionValue){
      this.commissionForm.controls['commissionValue'].setValue(obj.ComissionValue);
    }
    if (this.isRealEstate && obj.ComissionCurrencyID) {
      let object = this.currencyList.find(elem => elem.id == obj.ComissionCurrencyID)
      this.commissionForm.controls['commissionCurrency'].setValue(object);
    }
    if (this.isRealEstate && !this.fixedAmount && obj.Percent) {
      this.commissionForm.controls['percentValue'].setValue(obj.Percent);
    }

  }
  addFacilities(obj, $event) {
    this.facilities.map((elem) => {
      if (obj.BusinessLogic == elem.BusinessLogic) {
        elem.IsAllowed = $event.target.checked;
      }
    })
    this.checkedFacilities = this.facilities.some(obj => obj.IsAllowed == true);
  }

  addMinimumLeaseTerm(obj) {
    this.selectedMiniLeaseTerm = obj;
  }
  changeWarehouseType(){
    this.warehouseTypeFull = !this.warehouseTypeFull;
    if (this.warehouseTypeFull){
      this.propertyDetailForm.controls.hashmoveSpace.reset();
      this.propertyDetailForm.controls.minLeaseValueOne.reset();
      this.propertyDetailForm.controls.minLeaseValueTwo.reset();
    }
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

  getvaluesDropDown(data) {
    loading(true);
    this._warehouseService.getDropDownValuesWarehouse(data).subscribe((res: any) => {
      loading(false);
      
      if (res && res.length) {
        this.leaseTerm = res.filter(obj => obj.codeType == 'WH_MIN_LEASE_TERM');
        this.warehouseUsageType = res.filter(obj => obj.codeType == 'WH_USAGE_TYPE');
        this.ceilingsHeight = res.filter(obj => obj.codeType == 'WH_CEILING_HEIGHT');
        this.units = res.filter(obj => obj.codeType != 'WH_MIN_LEASE_TERM' && obj.codeType != 'WH_USAGE_TYPE' && obj.codeType != 'WH_CEILING_HEIGHT');
        if(!Number(this.whID)){
          if (this.ceilingsHeight) {
            let ceilingID = this.ceilingsHeight.find(obj => obj.codeVal == 4).codeVal
            this.propertyDetailForm.controls['ceilingHeight'].setValue(ceilingID);
          }
        let object = this.units.find(obj => obj.codeVal == 'SQFT');
        this.propertyDetailForm.patchValue({
          warehouseSpaceUnit: object.codeValDesc,
          // ceilingUnit: object.codeValDesc,
        });
        }
        else{
          if (this.warehouseDetail.TotalCoveredAreaUnit){
            let object = this.units.find(obj => obj.codeVal == this.warehouseDetail.TotalCoveredAreaUnit.toUpperCase());
            this.propertyDetailForm.patchValue({
              warehouseSpaceUnit: object.codeValDesc,
              // ceilingUnit: object.codeValDesc,
            });
          }
          if (this.warehouseDetail.MinLeaseTermValue){
            this.selectedMiniLeaseTerm = this.leaseTerm.find(obj => obj.codeVal == this.warehouseDetail.MinLeaseTermValue)
          }
          
        }
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

  cancelWarehouse(){
    const modalRef = this._modalService.open(ConfirmDeleteDialogComponent, {
      size: 'lg',
      centered: true,
      windowClass: 'small-modal',
      backdrop: 'static',
      keyboard: false
    });
    modalRef.result.then((result) => {
      if (result == "close") {
        this._redirect.navigate(['provider/manage-rates/warehouse'])
      }
    });
    let obj = {
      data: this.whID,
      type: "CancelWarehouse"
    }
    modalRef.componentInstance.deleteIds = obj;
    setTimeout(() => {
      if (document.getElementsByTagName('body')[0].classList.contains('modal-open')) {
        document.getElementsByTagName('html')[0].style.overflowY = 'hidden';
      }
    }, 0);
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
      ceilingUnit: (!this.warehouseTypeFull) ? 'ft' : null,
      minLeaseTermValue: this.selectedMiniLeaseTerm.codeVal,
      minLeaseTermUnit: this.selectedMiniLeaseTerm.codeValShortDesc,
      WHMinSQFT: (!this.warehouseTypeFull) ? this.propertyDetailForm.value.minLeaseValueOne : null,
      WHMinCBM: (!this.warehouseTypeFull) ? this.propertyDetailForm.value.minLeaseValueTwo : null,
      comissionType: (this.isRealEstate) ? ((this.fixedAmount) ? 'Fixed_Amount' : 'Fixed_Percent') : null,
      comissionCurrencyID: (this.isRealEstate) ? this.commissionForm.value.commissionCurrency.id : null,
      comissionValue: (this.isRealEstate) ? this.commissionForm.value.commissionValue : null,
      percent: (this.isRealEstate) ? ((!this.fixedAmount) ? this.commissionForm.value.percentValue : null) : null,
      createdBy: this.userProfile.LoginID,
      modifiedBy: this.userProfile.LoginID,
    }
    this._warehouseService.addWarehouseDetail(obj).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        this.whID = res.returnObject[0].WHID;
        if (Number(this.whID) > 0) {
          this.uploadedGalleries = this.uploadedGalleries.filter(obj => obj.BusinessLogic);
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
    let regexp: RegExp = /^[0-9]*$/;
    if (!control.value) {
      return {
        required: true
      }
    }
    // else if (control.value.length < 3 && control.value) {
    //     if (!regexp.test(control.value)) {
    //       return {
    //         pattern: true
    //       }
    //     }
    //     else {
    //       return {
    //         minlength: true
    //       }
    //     }
    //   }
    else if (control.value.length > 5 && control.value) {
      if (!regexp.test(control.value)) {
          return {
            pattern: true
          }
        }
        else {
          return {
            maxlength: true
          }
        }

      }
    else {
      return false;
    }
  }
};
export function warehouseValidatorCommission(control: AbstractControl) {
  if (this.isRealEstate && !this.fixedAmount) {
    let regexp: RegExp = /^[0-9]*$/;
    if (!control.value) {
      return {
        required: true
      }
    }
    // else if (control.value.length < 1 && control.value) {
    //   if (!regexp.test(control.value)) {
    //     return {
    //       pattern: true
    //     }
    //   }
    //   else {
    //     return {
    //       minlength: true
    //     }
    //   }
    // }
    else if (control.value.length > 5 && control.value) {
      if (!regexp.test(control.value)) {
        return {
          pattern: true
        }
      }
      else {
        return {
          maxlength: true
        }
      }

    }
    else {
      return false;
    }
  }
};
export function warehouseValidatorCommissionVal(control: AbstractControl) {
  if (this.isRealEstate) {
    let regexp: RegExp = /^[0-9]*$/;
    if (!control.value) {
      return {
        required: true
      }
    }
    // else if (control.value.length < 1 && control.value) {
    //   if (!regexp.test(control.value)) {
    //     return {
    //       pattern: true
    //     }
    //   }
    //   else {
    //     return {
    //       minlength: true
    //     }
    //   }
    // }
    else if (control.value.length > 5 && control.value) {
      if (!regexp.test(control.value)) {
        return {
          pattern: true
        }
      }
      else {
        return {
          maxlength: true
        }
      }

    }
    else {
      return false;
    }
  }
};
export function warehouseValidatorCommissionCurr(control: AbstractControl) {
  if (this.isRealEstate) {
    if (!control.value) {
      return {
        required: true
      }
    }
    else {
      return false;
    }
  }
};