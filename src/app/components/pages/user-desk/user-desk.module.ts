import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { UserDeskComponent } from './user-desk.component';
import { SideBarComponent } from './side-bar/side-bar.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ViewBookingComponent } from './view-booking/view-booking.component';
import { UserDeskRoutingModule } from './user-desk-routing.module';
import { ViewBookingService } from './view-booking/view-booking.service';
import { DashboardService } from './dashboard/dashboard.service';
import { SearchBookingMode } from '../../../constants/dashboardBookingsFilter';
import { AgmCoreModule } from '@agm/core';
import { UserGuard } from '../user-creation/user.guard';
import { AllBookingsComponent } from './all-bookings/all-bookings.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { ReportsComponent } from './reports/reports.component';
import { SupportComponent } from './support/support.component';
import { SupportService } from './support/support.service';
import { DealsComponent } from './deals/deals.component';
import { BillingComponent } from './billing/billing.component';
import { SettingsComponent } from './settings/settings.component';
import { NgxEchartsModule } from 'ngx-echarts';
import { DataMapComponent } from './data-map/data-map.component';
import { SharedModule } from '../../../shared/shared.module';
import { ReportsService } from './reports/reports.service';
import { DataTablesModule } from 'angular-datatables';
import { SearchPipe } from '../../../constants/search.pipe';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { WarehouseComponent } from './warehouse/warehouse.component';
import { BillingService } from './billing/billing.service';
import { NgStepperModule } from '../../../directives/stepper/stepper.module';
@NgModule({
  imports: [
    CommonModule,
    NgbModule,
    UserDeskRoutingModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyBs4tYXYGUA2kDvELgCYcbhYeoVgZCxumg',
      libraries: ["places", "geometry"]
    }),
    NgxPaginationModule,
    NgxEchartsModule,
    SharedModule,
    DataTablesModule,
    FormsModule,
    ReactiveFormsModule,
    NgStepperModule
  ],
  declarations: [
    UserDeskComponent,
    SideBarComponent,
    DashboardComponent,
    ViewBookingComponent,
    SearchBookingMode,
    AllBookingsComponent,
    ReportsComponent,
    SupportComponent,
    DealsComponent,
    BillingComponent,
    SettingsComponent,
    DataMapComponent,
    SearchPipe,
    WarehouseComponent
  ],
  providers: [
    ViewBookingService,
    DashboardService,
    SupportService,
    ReportsService,
    UserGuard,
    BillingService
  ]
})
export class UserDeskModule { }
