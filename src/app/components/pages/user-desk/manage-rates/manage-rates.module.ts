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

@NgModule({
  imports: [
    CommonModule,
    ManageRatesRoutingModule,
    DataTablesModule
  ],
  declarations: [
    ManageRatesComponent,
    SeaFreightComponent,
    AirFreightComponent,
    GroundTransportComponent,
    WarehouseComponent
  ],
  providers: [SeaFreightService]
})
export class ManageRatesModule { }
