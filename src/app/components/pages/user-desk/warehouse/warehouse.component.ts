import { Component, OnInit, OnDestroy, ViewChild, NgZone } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MapsAPILoader } from '@agm/core';
import { } from '@types/googlemaps';
import { loading } from '../../../../constants/globalFunctions';
import { WarehouseService } from '../manage-rates/warehouse-list/warehouse.service';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { UserCreationService } from '../../user-creation/user-creation.service';
import { SharedService } from '../../../../services/shared.service';
@Component({
  selector: 'app-warehouse',
  templateUrl: './warehouse.component.html',
  styleUrls: ['./warehouse.component.scss']
})
export class WarehouseComponent implements OnInit, OnDestroy {

  @ViewChild('stepper') public _stepper: any;
  @ViewChild('searchElement') public searchElement: any;
  public zoomlevel: number = 5;
  private whID: any;
  private userProfile:any
  public warehouseTypeFull: boolean = true;
  public leaseTerm: any[] = [];
  public units: any[] = [];
  public facilities: any[] = [];
  public warehouseUsageType:any[]=[];
  public ceilingsHeight: any[] = [];
  public selectedMiniLeaseTerm:any;
  private paramSubscriber: any;

  //generalForm
  public generalForm:any;

  // locationForm
  public locationForm:any;

  // propertyDetailForm
  public propertyDetailForm: any;


  //map working
  public location: any = { lat: undefined, lng: undefined };
  public draggable: boolean = true;

  public geoCoder;

  constructor(
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    private _router: ActivatedRoute,
    private _warehouseService: WarehouseService,
    private _toastr: ToastrService,
    private _sharedService: SharedService,
    private _userCreationService: UserCreationService
    ) { }

  ngOnInit() {
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
      hashmoveSpace: new FormControl(null, [Validators.required, Validators.maxLength(4), Validators.minLength(1)]),
      ceilingHeight: new FormControl(null, [Validators.required]),
      ceilingUnit: new FormControl(null, [Validators.required]),
      minLeaseValueOne: new FormControl(null, [Validators.required, Validators.maxLength(4), Validators.minLength(1)]),
      minLeaseValueTwo: new FormControl(null, [Validators.required, Validators.maxLength(4), Validators.minLength(1)]),
      minLeaseUnitTwo: new FormControl(null, [Validators.required]),
      minLeaseUnitOne: new FormControl(null, [Validators.required]),
      minimumlease: new FormControl(null, [Validators.required, Validators.maxLength(4), Validators.minLength(1)]),
      leaseTerm: new FormControl(null, [Validators.required]),
    });
    this._sharedService.getLocation.subscribe((state: any) => {
      if (state && state.country) {
        this.getMapLatlng(state.country);
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
          console.log(place)
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
          if (this.ceilingsHeight){
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
      if (obj.BusinessLogic == elem.BusinessLogic){
        elem.IsAllowed = $event.target.checked;
      }
    })
  }
  wareHouseType(obj, $event){
    this.warehouseTypeFull = !this.warehouseTypeFull; 
      this.warehouseUsageType.map((elem) => {
      if (obj.UsageTypeID == elem.UsageTypeID){
        elem.IsAllowed = $event.target.checked;
      }
      else{
        elem.IsAllowed = false;
      }
    });
  }
  addMinimumLeaseTerm(obj){
    this.selectedMiniLeaseTerm = obj;
  }
  getvaluesDropDown(leaseTerm, unitLength, unitArea, unitVolume) {
    loading(true)
    this._warehouseService.getDropDownValuesWarehouse(leaseTerm, unitLength, unitArea, unitVolume).subscribe((res: any) => {
      loading(false);
      if (res && res.length) {
        this.leaseTerm = res.filter(obj => obj.codeType == 'WH_MIN_LEASE_TERM')
        this.units =  res.filter(obj => obj.codeType != 'WH_MIN_LEASE_TERM');
        this.propertyDetailForm.patchValue({
          warehouseSpaceUnit: this.units[0].codeValDesc,
          ceilingUnit: this.units[0].codeValDesc,
          minLeaseUnitOne: this.units[0].codeValDesc,
          minLeaseUnitTwo: this.units[0].codeValDesc,
        });
      }
    }, (err: HttpErrorResponse) => {
      console.log(err);
      loading(false);
    })
  }



  aadwareHouse(){
    let obj = {
      whid: this.whID,
      providerID: this.userProfile.ProviderID,
      whName: this.generalForm.value.whName,
      whDesc: this.generalForm.value.whDetail,
      // countryID: 0,
      // cityID: 0,
      cityName: this.locationForm.value.city,
      // countryName: "string",
      whpoBoxNo: this.locationForm.value.poBox,
      whAddress: this.locationForm.value.address,
      // gLocID: 0,
      latitude: this.location.lat,
      longitude: this.location.lng,
      totalCoveredArea: this.propertyDetailForm.value.warehouseSpace,
      totalCoveredAreaUnit: this.propertyDetailForm.value.warehouseSpaceUnit,
      whUsageType: this.warehouseUsageType,
      whFacilitiesProviding: this.facilities,
      whGallery: "string",
      isBlocked: true,
      offeredHashMoveArea: this.propertyDetailForm.value.hashmoveSpace,
      offeredHashMoveAreaUnit: this.propertyDetailForm.value.warehouseSpaceUnit,
      ceilingHeight: this.propertyDetailForm.value.ceilingHeight,
      ceilingHeightUnit: this.propertyDetailForm.value.ceilingUnit,
      whMinimumLeaseTerm: [{
        value: this.selectedMiniLeaseTerm.codeVal,
        unitType: this.selectedMiniLeaseTerm.codeValShortDesc
      }],
      minimumLeaseSpace: [
        {
          value: this.propertyDetailForm.value.minLeaseValueOne,
          unitType: this.propertyDetailForm.value.minLeaseUnitOne
        },
        {
          value: this.propertyDetailForm.value.minLeaseValueOne,
          unitType: this.propertyDetailForm.value.minLeaseUnitTwo
        }
      ],
      createdBy: this.userProfile.LoginID,
      modifiedBy: this.userProfile.LoginID,
    }
    this._warehouseService.addWarehouseDetail(obj).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        console.log(res)
        this._toastr.success('Warehouse detail saved', '')
        this._stepper.next()
      }
    }, (err: HttpErrorResponse) => {
      console.log(err);
    })
  }

}
