import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AgmCoreModule } from '@agm/core';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { BusinessInfoComponent } from './business-info/business-info.component';
import { ShippingInfoComponent } from './shipping-info/shipping-info.component';
import { BusinessDetailComponent } from './business-info/business-detail/business-detail.component'
import { DirectorinfoComponent } from './business-info/directorinfo/directorinfo.component';
import { ProfilecompletionComponent } from './business-info/profilecompletion/profilecompletion.component';

import { ShippingLinesComponent } from './shipping-info/shipping-lines/shipping-lines.component'
import { BusinessSetupComponent } from './shipping-info/business-setup/business-setup.component'
import { SetupMapComponent } from './shipping-info/setup-map/setup-map.component';
import { SlidePanelComponent } from '../../../../directives/slide-panel/slide-panel.component';
import { NgFilesModule } from '../../../../directives/ng-files/';

import { CompanyInfoService } from './company-info.service';
import { ComapnyInfoComponent } from './comapny-info.component';
import { UiSwitchModule } from 'ngx-toggle-switch';
import { NgStepperModule } from '../../../../directives/stepper/stepper.module';
import { SetupWarehouseComponent } from './setup-warehouse/setup-warehouse.component';
import { WarehouseService } from './setup-warehouse/warehouse.service';
import { WarehouseListComponent } from './setup-warehouse/warehouse-list/warehouse-list.component';
import { WarehouseAddRatesComponent } from './setup-warehouse/warehouse-add-rates/warehouse-add-rates.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ClickOutsideModule } from 'ng-click-outside';
import { LightboxModule } from 'ngx-lightbox';
@NgModule({
  imports: [
    CommonModule,
    NgFilesModule,
    HttpClientModule,
    UiSwitchModule,
    NgStepperModule,
    ClickOutsideModule,
    LightboxModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyBs4tYXYGUA2kDvELgCYcbhYeoVgZCxumg',
      libraries: ["places", "geometry"]
    }),
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    NgMultiSelectDropDownModule.forRoot()
  ],
  declarations: [
    ComapnyInfoComponent,
    BusinessInfoComponent,
    ShippingInfoComponent,
    BusinessDetailComponent,
    DirectorinfoComponent,
    ProfilecompletionComponent,
    BusinessSetupComponent,
    SetupMapComponent,
    ShippingLinesComponent,
    SlidePanelComponent,
    SetupWarehouseComponent,
    WarehouseListComponent,
    WarehouseAddRatesComponent
  ],
  providers: [
    CompanyInfoService,
    WarehouseService
  ]
})
export class CompanyInfoModule { }
