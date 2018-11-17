import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// import { UserGuard } from './user.guard';

import { UserDeskComponent } from './user-desk.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ViewBookingComponent } from './view-booking/view-booking.component';

const routes: Routes = [
    {
        path: '',
        component: UserDeskComponent,
        children: [
            { path: 'dashboard', component: DashboardComponent },
            { path: 'booking-detail/:id', component: ViewBookingComponent },
            { path: '**', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    }
];


@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class UserDeskRoutingModule { }