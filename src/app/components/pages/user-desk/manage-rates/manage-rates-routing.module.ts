import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ManageRatesComponent } from './manage-rates.component';
import { SeaFreightComponent } from './sea-freight/sea-freight.component';
import { AirFreightComponent } from './air-freight/air-freight.component';
import { GroundTransportComponent } from './ground-transport/ground-transport.component';
import { WarehouseListComponent } from './warehouse-list/warehouse-list.component';
import { ServiceGuard } from './service.guard';

const routes: Routes = [
  {
    path: '',
    component: ManageRatesComponent,
    children: [
      { path: 'sea', component: SeaFreightComponent, canActivate: [ServiceGuard] },
      { path: 'air', component: AirFreightComponent, canActivate: [ServiceGuard] },
      { path: 'ground', component: GroundTransportComponent, canActivate: [ServiceGuard] },
      { path: 'warehouse', component: WarehouseListComponent, canActivate: [ServiceGuard] },
      { path: '**', redirectTo: 'sea', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManageRatesRoutingModule { }
