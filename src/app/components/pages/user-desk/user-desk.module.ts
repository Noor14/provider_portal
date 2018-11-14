import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { UserDeskComponent } from './user-desk.component';
import { SideBarComponent } from './side-bar/side-bar.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ViewBookingComponent } from './view-booking/view-booking.component';
import { UserDeskRoutingModule } from './user-desk-routing.module';
import { ViewBookingService } from './view-booking/view-booking.service';
@NgModule({
  imports: [
    CommonModule,
    NgbModule,
    UserDeskRoutingModule
  ],
  declarations: [
    UserDeskComponent, 
    SideBarComponent,
    DashboardComponent,
    ViewBookingComponent
  ],
  providers:[
    ViewBookingService
  ]
})
export class UserDeskModule { }
