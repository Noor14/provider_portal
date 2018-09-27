import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RegistrationComponent } from './registration-form/registration.component';
import { UserComponent } from './user.component';
import { OtpconfirmationComponent } from './otpconfirmation/otpconfirmation.component';
import { UserbusinessComponent } from './userbusiness/userbusiness.component';
import { CreatePasswordComponent } from './create-password/create-password.component';
import { ProfilecompletionComponent } from './profilecompletion/profilecompletion.component';

const routes: Routes = [
    { path: '', 
      component : UserComponent,
      children:[
        { path: 'registration', component : RegistrationComponent },
        { path: 'otp/:keys', component : OtpconfirmationComponent },
        { path: 'password/:keys', component : CreatePasswordComponent },
        { path: 'business-profile', component : UserbusinessComponent },
        { path: 'profile-completion', component : ProfilecompletionComponent },
        { path: '**', redirectTo: 'registration', pathMatch: 'full' }
     ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
