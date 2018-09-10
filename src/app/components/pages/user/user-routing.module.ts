import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RegistrationComponent } from './registration-form/registration.component';
import { UserComponent } from './user.component';
import { OtpconfirmationComponent } from './otpconfirmation/otpconfirmation.component';
import { BusinessDetailComponent } from './business-detail/business-detail.component';

const routes: Routes = [
    { path: '', 
      component : UserComponent,
      children:[
        { path: 'registration', component : RegistrationComponent },
        { path: 'otp', component : OtpconfirmationComponent },
        { path: 'business-profile', component : BusinessDetailComponent },
        { path: '**', redirectTo: 'registration', pathMatch: 'full' }
     ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
