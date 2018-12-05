
import { NgModule, ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


const appRoutes:Routes = [
  { path: '', loadChildren : 'app/components/pages/pages.module#PagesModule'}
]

@NgModule({

  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
