import { NgModule, NgModuleFactory, Type } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PagesComponent } from './pages.component';
import { UserDeskModule } from './user-desk/user-desk.module';
import { UserCreationModule } from './user-creation/user-creation.module';
import { Observable } from 'rxjs';

const userDeskModuleChildren = ((): Type<any> | NgModuleFactory<any> | Promise<Type<any>> | Observable<Type<any>> => {
  return UserDeskModule;
})
const userCreationModuleChildren =((): Type<any> | NgModuleFactory<any> | Promise<Type<any>> | Observable<Type<any>> =>{
  return UserCreationModule;
})

const routes: Routes = [
  {
    path: '',
    component: PagesComponent,
    children: [
      { path: 'provider', loadChildren: userDeskModuleChildren },
      { path: '', loadChildren: userCreationModuleChildren }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
