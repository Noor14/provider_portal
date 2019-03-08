import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ManageRatesRoutingModule } from './manage-rates-routing.module';
import { ManageRatesComponent } from './manage-rates.component';
import { SeaFreightComponent } from './sea-freight/sea-freight.component';
import { DataTablesModule } from 'angular-datatables';
import { AirFreightComponent } from './air-freight/air-freight.component';
import { GroundTransportComponent } from './ground-transport/ground-transport.component';
import { SeaFreightService } from './sea-freight/sea-freight.service';
import { ScrollbarModule } from 'ngx-scrollbar';
import { SharedModule } from '../../../../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { UniquePipe } from '../../../../constants/unique-recordFilter';
import { SearchPipe } from '../../../../constants/search.pipe';
import { CheckboxPipe } from '../../../../constants/checkbox.pipe';
import { AirFreightService } from './air-freight/air-freight.service';
import { GroundTransportService } from './ground-transport/ground-transport.service';
import { ManageRatesService } from './manage-rates.service';
import { WarehouseListComponent } from './warehouse-list/warehouse-list.component';
import { WarehouseService } from './warehouse-list/warehouse.service';
import { LightboxModule } from 'ngx-lightbox';
import { NgxPaginationModule } from 'ngx-pagination';
import { UiSwitchModule } from 'ngx-toggle-switch';
import { QuillEditorModule } from 'ngx-quill-editor';
@NgModule({
  imports: [
    CommonModule,
    ManageRatesRoutingModule,
    DataTablesModule,
    ScrollbarModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    LightboxModule,
    NgxPaginationModule,
    UiSwitchModule,
    QuillEditorModule

  ],
  declarations: [
    ManageRatesComponent,
    SeaFreightComponent,
    AirFreightComponent,
    GroundTransportComponent,
    WarehouseListComponent,
    UniquePipe,
    SearchPipe,
    CheckboxPipe

  ],
  providers: [SeaFreightService, AirFreightService, GroundTransportService, ManageRatesService, WarehouseService]
})
export class ManageRatesModule { }
