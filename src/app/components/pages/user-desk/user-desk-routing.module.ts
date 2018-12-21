import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserGuard } from '../user-creation/user.guard';

import { UserDeskComponent } from './user-desk.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ViewBookingComponent } from './view-booking/view-booking.component';
import { ManageRatesComponent } from './manage-rates/manage-rates.component';

const routes: Routes = [
    {
        path: '',
        component: UserDeskComponent,
        canActivate: [UserGuard],
        children: [
            { path: 'dashboard', component: DashboardComponent },
            { path: 'booking-detail/:id', component: ViewBookingComponent },
            { path: 'manage-rates', component: ManageRatesComponent },
            { path: '**', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    }
];


@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class UserDeskRoutingModule { }
