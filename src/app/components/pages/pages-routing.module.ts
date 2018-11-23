import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PagesComponent } from './pages.component';
import { OnBoardingComponent } from './user-creation/basic-info/on-boarding/on-boarding.component';

const routes: Routes = [
  {
    path: '',
    component: PagesComponent,
    children: [
      { path: 'on-boarding', component: OnBoardingComponent },
      { path: 'provider', loadChildren: 'app/components/pages/user-desk/user-desk.module#UserDeskModule' }, 
      { path: '**', redirectTo: 'on-boarding', pathMatch: 'full' },
      { path: '', loadChildren: 'app/components/pages/user-creation/user-creation.module#UserCreationModule' }, 
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
