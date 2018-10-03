import { NgModule } from '@angular/core';

import {
  NgFilesService,
  NgFilesUtilsService
} from './services';

import {
  NgFilesClickComponent,
  NgFilesDropComponent
} from './components';

@NgModule({
  declarations: [
    NgFilesClickComponent,
    NgFilesDropComponent
  ],
  exports: [
    NgFilesClickComponent,
    NgFilesDropComponent
  ],
  providers: [
    NgFilesService,
    NgFilesUtilsService
  ]
})
export class NgFilesModule {
  // todo: except exports NgFilesUtilsService
}
