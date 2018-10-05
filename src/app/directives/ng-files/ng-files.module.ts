import { NgModule } from '@angular/core';

import {
  NgFilesService,
  NgFilesUtilsService
} from './services';

import {
  NgFilesClickComponent,
  NgFilesDropComponent,
  NgFilesDragNUploadComponent 
} from './components';

@NgModule({
  declarations: [
    NgFilesClickComponent,
    NgFilesDropComponent,
    NgFilesDragNUploadComponent
  ],
  exports: [
    NgFilesDragNUploadComponent, 
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
