import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef, NgZone, state } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MapsAPILoader } from '@agm/core';
import { Router } from '@angular/router';
import { } from '@types/googlemaps';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { UserService } from '../user.service';
import { SharedService } from '../../../../services/shared.service';
@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {

  // @ViewChild('search') public searchElement: ElementRef;
  public countryList: any[];
  public accountSetup: any;
  public serviceOffered: any;
  public zoomlevel: number = 5;
  public serviceIds: any[]= [];
  public registrationForm: boolean;
  public regForm;
  public selectedRegion = {
    id: undefined,
    code: undefined,
    title: undefined,
  }
  public location = {
    lat: undefined,
    lng: undefined
  }

  constructor(
    private _userService : UserService,
    private _sharedService : SharedService,
    private mapsAPILoader: MapsAPILoader,
    private _router: Router,
    private ngZone: NgZone) { }

  ngOnInit() {

    this.regForm = new FormGroup({
      firstName: new FormControl(null, [Validators.required, Validators.pattern(/^[a-zA-Z\s]*$/), Validators.minLength(2), Validators.maxLength(50)]),
      lastName: new FormControl(null, [Validators.required, Validators.pattern(/^[a-zA-Z\s]*$/), Validators.minLength(2), Validators.maxLength(50)]),
      email: new FormControl(null, [
        Validators.required,
        // Validators.pattern(EMAIL_REGEX),
        Validators.maxLength(320)
      ]),
      phone: new FormControl(null, [Validators.required, Validators.pattern(/^(?!(\d)\1+(?:\1+){0}$)\d+(\d+){0}$/), Validators.minLength(7), Validators.maxLength(12)]),
      jobTitle: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(25)]),
    });


    this._sharedService.countryList.subscribe((state:any)=>{
      this.countryList = state;
    });
    
    this._sharedService.getLocation.subscribe((state:any)=>{
      if(state && state.country){
        let obj ={
          title: state.country
        }; 
        this.getMapLatlng(obj);
      }
    })

    // this.mapsAPILoader.load().then(() => {
    //   let autoComplete = new google.maps.places.Autocomplete(this.searchElement.nativeElement, { types: ["(cities)"] });
    //   autoComplete.addListener('places_changed', () => {
    //     this.ngZone.run(() => {
    //       let place: google.maps.places.PlaceResult = autoComplete.getPlace();
    //       this.lat = place.geometry.location.lat();
    //       this.lng = place.geometry.location.lng();
    //       if (place.geometry === undefined || place.geometry === null) {
    //         return
    //       }
    //     })
    //   })
    // })
    this._userService.getServiceOffered().subscribe((res:any) => {
      if(res.returnStatus == 'Success'){
         this.serviceOffered = JSON.parse(res.returnObject);
      }
    })

  }
  accountList(id){
    this._userService.getAccountSetup(id).subscribe((res:any) => {
      if(res.returnStatus == 'Success'){
         this.accountSetup = JSON.parse(res.returnObject);
         this.registrationForm = true;
      }
    })
  }
  getMapLatlng(region){
    this._userService.getLatlng(region.title).subscribe((res:any)=>{
      if(res.status == "OK"){
        this.location = res.results[0].geometry.location;
        if(region.id){
        this.accountList(region.id);
      }
      }
    })
  }

  getAccountList(region){
    if(region.id){ 
        this.getMapLatlng(region);
    }
    else{
      this.registrationForm = false;
    }
  }

  serviceSelection(obj, selectedService){
    let index = this.serviceIds.indexOf(obj.ServiceID);
    let selectedItem = selectedService.classList;
    if(index < 0){
      selectedItem.add('active');
      this.serviceIds.push(obj.ServiceID);
    }
    else{
      this.serviceIds.splice(index, 1);
      selectedItem.remove('active');
    }
  }


  createAccount(data){
  // let obj = {
  //   accountID:1,
  //   countryID: 100,
  //   primaryEmail: data.email,
  //   redirectUrl:"http://localhost:4200/otp",
  //         baseLanguageData:{
  //           firstName: data.firstName,
  //           lastName: data.lastName,
  //           primaryPhone: data.phone,
  //           CountryPhoneCode: "+92",
  //           PhoneCodeCountryID: "+92",
  //           jobTitle: "Manager",      
  //         },
  //         otherLanguageData:{ 
  //           firstName: "",
  //           lastName: "",
  //           primaryPhone: "",
  //           CountryPhoneCode: "",
  //           PhoneCodeCountryID: "",
  //           jobTitle: "",
            
  //         }
  //       }

 

let obj={
  accountID: 100,
  countryID: 101,
  primaryEmail: "farah@texpo.com",
  otpKey: "",
  otpExpiry: "2018-09-13T11:19:45.799Z",
  redirectUrl: "http://localhost:31289",
  user: [
    {
      userID: 0,
      firstName: "Farah",
      lastName: "Anwar",
      primaryPhone: "03001234567",
      countryPhoneCode: "+92",
      phoneCodeCountryID: 92,
      jobTitle: "Software Engineer",
      createdBy: "",
      createdDateTime: "2018-09-13T11:19:45.799Z",
      modifiedBy: "",
      modifiedDateTime: "2018-09-13T11:19:45.799Z"
    }
  ]
} 
 
  this._userService.userRegistration(obj).subscribe((res:any)=>{
    if(res.returnStatus=="Success"){
       this._router.navigate(['/otp'])
    }
  })

}

    search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      map(term => (!term || term.length < 3)? []
        : this.countryList.filter(v => v.title.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
    )
   formatter = (x: {title: string}) => x.title;

}
