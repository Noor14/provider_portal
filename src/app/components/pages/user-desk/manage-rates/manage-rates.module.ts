import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManageRatesRoutingModule } from './manage-rates-routing.module';
import { ManageRatesComponent } from './manage-rates.component';
import { SeaFreightComponent } from './sea-freight/sea-freight.component';
import { DataTablesModule } from 'angular-datatables';

@NgModule({
  imports: [
    CommonModule,
    ManageRatesRoutingModule,
    DataTablesModule
  ],
  declarations: [
    ManageRatesComponent,
    SeaFreightComponent
  ],
  providers: []
})
export class ManageRatesModule { }
