import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BusinessInfoComponent } from './business-info/business-info.component';
import { ShippingInfoComponent } from './shipping-info/shipping-info.component';
import { UserBusinessComponent } from './user-business.component';
import { BusinessDetailComponent } from './business-info/business-detail/business-detail.component'
import { DirectorinfoComponent } from './business-info/directorinfo/directorinfo.component';
import { ProfilecompletionComponent } from './business-info/profilecompletion/profilecompletion.component';

import { ShippingLinesComponent } from './shipping-info/shipping-lines/shipping-lines.component'
import { BusinessSetupComponent } from './shipping-info/business-setup/business-setup.component'
import { SetupMapComponent } from './shipping-info/setup-map/setup-map.component';
import { SlidePanelComponent } from '../../../../directives/slide-panel/slide-panel.component';
import { NgFilesModule } from '../../../../directives/ng-files/';

import { UserBusinessService } from './user-business.service';
@NgModule({
  imports: [
    CommonModule,
    NgFilesModule
  ],
  declarations:[ 
    BusinessInfoComponent,
    ShippingInfoComponent,
    BusinessDetailComponent,
    DirectorinfoComponent,
    ProfilecompletionComponent,
    BusinessSetupComponent,
    SetupMapComponent,    
    ShippingLinesComponent,
    SlidePanelComponent

    ],
    providers:[
      UserBusinessService
    ]
})
export class UserBusinessModule { }
