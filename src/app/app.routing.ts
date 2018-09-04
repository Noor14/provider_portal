import { Routes, RouterModule, PreloadAllModules  } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { RegistrationComponent } from './user/registration/registration.component';


export const routes: Routes = [
  { path: '', redirectTo : 'registration', pathMatch: 'full' },
  { path: 'registration', component : RegistrationComponent }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(routes, {
    // preloadingStrategy: PreloadAllModules,
   // useHash: true
});
