import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserGuard } from './user.guard';
import { RegistrationComponent } from './basic-info/registration-form/registration.component';
import { OtpconfirmationComponent } from './basic-info/otpconfirmation/otpconfirmation.component';
import { ProfilecompletionComponent } from './company-info/business-info/profilecompletion/profilecompletion.component';
import { CreatePasswordComponent } from './basic-info/create-password/create-password.component';
import { UserCreationComponent } from './user-creation.component';
import { BusinessInfoComponent } from './company-info/business-info/business-info.component';
import { BusinessSetupComponent } from './company-info/shipping-info/business-setup/business-setup.component';
import { SetupMapComponent } from './company-info/shipping-info/setup-map/setup-map.component';
import { ShippingLinesComponent } from './company-info/shipping-info/shipping-lines/shipping-lines.component';
import { SetupWarehouseComponent } from './company-info/setup-warehouse/setup-warehouse.component';
import { WarehouseListComponent } from './company-info/setup-warehouse/warehouse-list/warehouse-list.component';

const routes: Routes = [
{
path: '',
component: UserCreationComponent,
children: [
{ path: 'registration', component: RegistrationComponent, canActivate: [UserGuard] },
{ path: 'otp/:keys', component: OtpconfirmationComponent, canActivate: [UserGuard] },
{ path: 'password/:keys', component: CreatePasswordComponent, canActivate: [UserGuard] },
{ path: 'business-profile', component: BusinessInfoComponent, canActivate: [UserGuard] },
{ path: 'profile-completion', component: ProfilecompletionComponent, canActivate: [UserGuard] },
// { path: 'business-setup', component: BusinessSetupComponent },
// { path: 'setup-map', component: SetupMapComponent },
// { path: 'shippinglines', component: ShippingLinesComponent },
    { path: 'setup-warehouse', component: SetupWarehouseComponent },
{ path: 'warehouse-list', component: WarehouseListComponent },
{ path: '**', redirectTo: 'registration', pathMatch: 'full' }
]
}
];


@NgModule({
imports: [RouterModule.forChild(routes)],
exports: [RouterModule]
})
export class UserCreationRoutingModule { }