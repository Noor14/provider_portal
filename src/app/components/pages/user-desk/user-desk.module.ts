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
import { BookingDialogComponent } from './booking-dialog/booking-dialog.component';
import { FormsModule } from '@angular/forms';
import { NgxEchartsModule } from 'ngx-echarts';
import { DataMapComponent } from './data-map/data-map.component';
import { SharedModule } from '../../../shared/shared.module'
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
    FormsModule,
    NgxEchartsModule,
    SharedModule
  ],
  declarations: [
    UserDeskComponent, 
    SideBarComponent,
    DashboardComponent,
    ViewBookingComponent,
    SearchBookingMode,
    AllBookingsComponent,
    ReportsComponent,
    BookingDialogComponent,
    DataMapComponent
  ],
  providers:[
    ViewBookingService,
    DashboardService,
    UserGuard,
  ],
  entryComponents: [BookingDialogComponent]
})
export class UserDeskModule { }
