import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ManageRatesComponent } from './manage-rates.component';
import { SeaFreightComponent } from './sea-freight/sea-freight.component';
import { AirFreightComponent } from './air-freight/air-freight.component';
import { GroundTransportComponent } from './ground-transport/ground-transport.component';
import { WarehouseListComponent } from './warehouse-list/warehouse-list.component';
import { ServicesGuard } from './services.guard';

const routes: Routes = [
  {
    path: '',
    component: ManageRatesComponent,
    // canActivate: [ServicesGuard],
    children: [
      { path: 'sea', component: SeaFreightComponent, canActivate: [ServicesGuard] },
      { path: 'air', component: AirFreightComponent, canActivate: [ServicesGuard] },
      { path: 'ground', component: GroundTransportComponent, canActivate: [ServicesGuard] },
      { path: 'warehouse', component: WarehouseListComponent, canActivate: [ServicesGuard] },
      { path: '**', redirectTo: 'sea', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManageRatesRoutingModule { }
