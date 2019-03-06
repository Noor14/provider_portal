
import { NgModule, ModuleWithProviders, Type, NgModuleFactory } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PagesModule } from './components/pages/pages.module';
import { Observable } from 'rxjs';

export function pagesModuleChildren(): Type<any> | NgModuleFactory<any> | Promise<Type<any>> | Observable<Type<any>> {
  return PagesModule;
}
const appRoutes:Routes = [
  { path: '', loadChildren: pagesModuleChildren}
]

@NgModule({

  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
