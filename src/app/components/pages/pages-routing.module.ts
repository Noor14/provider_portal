import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PagesComponent } from './pages.component';
import { UserDeskModule } from './user-desk/user-desk.module';
import { UserCreationModule } from './user-creation/user-creation.module';


const routes: Routes = [
  {
    path: '',
    component: PagesComponent,
    children: [
      { path: 'provider', loadChildren: () => UserDeskModule },
      { path: '', loadChildren: () => UserCreationModule }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
