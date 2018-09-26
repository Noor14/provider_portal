import { Component, OnInit, NgZone, ElementRef, ViewChild } from '@angular/core';
import { SharedService } from '../../../../services/shared.service';
import { UserService } from '../user.service';
import { MapsAPILoader } from '@agm/core';
import { } from '@types/googlemaps';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';



@Component({
  selector: 'app-business-detail',
  templateUrl: './business-detail.component.html',
  styleUrls: ['./business-detail.component.scss']
})
export class BusinessDetailComponent implements OnInit {


  @ViewChild('search') public searchElement: ElementRef;

  public zoomlevel: number = 5;
  public location = {
    lat: 23.4241,
    lng: 53.8478
  }
  public serviceIds: any[] = [];
  public selectedIssueMonth;
  public selectedIssueMonthAr;
  public serviceOffered: any;
  public IssueMonth: any;
  public pastYears:number[] = [];
  public futureYears:number[] = [];
  public months:any[]= [
    {
      name:'Jan',
      arabicName:'يناير'
    },
    {
      name:'Feb',
      arabicName:'فبراير'
    },
    {
      name:'Mar',
      arabicName:'مارس'
    },
    {
      name:'Apr',
      arabicName:'أبريل'
    },
    {
      name:'May',
      arabicName:'مايو'
    },
    {
      name:'Jun',
      arabicName:'يونيو'
    },
    {
      name:'Jul',
      arabicName:'يوليو'
    },
    {
      name:'Aug',
      arabicName:'أغسطس'
    },
    {
      name:'Sep',
      arabicName:'سبتمبر'
    },
    {
      name:'Oct',
      arabicName:'أكتوبر'
    },
    {
      name:'Nov',
      arabicName:'نوفمبر'
    },
    {
      name:'Dec',
      arabicName:'ديسمبر'
    }
  ]
  
  constructor(
    private mapsAPILoader: MapsAPILoader,  
    private ngZone: NgZone,  
    private _sharedService: SharedService,
    private _userService: UserService
  ) { }

  ngOnInit() {

    this._sharedService.formProgress.next(30);
    this.getTenYears();
    this._userService.getServiceOffered().subscribe((res: any) => {
      if (res.returnStatus == 'Success') {
        this.serviceOffered = JSON.parse(res.returnObject);
      }
    })
        this.mapsAPILoader.load().then(() => {
      let autoComplete = new google.maps.places.Autocomplete(this.searchElement.nativeElement, { types: ["address"] });
      autoComplete.addListener('places_changed', () => {
        this.ngZone.run(() => {
          let place: google.maps.places.PlaceResult = autoComplete.getPlace();
          this.location.lat = place.geometry.location.lat();
          this.location.lng = place.geometry.location.lng();
          if (place.geometry === undefined || place.geometry === null) {
            return
          }
        })
      })
    })
  }

  selectIssueMonth(name){
    if(name && name != 'undefined'){
    let selectedMonth = this.months.find(obj => (obj.name == name  || obj.arabicName == name));
    this.IssueMonth = selectedMonth;
    this.selectedIssueMonth = selectedMonth.name;
    this.selectedIssueMonthAr = selectedMonth.arabicName;
   }
   else{
    this.IssueMonth = {};
    this.selectedIssueMonth = name;
    this.selectedIssueMonthAr = name;
   }
  }


  serviceSelection(obj, selectedService) {
    let index = this.serviceIds.indexOf(obj.ServiceID);
    let selectedItem = selectedService.classList;
    if (index < 0) {
      selectedItem.add('active');
      this.serviceIds.push(obj.ServiceID);
    }
    else {
      this.serviceIds.splice(index, 1);
      selectedItem.remove('active');
    }
  }

  getTenYears(){
    let date = new Date();
    for (var i=0; i < 11; i++){
      this.pastYears.push(date.getFullYear()-i);
      this.futureYears.push(date.getFullYear()+i);
    }
    if(i>10){

    }
  }


}
