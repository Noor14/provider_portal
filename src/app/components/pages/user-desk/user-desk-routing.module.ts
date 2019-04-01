import { NgModule, Type, NgModuleFactory } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserGuard } from '../user-creation/user.guard';

import { UserDeskComponent } from './user-desk.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ViewBookingComponent } from './view-booking/view-booking.component';
import { AllBookingsComponent } from './all-bookings/all-bookings.component';
import { ReportsComponent } from './reports/reports.component';
import { SupportComponent } from './support/support.component';
import { DealsComponent } from './deals/deals.component';
import { BillingComponent } from './billing/billing.component';
import { SettingsComponent } from './settings/settings.component';
// import { WarehouseComponent } from './warehouse/warehouse.component';
import { ManageRatesModule } from './manage-rates/manage-rates.module';
import { PaymentResultComponent } from './payment-result/payment-result.component';
import { Observable } from 'rxjs';

export function manageRatesModuleChildren(): Type<any> | NgModuleFactory<any> | Promise<Type<any>> | Observable<Type<any>> {
    return ManageRatesModule;
}
const routes: Routes = [
    {
        path: '',
        component: UserDeskComponent,
        canActivate: [UserGuard],
        children: [
            { path: 'dashboard', component: DashboardComponent },
            { path: 'billing', component: BillingComponent },
            { path: 'allbookings', component: AllBookingsComponent },
            { path: 'reports', component: ReportsComponent },
            { path: 'settings', component: SettingsComponent },
            { path: 'support', component: SupportComponent },
            // { path: 'deals', component: DealsComponent },
            // { path: 'add-warehouse/:id', component: WarehouseComponent },
            { path: 'payment_result', component: PaymentResultComponent },
            { path: 'booking-detail/:id', component: ViewBookingComponent },
            { path: 'manage-rates', loadChildren: manageRatesModuleChildren },
            { path: '**', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    }
];


@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class UserDeskRoutingModule { }
