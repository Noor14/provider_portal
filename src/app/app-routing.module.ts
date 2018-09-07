
import { NgModule, ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router'
import { HeaderComponent } from './Shared/header/header.component';
import { FooterComponent } from './Shared/footer/footer.component';
import { RegistrationComponent } from './user/registration-form/registration.component';
import { OtpconfirmationComponent } from './user/otpconfirmation/otpconfirmation.component';
import { CreatePasswordComponent } from './user/create-password/create-password.component';

const appRoutes:Routes = [
  { path: 'registration', component : RegistrationComponent },
  { path: '', redirectTo : 'registration', pathMatch: 'full' }
]

@NgModule({

  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
