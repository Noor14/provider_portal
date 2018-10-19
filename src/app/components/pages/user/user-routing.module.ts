import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RegistrationComponent } from './user-creation/registration-form/registration.component';
import { UserComponent } from './user.component';
import { OtpconfirmationComponent } from './user-creation/otpconfirmation/otpconfirmation.component';
import { BusinessInfoComponent } from './user-business/business-info/business-info.component';
import { CreatePasswordComponent } from './user-creation/create-password/create-password.component';
import { ProfilecompletionComponent } from './user-business/business-info/profilecompletion/profilecompletion.component';
import { ShippingInfoComponent } from './user-business/shipping-info/shipping-info.component';
import { BookingsComponent } from './bookings/bookings.component';


const routes: Routes = [
    { path: '', 
      component : UserComponent,
      children:[
        { path: 'registration', component : RegistrationComponent },
        { path: 'otp/:keys', component : OtpconfirmationComponent },
        { path: 'password/:keys', component : CreatePasswordComponent },
        { path: 'business-profile', component : BusinessInfoComponent },
        { path: 'business-setup', component : ShippingInfoComponent },
        { path: 'profile-completion', component : ProfilecompletionComponent },
        { path: 'bookings', component :BookingsComponent },
        { path: '**', redirectTo: 'registration', pathMatch: 'full' }
     ]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
