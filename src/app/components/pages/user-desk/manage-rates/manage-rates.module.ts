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
import { AirFreightService } from './air-freight/air-freight.service';
import { GroundTransportService } from './ground-transport/ground-transport.service';
import { EditorModule } from '@tinymce/tinymce-angular';
import { ManageRatesService } from './manage-rates.service';
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
    EditorModule
  ],
  declarations: [
    ManageRatesComponent,
    SeaFreightComponent,
    AirFreightComponent,
    GroundTransportComponent,
    UniquePipe
  ],
  providers: [SeaFreightService, AirFreightService, GroundTransportService, ManageRatesService]
})
export class ManageRatesModule { }
