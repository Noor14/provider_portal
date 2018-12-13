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
@NgModule({
  imports: [
    CommonModule,
    NgbModule,
    UserDeskRoutingModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyBs4tYXYGUA2kDvELgCYcbhYeoVgZCxumg',
      libraries: ["places", "geometry"]
    }),
  ],
  declarations: [
    UserDeskComponent, 
    SideBarComponent,
    DashboardComponent,
    ViewBookingComponent,
    SearchBookingMode,
  ],
  providers:[
    ViewBookingService,
    DashboardService,
    UserGuard,
  ]
})
export class UserDeskModule { }
