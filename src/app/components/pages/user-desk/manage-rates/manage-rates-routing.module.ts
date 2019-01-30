import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ManageRatesComponent } from './manage-rates.component';
import { SeaFreightComponent } from './sea-freight/sea-freight.component';
import { AirFreightComponent } from './air-freight/air-freight.component';
import { GroundTransportComponent } from './ground-transport/ground-transport.component';
// import { WarehouseComponent } from './warehouse/warehouse.component';

const routes: Routes = [
  {
    path: '',
    component: ManageRatesComponent,
    // canActivate: [UserGuard],
    children: [
      { path: 'sea', component: SeaFreightComponent },
      { path: 'air', component: AirFreightComponent },
      { path: 'ground', component: GroundTransportComponent },
      // { path: 'warehouse', component: WarehouseComponent },
      { path: '**', redirectTo: 'sea', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManageRatesRoutingModule { }
