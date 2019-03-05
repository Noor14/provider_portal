
import { NgModule, ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PagesModule } from './components/pages/pages.module';


const appRoutes:Routes = [
  { path: '', loadChildren: () => PagesModule}

]

@NgModule({

  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
