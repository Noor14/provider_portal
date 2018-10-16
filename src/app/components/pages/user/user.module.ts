import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserRoutingModule } from './user-routing.module';
import { Routes, RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AgmCoreModule } from '@agm/core';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { LeftsidebarComponent } from './leftsidebar/leftsidebar.component';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { UserComponent } from './user.component';
import { UserService } from './user.service';
import { UserCreationModule } from './user-creation/user-creation.module';
import { UserBusinessModule } from './user-business/user-business.module';


@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyBs4tYXYGUA2kDvELgCYcbhYeoVgZCxumg',
      libraries: ["places","geometry"]
    }),
    NgCircleProgressModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    UserRoutingModule,
    UserCreationModule,
    UserBusinessModule
  ],
  declarations: [
    LeftsidebarComponent,
    UserComponent,
  ],
  providers: [UserService],
})
export class UserModule { }
