import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef, NgZone, state } from '@angular/core';
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
        //  console.log(this.serviceOffered);
      }
    })

  }
  accountList(id){
    this._userService.getAccountSetup(id).subscribe((res:any) => {
      if(res.returnStatus == 'Success'){
         this.accountSetup = JSON.parse(res.returnObject);
         this.registrationForm = true
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
      this.registrationForm = false
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


  createAccount(){
  let obj = {
    setupAccountId:1,
    serviceId:1,
    countryID: 100,
    primaryEmail: "noor@texpo.com",
    redirectUrl:"http://localhost:4200/otp",
          baseLanguageData:{
            firstName: "Noor",
            lastName: "Ali",
            primaryPhone: "03001234567",
            CountryPhoneCode: "+92",
            PhoneCodeCountryID: "+92",
            jobTitle: "Manager",      
          },
          otherLanguageData:{ 
            firstName: "Noor",
            lastName: "Ali",
            primaryPhone: "03001234567",
            CountryPhoneCode: "+92",
            PhoneCodeCountryID: "+92",
            jobTitle: "Manager",
            
          }
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
