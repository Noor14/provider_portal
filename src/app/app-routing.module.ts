
import { NgModule, ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router'
import { RegistrationComponent } from './components/user/registration-form/registration.component';
import { OtpconfirmationComponent } from './components/user/otpconfirmation/otpconfirmation.component';
import { CreatePasswordComponent } from './components/user/create-password/create-password.component';


const appRoutes:Routes = [
  { path: '', loadChildren : 'app/components/user/user.module#UserModule'}
]

@NgModule({

  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
