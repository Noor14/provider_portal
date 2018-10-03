import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserRoutingModule } from './user-routing.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RegistrationComponent } from './registration-form/registration.component';
import { LeftsidebarComponent } from './leftsidebar/leftsidebar.component';
import { OtpconfirmationComponent } from './otpconfirmation/otpconfirmation.component';
import { CreatePasswordComponent } from './create-password/create-password.component';
import { AgmCoreModule } from '@agm/core';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Routes, RouterModule } from '@angular/router';
import { UserComponent } from './user.component';
import { BusinessDetailComponent } from './userbusiness/business-detail/business-detail.component'
import { UserService } from './user.service';
import { DirectorinfoComponent } from './userbusiness/directorinfo/directorinfo.component';
import { UserbusinessComponent } from './userbusiness/userbusiness.component';
import { ProfilecompletionComponent } from './profilecompletion/profilecompletion.component';
import { SlidePanelComponent } from '../../../directives/slide-panel/slide-panel.component';
import { NgFilesModule } from '../../../directives/ng-files/';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    NgFilesModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyBs4tYXYGUA2kDvELgCYcbhYeoVgZCxumg&libraries=geometry',
      libraries: ["places"]
    }),
    NgCircleProgressModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    UserRoutingModule
  ],
  declarations: [
    SlidePanelComponent,
    RegistrationComponent,
    LeftsidebarComponent,
    OtpconfirmationComponent,
    CreatePasswordComponent,
    BusinessDetailComponent,
    UserComponent,
    DirectorinfoComponent,
    UserbusinessComponent,
    ProfilecompletionComponent
  ],
  providers: [UserService],
})
export class UserModule { }
