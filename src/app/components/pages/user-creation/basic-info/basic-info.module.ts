import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AgmCoreModule } from '@agm/core';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RegistrationComponent } from './registration-form/registration.component';
import { OtpconfirmationComponent } from './otpconfirmation/otpconfirmation.component';
import { CreatePasswordComponent } from './create-password/create-password.component';
import { BasicInfoService } from './basic-info.service';
import { BusinessInfoComponent } from './business-info/business-info.component';
import { NgFilesModule } from '../../../../directives/ng-files';
import { UiSwitchModule } from 'ngx-toggle-switch';
import { QuillEditorModule } from 'ngx-quill-editor';

@NgModule({
  imports: [
    CommonModule,
    NgFilesModule,
    HttpClientModule,
    QuillEditorModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyDZ31Nq5gJ_cCvENKL79eeC6x4zBv9oOGU',
      libraries: ["places", "geometry"]
    }),
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    UiSwitchModule
  ],
  declarations: [
    RegistrationComponent,
    OtpconfirmationComponent,
    CreatePasswordComponent,
    BusinessInfoComponent,
  ],
  providers: [
    BasicInfoService
  ] 
})
export class BasicInfoModule { }
