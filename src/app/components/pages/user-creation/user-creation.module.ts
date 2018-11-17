import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { LeftsidebarComponent } from './leftsidebar/leftsidebar.component';
import { UserGuard } from './user.guard'
import { Interceptor } from '../../../http-interceptors/interceptor';
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
