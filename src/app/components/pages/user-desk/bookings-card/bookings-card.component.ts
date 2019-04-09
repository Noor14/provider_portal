import { Component, OnInit, Input } from '@angular/core';
import { statusCode, isJSON, getImagePath, ImageRequiredSize, ImageSource } from '../../../../constants/globalFunctions';
import { Router } from '@angular/router';
import { baseExternalAssets } from '../../../../constants/base.url';

@Component({
  selector: 'app-bookings-card',
  templateUrl: './bookings-card.component.html',
  styleUrls: ['./bookings-card.component.scss']
})
export class BookingsCardComponent implements OnInit {
  public baseExternalAssets: string = baseExternalAssets;
  public statusCode:any = statusCode;
  constructor(private _router: Router) { }
  @Input() booking: any
  ngOnInit() {
    console.log(this.booking);
    
  }

  getCustomerImage($image: string) {
    console.log($image);
    
    if (isJSON($image)) {
      const providerImage = JSON.parse($image)
      return baseExternalAssets + '/' + providerImage[0].DocumentFile
    } else {
      return getImagePath(ImageSource.FROM_SERVER, $image, ImageRequiredSize.original)
    }
  }
}
