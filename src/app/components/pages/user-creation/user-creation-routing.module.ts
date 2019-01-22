import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserGuard } from './user.guard';
import { RegistrationComponent } from './basic-info/registration-form/registration.component';
import { OtpconfirmationComponent } from './basic-info/otpconfirmation/otpconfirmation.component';
import { ProfilecompletionComponent } from './company-info/business-info/profilecompletion/profilecompletion.component';
import { CreatePasswordComponent } from './basic-info/create-password/create-password.component';
import { UserCreationComponent } from './user-creation.component';
import { BusinessInfoComponent } from './basic-info/business-info/business-info.component';
import { BusinessSetupComponent } from './company-info/shipping-info/business-setup/business-setup.component';
import { SetupMapComponent } from './company-info/shipping-info/setup-map/setup-map.component';
import { ShippingLinesComponent } from './company-info/shipping-info/shipping-lines/shipping-lines.component';
import { SetupWarehouseComponent } from './company-info/setup-warehouse/setup-warehouse.component';
import { WarehouseListComponent } from './company-info/setup-warehouse/warehouse-list/warehouse-list.component';
import { WarehouseAddRatesComponent } from './company-info/setup-warehouse/warehouse-add-rates/warehouse-add-rates.component';

const routes: Routes = [
{
path: '',
component: UserCreationComponent,
children: [
{ path: 'registration', component: RegistrationComponent},
{ path: 'otp/:keys', component: OtpconfirmationComponent, canActivate: [UserGuard] },
{ path: 'password/:keys', component: CreatePasswordComponent},
{ path: 'business-info', component: BusinessInfoComponent},
{ path: 'business-profile', component: BusinessInfoComponent },
{ path: 'profile-completion', component: ProfilecompletionComponent, canActivate: [UserGuard] },
{ path: 'setup-warehouse', component: SetupWarehouseComponent, canActivate: [UserGuard] },
{ path: 'warehouse-list', component: WarehouseListComponent },
{ path: 'warehouse-add-rates', component: WarehouseAddRatesComponent },
{ path: '**', redirectTo: 'registration', pathMatch: 'full' }
]
}
];


@NgModule({
imports: [RouterModule.forChild(routes)],
exports: [RouterModule]
})
export class UserCreationRoutingModule { }