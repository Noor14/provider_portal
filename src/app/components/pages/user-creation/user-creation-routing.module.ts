import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// import { BookingsComponent } from './bookings/bookings.component';
// import { ViewBookingComponent } from './view-booking/view-booking.component';
import { UserGuard } from './user.guard';
import { RegistrationComponent } from './basic-info/registration-form/registration.component';
import { OtpconfirmationComponent } from './basic-info/otpconfirmation/otpconfirmation.component';
import { ProfilecompletionComponent } from './comapny-info/business-info/profilecompletion/profilecompletion.component';
import { CreatePasswordComponent } from './basic-info/create-password/create-password.component';
import { UserCreationComponent } from './user-creation.component';
import { ShippingInfoComponent } from './comapny-info/shipping-info/shipping-info.component';
import { BusinessInfoComponent } from './comapny-info/business-info/business-info.component';

const routes: Routes = [
  {
    path: '',
    component: UserCreationComponent,
    children: [
      { path: 'registration', component: RegistrationComponent },
      { path: 'otp/:keys', component: OtpconfirmationComponent, canActivate: [UserGuard] },
      { path: 'password/:keys', component: CreatePasswordComponent, canActivate: [UserGuard] },
      { path: 'business-profile', component: BusinessInfoComponent, canActivate: [UserGuard] },
      { path: 'profile-completion', component: ProfilecompletionComponent, canActivate: [UserGuard] },
      { path: 'business-setup', component: ShippingInfoComponent },
      // { path: 'bookings', component: BookingsComponent },
      // { path: 'view-booking/:id', component: ViewBookingComponent },
      { path: '**', redirectTo: 'registration', pathMatch: 'full' }
    ]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserCreationRoutingModule { }
