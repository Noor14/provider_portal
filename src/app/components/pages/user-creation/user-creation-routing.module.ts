import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserGuard } from './user.guard';
import { RegistrationComponent } from './basic-info/registration-form/registration.component';
import { OtpconfirmationComponent } from './basic-info/otpconfirmation/otpconfirmation.component';
import { CreatePasswordComponent } from './basic-info/create-password/create-password.component';
import { UserCreationComponent } from './user-creation.component';
import { BusinessInfoComponent } from './basic-info/business-info/business-info.component';
const routes: Routes = [
{
path: '',
component: UserCreationComponent,
children: [
{ path: 'registration', component: RegistrationComponent, canActivate: [UserGuard]},
{ path: 'otp/:keys', component: OtpconfirmationComponent, canActivate: [UserGuard] },
{ path: 'password/:keys', component: CreatePasswordComponent, canActivate: [UserGuard]},
{ path: 'business-info', component: BusinessInfoComponent},
{ path: '**', redirectTo: 'registration', pathMatch: 'full' }
]
}
];


@NgModule({
imports: [RouterModule.forChild(routes)],
exports: [RouterModule]
})
export class UserCreationRoutingModule { }