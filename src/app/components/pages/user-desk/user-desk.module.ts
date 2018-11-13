import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserDeskComponent } from './user-desk.component';
import { SideBarComponent } from './side-bar/side-bar.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ViewBookingComponent } from './view-booking/view-booking.component';
import { BookingService } from './booking.service';
import { UserDeskRoutingModule } from './user-desk-routing.module';
@NgModule({
  imports: [
    CommonModule,
    UserDeskRoutingModule
  ],
  declarations: [
    UserDeskComponent, 
    SideBarComponent,
    DashboardComponent,
    ViewBookingComponent
  ],
  providers:[
    BookingService
  ]
})
export class UserDeskModule { }
