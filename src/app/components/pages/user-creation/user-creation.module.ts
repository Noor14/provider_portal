import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AgmCoreModule } from '@agm/core';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { LeftsidebarComponent } from './leftsidebar/leftsidebar.component';
import { UserGuard } from './user.guard'
import { Interceptor } from '../../../http-interceptors/interceptor';
// import { BookingService } from './booking.service';
import { UserCreationRoutingModule } from './user-creation-routing.module';
import { UserCreationComponent } from './user-creation.component';
import { UserCreationService } from './user-creation.service';
import { BasicInfoModule } from './basic-info/basic-info.module';
import { CompanyInfoModule } from './company-info/company-info.module';
@NgModule({
  imports: [
    CommonModule,
    UserCreationRoutingModule,
    HttpClientModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyBs4tYXYGUA2kDvELgCYcbhYeoVgZCxumg',
      libraries: ["places", "geometry"]
    }),
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    BasicInfoModule,
    CompanyInfoModule
  ],
  declarations: [
    LeftsidebarComponent,
    UserCreationComponent,
    // BookingsComponent,
    // ViewBookingComponent,
  ],
  providers: [
    UserGuard,
    UserCreationService,
    // BookingService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: Interceptor,
      multi: true
    },],
})
export class UserCreationModule { }
