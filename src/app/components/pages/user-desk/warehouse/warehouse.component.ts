import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { loading } from '../../../../constants/globalFunctions';
import { WarehouseService } from '../manage-rates/warehouse-list/warehouse.service';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, Validators, FormArray } from '@angular/forms';

@Component({
  selector: 'app-warehouse',
  templateUrl: './warehouse.component.html',
  styleUrls: ['./warehouse.component.scss']
})
export class WarehouseComponent implements OnInit, OnDestroy {

  // @ViewChild(stepper) stepper:any
  private whID: any;
  private userProfile:any
  public warehouseTypeFull: boolean = true;
  public leaseTerm: any[] = [];
  public units: any[] = [];
  public facilities: any[] = [];
  public warehouseUsageType:any[]=[];
  private paramSubscriber: any;

  //generalForm
  public generalForm:any;

  // locationForm
  public locationForm:any;

  // propertyDetailForm
  public propertyDetailForm: any;

  constructor(
    private _router: ActivatedRoute,
    private _warehouseService: WarehouseService
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
      whName: new FormControl(null, [Validators.required, Validators.maxLength(50), Validators.minLength(5), Validators.pattern(/^(?=.*?[a-zA-Z])[^.]+$/)]),
      whDetail: new FormControl(null, [Validators.required, Validators.maxLength(1000), Validators.minLength(10), Validators.pattern(/^\d+$/)]),
    });
    this.locationForm = new FormGroup({
      city: new FormControl(null, [Validators.required, Validators.maxLength(50), Validators.minLength(5), Validators.pattern(/^(?=.*?[a-zA-Z])[^.]+$/)]),
      address: new FormControl(null, [Validators.required, Validators.maxLength(1000), Validators.minLength(10), Validators.pattern(/^\d+$/)]),
      poBox: new FormControl(null, [Validators.required, Validators.maxLength(1000), Validators.minLength(10), Validators.pattern(/^\d+$/)]),
    });
    this.propertyDetailForm = new FormGroup({
      warehouseSpace: new FormControl(null, [Validators.required, Validators.maxLength(50), Validators.minLength(5), Validators.pattern(/^(?=.*?[a-zA-Z])[^.]+$/)]),
      hashmoveSpace: new FormControl(null, [Validators.required, Validators.maxLength(4), Validators.minLength(1)]),
      ceilingHeight: new FormControl(null, [Validators.required]),
      minimumlease: new FormControl(null, [Validators.required, Validators.maxLength(4), Validators.minLength(1)]),
      leaseTerm: new FormControl(null, [Validators.required]),
    });
  }
  ngOnDestroy() {
    this.paramSubscriber.unsubscribe();
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
          this.warehouseUsageType = res.returnObject.WHUsageType
          this.getvaluesDropDown(leaseTerm, unitLength, unitArea, unitVolume);
        }

      }
    }, (err: HttpErrorResponse) => {
      console.log(err);
      loading(false);
    })
  }


  getvaluesDropDown(leaseTerm, unitLength, unitArea, unitVolume) {
    loading(true)
    this._warehouseService.getDropDownValuesWarehouse(leaseTerm, unitLength, unitArea, unitVolume).subscribe((res: any) => {
      loading(false);
      if (res && res.length) {
        console.log(res)
        this.leaseTerm = res.filter(obj => obj.codeType == 'WH_MIN_LEASE_TERM')
        this.units =  res.filter(obj => obj.codeType != 'WH_MIN_LEASE_TERM')
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
      whName: "string",
      whAddress: "string",
      // countryID: 0,
      // cityID: 0,
      cityName: "string",
      // countryName: "string",
      whpoBoxNo: "string",
      // gLocID: 0,
      latitude: "string",
      longitude: "string",
      totalCoveredArea: 0,
      totalCoveredAreaUnit: "string",
      usageType: "string",
      facilitiesProviding: "string" ,
      whGallery: "string",
      isBlocked: true,
      offeredHashMoveArea: 0,
      offeredHashMoveAreaUnit: "string",
      ceilingHeight: 0,
      ceilingHeightUnit: "string",
      minimumLeaseSpace: "string",
      createdBy: this.userProfile.LoginID,
      modifiedBy: this.userProfile.LoginID,
    }
    this._warehouseService.addWarehouseDetail(obj).subscribe((res: any) => {
      if (res.returnStatus == "Success") {
        console.log(res)
        // this.stepper.next()
      }
    }, (err: HttpErrorResponse) => {
      console.log(err);
    })
  }

}
