import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ManageRatesComponent } from './manage-rates.component';
import { SeaFreightComponent } from './sea-freight/sea-freight.component';

const routes: Routes = [
  {
    path: '',
    component: ManageRatesComponent,
    // canActivate: [UserGuard],
    children: [
      { path: 'sea', component: SeaFreightComponent },
      { path: '**', redirectTo: 'sea', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManageRatesRoutingModule { }
