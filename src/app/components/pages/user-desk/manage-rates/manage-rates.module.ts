import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManageRatesRoutingModule } from './manage-rates-routing.module';
import { ManageRatesComponent } from './manage-rates.component';
import { SeaFreightComponent } from './sea-freight/sea-freight.component';
import { DataTablesModule } from 'angular-datatables';
import { AirFreightComponent } from './air-freight/air-freight.component';
import { GroundTransportComponent } from './ground-transport/ground-transport.component';
import { WarehouseComponent } from './warehouse/warehouse.component';
import { SeaFreightService } from './sea-freight/sea-freight.service';
import { ScrollbarModule } from 'ngx-scrollbar';
import { LoaderComponent } from '../../../../shared/loader/loader.component';

@NgModule({
  imports: [
    CommonModule,
    ManageRatesRoutingModule,
    DataTablesModule,
    ScrollbarModule
  ],
  declarations: [
    ManageRatesComponent,
    SeaFreightComponent,
    AirFreightComponent,
    GroundTransportComponent,
    WarehouseComponent,
    LoaderComponent
  ],
  providers: [SeaFreightService]
})
export class ManageRatesModule { }
