import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AgmCoreModule } from '@agm/core';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { UserCreationComponent } from './user-creation.component';
import { RegistrationComponent } from './registration-form/registration.component';
import { OtpconfirmationComponent } from './otpconfirmation/otpconfirmation.component';
import { CreatePasswordComponent } from './create-password/create-password.component';
import { UserCreationService } from './user-creation.service';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyBs4tYXYGUA2kDvELgCYcbhYeoVgZCxumg',
      libraries: ["places","geometry"]
    }),
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
  ],
  declarations: [
    UserCreationComponent,
    RegistrationComponent,
    OtpconfirmationComponent,
    CreatePasswordComponent
    ],
   providers:[
     UserCreationService
   ] 
})
export class UserCreationModule { }
