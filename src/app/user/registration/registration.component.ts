import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef, NgZone } from '@angular/core';
import { MapsAPILoader } from '@agm/core'
import { } from '@types/googlemaps'
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {

  // @ViewChild('search') public searchElement: ElementRef;
  regions: any[];
  public zoomlevel: number = 5;
  public select: any;
  public selected = {
    lat: 23.424076,
    lng: 53.847816,
    name: 'UAE', 
    flag: '5/5c/Flag_of_Alabama.svg/45px-Flag_of_Alabama.svg.png'
  }
  constructor(private mapsAPILoader: MapsAPILoader, private ngZone: NgZone) { }

  ngOnInit() {
    this.regions = [
      { id: 1, name: 'UAE', flag: '5/5c/Flag_of_Alabama.svg/45px-Flag_of_Alabama.svg.png', lat: 23.424076, lng: 53.847816 },
      { id: 2, name: 'Pakistan', flag: 'e/e6/Flag_of_Alaska.svg/43px-Flag_of_Alaska.svg.png', lat: 30.375320, lng: 69.345116 },
      { id: 3, name: 'America', flag: '9/9d/Flag_of_Arizona.svg/45px-Flag_of_Arizona.svg.png', lat: 37.090240, lng: -95.712891 },
      { id: 4, name: 'SaudiArabia', flag: '9/9d/Flag_of_Arkansas.svg/45px-Flag_of_Arkansas.svg.png', lat: 24.694970, lng: 46.724130 },
      { id: 5, name: 'India', flag: '0/01/Flag_of_California.svg/45px-Flag_of_California.svg.png', lat: 20.593683, lng: 78.962883 },
      { id: 6, name: 'Palestine', flag: 'e/e6/Flag_of_Alaska.svg/43px-Flag_of_Alaska.svg.png', lat: 30.375320, lng: 69.345116 },
      { id: 7, name: 'Australia', flag: 'e/e6/Flag_of_Alaska.svg/43px-Flag_of_Alaska.svg.png', lat: 30.375320, lng: 69.345116 },
      { id: 8, name: 'Austria', flag: 'e/e6/Flag_of_Alaska.svg/43px-Flag_of_Alaska.svg.png', lat: 30.375320, lng: 69.345116 }

    ];

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
  }

    search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      map(term => (!term || term.length < 3)? []
        : this.regions.filter(v => v.name.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
    )
   formatter = (x: {name: string}) => x.name;

}
